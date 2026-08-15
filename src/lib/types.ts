// Central TypeScript types for the family tree application

export type UserRole = 'ADMIN' | 'FAMILY_MEMBER' | 'VIEWER';

export type Gender = 'male' | 'female' | 'unknown';

export type RelationshipType = 'parent' | 'child' | 'spouse';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'clarification_needed';

export type AuditAction = 'CREATE_PERSON' | 'UPDATE_PERSON' | 'DELETE_PERSON' | 'MERGE_PERSON' | 'CREATE_RELATIONSHIP' | 'DELETE_RELATIONSHIP' | 'APPROVE_REQUEST' | 'REJECT_REQUEST' | 'INVITE_USER' | 'CLAIM_PROFILE';

// ─── User (website account) ────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  profilePhoto?: string;
  createdAt: string; // ISO string
  lastLoginAt: string;
  role: UserRole;
  linkedPersonId?: string; // Person record claimed by this user
  claimStatus?: 'pending' | 'approved';
  invitedBy?: string; // userId of inviter
}

// ─── Person (genealogy record) ────────────────────────────────────────────────
export interface Person {
  id: string;
  fullName: string;
  gender: Gender;
  dateOfBirth?: string;
  dateOfDeath?: string;
  birthPlace?: string;
  currentLocation?: string;
  photoUrl?: string;
  bio?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // userId
  updatedBy: string; // userId
  isLiving: boolean;
  isPlaceholder: boolean; // true when name is not known yet
  isDeleted?: boolean; // soft delete
  linkedUserId?: string; // user who claimed this profile
}

// ─── Relationship ─────────────────────────────────────────────────────────────
export interface Relationship {
  id: string;
  personA: string; // personId
  personB: string; // personId
  relationshipType: RelationshipType;
  // For parent: personA is parent, personB is child
  // For spouse: personA and personB are spouses
  createdAt: string;
  createdBy: string; // userId
  status: 'approved' | 'pending';
}

// ─── Change Request ───────────────────────────────────────────────────────────
export interface ChangeRequest {
  id: string;
  type: 'UPDATE_PERSON' | 'ADD_PERSON' | 'ADD_RELATIONSHIP' | 'CLAIM_PROFILE';
  personId?: string;
  requestedBy: string; // userId
  requestedByName: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  reason?: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  // For ADD_PERSON requests
  newPersonData?: Partial<Person>;
  newRelationship?: Partial<Relationship>;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  action: AuditAction;
  personId?: string;
  personName?: string;
  performedBy: string; // userId
  performedByName: string;
  details: string;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action_required';
  link?: string;
  read: boolean;
  createdAt: string;
}

// ─── Invitation ───────────────────────────────────────────────────────────────
export interface Invitation {
  id: string; // also used as token in /join/[token]
  email?: string;
  createdBy: string; // admin userId
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  usedBy?: string; // userId who used it
  status: 'active' | 'used' | 'expired' | 'revoked';
}

// ─── Family Settings ──────────────────────────────────────────────────────────
export interface FamilySettings {
  id: string;
  familyName: string;
  rootPersonId: string; // Kassim Pillai's ID
  privacyLevel: 'private' | 'family_only' | 'public';
  requireApprovalForEdits: boolean;
  allowSelfRegistration: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── UI helper types ──────────────────────────────────────────────────────────
export interface TreeNode {
  person: Person;
  children: TreeNode[];
  spouses: Person[];
  generation: number;
  x?: number;
  y?: number;
}

export interface RelationshipLabel {
  label: string;
  degree?: number;
}

export interface SearchResult {
  person: Person;
  pathFromRoot: string[]; // ancestor names
  relationshipLabel?: string;
}

export interface FamilyStats {
  totalMembers: number;
  livingMembers: number;
  deceasedMembers: number;
  placeholderMembers: number;
  generations: number;
  branches: number;
  pendingRequests: number;
  recentlyAdded: Person[];
}
