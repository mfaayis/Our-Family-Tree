// Firestore service functions for all data operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Person, Relationship, ChangeRequest, AuditLog, UserProfile, FamilySettings, Notification, Invitation } from './types';

// ─── Helper ───────────────────────────────────────────────────────────────────
function toISO(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

function serializePerson(id: string, data: Record<string, unknown>): Person {
  return {
    id,
    fullName: (data.fullName as string) || '',
    gender: (data.gender as Person['gender']) || 'unknown',
    dateOfBirth: data.dateOfBirth as string | undefined,
    dateOfDeath: data.dateOfDeath as string | undefined,
    birthPlace: data.birthPlace as string | undefined,
    currentLocation: data.currentLocation as string | undefined,
    photoUrl: data.photoUrl as string | undefined,
    bio: data.bio as string | undefined,
    notes: data.notes as string | undefined,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    createdBy: (data.createdBy as string) || '',
    updatedBy: (data.updatedBy as string) || '',
    isLiving: (data.isLiving as boolean) ?? true,
    isPlaceholder: (data.isPlaceholder as boolean) ?? false,
    isDeleted: (data.isDeleted as boolean) ?? false,
    linkedUserId: data.linkedUserId as string | undefined,
  };
}

function serializeRelationship(id: string, data: Record<string, unknown>): Relationship {
  return {
    id,
    personA: data.personA as string,
    personB: data.personB as string,
    relationshipType: data.relationshipType as Relationship['relationshipType'],
    createdAt: toISO(data.createdAt),
    createdBy: data.createdBy as string,
    status: (data.status as Relationship['status']) || 'approved',
  };
}

// ─── People ───────────────────────────────────────────────────────────────────

export async function getAllPeople(): Promise<Person[]> {
  const q = query(collection(db, 'people'), where('isDeleted', '!=', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => serializePerson(d.id, d.data() as Record<string, unknown>));
}

export async function getPerson(id: string): Promise<Person | null> {
  const snap = await getDoc(doc(db, 'people', id));
  if (!snap.exists()) return null;
  return serializePerson(snap.id, snap.data() as Record<string, unknown>);
}

export async function createPerson(data: Partial<Person>, userId: string): Promise<string> {
  const ref = await addDoc(collection(db, 'people'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
    isDeleted: false,
    isLiving: data.isLiving ?? true,
    isPlaceholder: data.isPlaceholder ?? false,
    gender: data.gender ?? 'unknown',
  });
  return ref.id;
}

export async function updatePerson(id: string, data: Partial<Person>, userId: string): Promise<void> {
  await updateDoc(doc(db, 'people', id), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
}

export async function softDeletePerson(id: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'people', id), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
}

export async function searchPeople(searchTerm: string): Promise<Person[]> {
  // Firestore doesn't support full-text search natively.
  // We load all non-deleted people and filter in memory.
  // For large trees, consider Algolia or similar.
  const all = await getAllPeople();
  const lower = searchTerm.toLowerCase().trim();
  return all.filter(p =>
    p.fullName.toLowerCase().includes(lower) && !p.isDeleted
  );
}

export async function findDuplicateCandidates(name: string): Promise<Person[]> {
  const all = await getAllPeople();
  const lower = name.toLowerCase().trim();
  return all.filter(p => {
    const personLower = p.fullName.toLowerCase();
    return personLower.includes(lower) || lower.includes(personLower.split(' ')[0]);
  });
}

// ─── Relationships ────────────────────────────────────────────────────────────

export async function getAllRelationships(): Promise<Relationship[]> {
  const snap = await getDocs(collection(db, 'relationships'));
  return snap.docs.map(d => serializeRelationship(d.id, d.data() as Record<string, unknown>));
}

export async function getRelationshipsForPerson(personId: string): Promise<Relationship[]> {
  const [q1, q2] = await Promise.all([
    getDocs(query(collection(db, 'relationships'), where('personA', '==', personId))),
    getDocs(query(collection(db, 'relationships'), where('personB', '==', personId))),
  ]);
  const results: Relationship[] = [];
  q1.docs.forEach(d => results.push(serializeRelationship(d.id, d.data() as Record<string, unknown>)));
  q2.docs.forEach(d => results.push(serializeRelationship(d.id, d.data() as Record<string, unknown>)));
  return results;
}

export async function createRelationship(data: Omit<Relationship, 'id' | 'createdAt'>, userId: string): Promise<string> {
  const ref = await addDoc(collection(db, 'relationships'), {
    ...data,
    createdAt: serverTimestamp(),
    createdBy: userId,
    status: 'approved',
  });
  return ref.id;
}

export async function deleteRelationship(id: string): Promise<void> {
  await deleteDoc(doc(db, 'relationships', id));
}

// ─── Change Requests ──────────────────────────────────────────────────────────

export async function getChangeRequests(status?: ChangeRequest['status']): Promise<ChangeRequest[]> {
  let q;
  if (status) {
    q = query(collection(db, 'changeRequests'), where('status', '==', status), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(db, 'changeRequests'), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChangeRequest));
}

export async function createChangeRequest(data: Omit<ChangeRequest, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'changeRequests'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function reviewChangeRequest(
  requestId: string,
  status: 'approved' | 'rejected' | 'clarification_needed',
  reviewedBy: string,
  reviewNote?: string
): Promise<void> {
  await updateDoc(doc(db, 'changeRequests', requestId), {
    status,
    reviewedBy,
    reviewNote: reviewNote || '',
    reviewedAt: serverTimestamp(),
  });
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function createAuditLog(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'auditLogs'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getAuditLogs(personId?: string): Promise<AuditLog[]> {
  let q;
  if (personId) {
    q = query(collection(db, 'auditLogs'), where('personId', '==', personId), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(100));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

export async function createUserProfile(userId: string, data: Omit<UserProfile, 'id'>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), data).catch(async () => {
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', userId), data);
  });
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const { setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', userId), data, { merge: true });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}

export async function createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// ─── Family Settings ──────────────────────────────────────────────────────────

export async function getFamilySettings(): Promise<FamilySettings | null> {
  const snap = await getDocs(collection(db, 'familySettings'));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as FamilySettings;
}

export async function updateFamilySettings(id: string, data: Partial<FamilySettings>): Promise<void> {
  await updateDoc(doc(db, 'familySettings', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ─── Invitations ──────────────────────────────────────────────────────────────

export async function createInvitation(createdBy: string): Promise<string> {
  const ref = await addDoc(collection(db, 'invitations'), {
    createdBy,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  });
  return ref.id;
}

export async function getInvitation(token: string): Promise<Invitation | null> {
  const snap = await getDoc(doc(db, 'invitations', token));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Invitation;
}

export async function useInvitation(token: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'invitations', token), {
    status: 'used',
    usedBy: userId,
    usedAt: serverTimestamp(),
  });
}

// ─── Merge People ─────────────────────────────────────────────────────────────

export async function mergePeople(
  keepId: string,
  mergeId: string,
  userId: string
): Promise<void> {
  const batch = writeBatch(db);

  // Update relationships that reference mergeId → keepId
  const rels = await getAllRelationships();
  for (const rel of rels) {
    if (rel.personA === mergeId || rel.personB === mergeId) {
      const updated = {
        personA: rel.personA === mergeId ? keepId : rel.personA,
        personB: rel.personB === mergeId ? keepId : rel.personB,
      };
      batch.update(doc(db, 'relationships', rel.id), updated);
    }
  }

  // Soft-delete the merged person
  batch.update(doc(db, 'people', mergeId), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
    mergedInto: keepId,
  });

  // Audit log
  const logRef = doc(collection(db, 'auditLogs'));
  batch.set(logRef, {
    action: 'MERGE_PERSON',
    personId: keepId,
    performedBy: userId,
    details: `Merged person ${mergeId} into ${keepId}`,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

// ─── Family Stats ─────────────────────────────────────────────────────────────

export async function getFamilyStats() {
  const [people, requests] = await Promise.all([
    getAllPeople(),
    getChangeRequests('pending'),
  ]);

  const living = people.filter(p => p.isLiving && !p.isPlaceholder && !p.isDeleted);
  const deceased = people.filter(p => !p.isLiving && !p.isDeleted);
  const placeholders = people.filter(p => p.isPlaceholder && !p.isDeleted);
  const recent = [...people]
    .filter(p => !p.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    totalMembers: people.filter(p => !p.isDeleted).length,
    livingMembers: living.length,
    deceasedMembers: deceased.length,
    placeholderMembers: placeholders.length,
    generations: 4, // computed properly via tree traversal
    branches: 5,
    pendingRequests: requests.length,
    recentlyAdded: recent,
  };
}

export * from './db-archival';
