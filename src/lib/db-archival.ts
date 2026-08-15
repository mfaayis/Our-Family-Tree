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
} from 'firebase/firestore';
import { db } from './firebase';
import type { Story, TimelineEvent, PhotoAsset } from './types';

// ─── Stories ──────────────────────────────────────────────────────────────────
export async function getStories(): Promise<Story[]> {
  const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
}

export async function createStory(data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'stories'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStory(id: string, data: Partial<Story>): Promise<void> {
  await updateDoc(doc(db, 'stories', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'stories', id));
}

// ─── Timeline Events ─────────────────────────────────────────────────────────
export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const q = query(collection(db, 'timelineEvents'), orderBy('year', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent));
}

export async function createTimelineEvent(data: Omit<TimelineEvent, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'timelineEvents'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteTimelineEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'timelineEvents', id));
}

// ─── Photo Assets ─────────────────────────────────────────────────────────────
export async function getPhotos(): Promise<PhotoAsset[]> {
  const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PhotoAsset));
}

export async function createPhoto(data: Omit<PhotoAsset, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'photos'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deletePhoto(id: string): Promise<void> {
  await deleteDoc(doc(db, 'photos', id));
}
