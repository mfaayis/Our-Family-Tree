// Seed script for Kassim Pillai family tree
// Run with: node --experimental-vm-modules seed.mjs
// Or: npx ts-node --esm src/scripts/seed.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, addDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';

// ─── Firebase Config ──────────────────────────────────────────────────────────
// Set these in environment before running
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Stable IDs ───────────────────────────────────────────────────────────────
// Using stable string IDs so re-running seed is idempotent
const IDS = {
  // Generation 0 (Root)
  kassim_father: 'person_kassim_father',
  kassim_mother: 'person_kassim_mother',

  // Generation 1 (Kassim Pillai & siblings)
  kassim_pillai: 'person_kassim_pillai',

  // Generation 2 (Children of Kassim Pillai)
  nassir: 'person_nassir',
  nahas: 'person_nahas',
  naseeha: 'person_naseeha',
  naseeja: 'person_naseeja',
  nabeesath: 'person_nabeesath',

  // Generation 2 (Nassir's children)
  muhammad_fayis: 'person_muhammad_fayis',
  farhan_nj: 'person_farhan_nj',
  fathima_kn: 'person_fathima_kn',

  // Generation 2 (Nahas's children — placeholders)
  nahas_son: 'person_nahas_son_placeholder',
  nahas_daughter: 'person_nahas_daughter_placeholder',

  // Generation 2 (Naseeha's children)
  shafeek: 'person_shafeek',
  siyad_n: 'person_siyad_n',
  shemi: 'person_shemi',

  // Generation 3 (Shafeek's children)
  ahdiya: 'person_ahdiya',
  ahmed: 'person_ahmed',
  adam: 'person_adam',

  // Generation 2 (Naseeja's children)
  jahamkeer: 'person_jahamkeer',
  nathiya: 'person_nathiya',
  najiya: 'person_najiya',

  // Generation 3 (Jahamkeer's child)
  inarah: 'person_inarah',

  // Generation 3 (Nathiya's children)
  ramsan: 'person_ramsan',
  ramees: 'person_ramees',

  // Generation 3 (Najiya's children)
  haiza: 'person_haiza',
  ayan: 'person_ayan',

  // Generation 2 (Nabeesath's children)
  safeer: 'person_safeer',
  bismina: 'person_bismina',
  sufina: 'person_sufina',

  // Generation 3 (Safeer's children)
  afia: 'person_afia',
  afrin: 'person_afrin',

  // Generation 3 (Bismina's children)
  mishab: 'person_mishab',
  sabith: 'person_sabith',
  safiya: 'person_safiya',

  // Generation 3 (Sufina's children)
  shefin: 'person_shefin',
  afan: 'person_afan',
};

// ─── People Data ──────────────────────────────────────────────────────────────
const PEOPLE = [
  // Root
  { id: IDS.kassim_father, fullName: 'Unknown Father', gender: 'male', isLiving: false, isPlaceholder: true, notes: "Kassim Pillai's father" },
  { id: IDS.kassim_mother, fullName: 'Unknown Mother', gender: 'female', isLiving: false, isPlaceholder: true, notes: "Kassim Pillai's mother" },

  // Generation 1
  { id: IDS.kassim_pillai, fullName: 'Kassim Pillai', gender: 'male', isLiving: false, isPlaceholder: false },

  // Generation 2
  { id: IDS.nassir, fullName: 'Nassir', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.nahas, fullName: 'Nahas', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.naseeha, fullName: 'Naseeha', gender: 'female', isLiving: true, isPlaceholder: false },
  { id: IDS.naseeja, fullName: 'Naseeja', gender: 'female', isLiving: true, isPlaceholder: false },
  { id: IDS.nabeesath, fullName: 'Nabeesath', gender: 'female', isLiving: true, isPlaceholder: false },

  // Nassir's children
  { id: IDS.muhammad_fayis, fullName: 'Muhammad Fayis', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.farhan_nj, fullName: 'Farhan NJ', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.fathima_kn, fullName: 'Fathima KN', gender: 'female', isLiving: true, isPlaceholder: false },

  // Nahas's children (placeholders — names not provided)
  {
    id: IDS.nahas_son,
    fullName: 'Name to be updated',
    gender: 'male',
    isLiving: true,
    isPlaceholder: true,
    notes: "Nahas's son — name not yet provided",
  },
  {
    id: IDS.nahas_daughter,
    fullName: 'Name to be updated',
    gender: 'female',
    isLiving: true,
    isPlaceholder: true,
    notes: "Nahas's daughter — name not yet provided",
  },

  // Naseeha's children
  { id: IDS.shafeek, fullName: 'Shafeek', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.siyad_n, fullName: 'Siyad N', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.shemi, fullName: 'Shemi', gender: 'female', isLiving: true, isPlaceholder: false },

  // Shafeek's children — gender unknown, do not guess
  { id: IDS.ahdiya, fullName: 'Ahdiya', gender: 'unknown', isLiving: true, isPlaceholder: false },
  { id: IDS.ahmed, fullName: 'Ahmed', gender: 'unknown', isLiving: true, isPlaceholder: false },
  { id: IDS.adam, fullName: 'Adam', gender: 'unknown', isLiving: true, isPlaceholder: false },

  // Naseeja's children
  { id: IDS.jahamkeer, fullName: 'Jahamkeer', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.nathiya, fullName: 'Nathiya', gender: 'female', isLiving: true, isPlaceholder: false },
  { id: IDS.najiya, fullName: 'Najiya', gender: 'female', isLiving: true, isPlaceholder: false },

  // Jahamkeer's child
  { id: IDS.inarah, fullName: 'Inarah', gender: 'female', isLiving: true, isPlaceholder: false },

  // Nathiya's children
  { id: IDS.ramsan, fullName: 'Ramsan', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.ramees, fullName: 'Ramees', gender: 'male', isLiving: true, isPlaceholder: false },

  // Najiya's children
  { id: IDS.haiza, fullName: 'Haiza', gender: 'female', isLiving: true, isPlaceholder: false },
  { id: IDS.ayan, fullName: 'Ayan', gender: 'male', isLiving: true, isPlaceholder: false },

  // Nabeesath's children
  { id: IDS.safeer, fullName: 'Safeer', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.bismina, fullName: 'Bismina', gender: 'female', isLiving: true, isPlaceholder: false },
  { id: IDS.sufina, fullName: 'Sufina', gender: 'female', isLiving: true, isPlaceholder: false },

  // Safeer's children
  { id: IDS.afia, fullName: 'Afia', gender: 'female', isLiving: true, isPlaceholder: false },
  { id: IDS.afrin, fullName: 'Afrin', gender: 'female', isLiving: true, isPlaceholder: false },

  // Bismina's children
  { id: IDS.mishab, fullName: 'Mishab', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.sabith, fullName: 'Sabith', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.safiya, fullName: 'Safiya', gender: 'female', isLiving: true, isPlaceholder: false },

  // Sufina's children
  { id: IDS.shefin, fullName: 'Shefin', gender: 'male', isLiving: true, isPlaceholder: false },
  { id: IDS.afan, fullName: 'Afan', gender: 'male', isLiving: true, isPlaceholder: false },
];

// ─── Relationships ────────────────────────────────────────────────────────────
// Format: { parent: parentId, child: childId }
const PARENT_CHILD = [
  // Kassim Pillai's Parents -> Kassim Pillai (and future siblings)
  { parent: IDS.kassim_father, child: IDS.kassim_pillai },
  { parent: IDS.kassim_mother, child: IDS.kassim_pillai },

  // Kassim Pillai → children
  { parent: IDS.kassim_pillai, child: IDS.nassir },
  { parent: IDS.kassim_pillai, child: IDS.nahas },
  { parent: IDS.kassim_pillai, child: IDS.naseeha },
  { parent: IDS.kassim_pillai, child: IDS.naseeja },
  { parent: IDS.kassim_pillai, child: IDS.nabeesath },

  // Nassir → children
  { parent: IDS.nassir, child: IDS.muhammad_fayis },
  { parent: IDS.nassir, child: IDS.farhan_nj },
  { parent: IDS.nassir, child: IDS.fathima_kn },

  // Nahas → placeholder children
  { parent: IDS.nahas, child: IDS.nahas_son },
  { parent: IDS.nahas, child: IDS.nahas_daughter },

  // Naseeha → children
  { parent: IDS.naseeha, child: IDS.shafeek },
  { parent: IDS.naseeha, child: IDS.siyad_n },
  { parent: IDS.naseeha, child: IDS.shemi },

  // Shafeek → children
  { parent: IDS.shafeek, child: IDS.ahdiya },
  { parent: IDS.shafeek, child: IDS.ahmed },
  { parent: IDS.shafeek, child: IDS.adam },

  // Naseeja → children
  { parent: IDS.naseeja, child: IDS.jahamkeer },
  { parent: IDS.naseeja, child: IDS.nathiya },
  { parent: IDS.naseeja, child: IDS.najiya },

  // Jahamkeer → child
  { parent: IDS.jahamkeer, child: IDS.inarah },

  // Nathiya → children
  { parent: IDS.nathiya, child: IDS.ramsan },
  { parent: IDS.nathiya, child: IDS.ramees },

  // Najiya → children
  { parent: IDS.najiya, child: IDS.haiza },
  { parent: IDS.najiya, child: IDS.ayan },

  // Nabeesath → children
  { parent: IDS.nabeesath, child: IDS.safeer },
  { parent: IDS.nabeesath, child: IDS.bismina },
  { parent: IDS.nabeesath, child: IDS.sufina },

  // Safeer → children
  { parent: IDS.safeer, child: IDS.afia },
  { parent: IDS.safeer, child: IDS.afrin },

  // Bismina → children
  { parent: IDS.bismina, child: IDS.mishab },
  { parent: IDS.bismina, child: IDS.sabith },
  { parent: IDS.bismina, child: IDS.safiya },

  // Sufina → children
  { parent: IDS.sufina, child: IDS.shefin },
  { parent: IDS.sufina, child: IDS.afan },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

export async function seedDatabase() {
  const SEED_USER_ID = 'system_seed';
  const now = new Date().toISOString();

  console.log('🌱 Starting family tree seed...');
  console.log(`📊 People to seed: ${PEOPLE.length}`);
  console.log(`🔗 Relationships to seed: ${PARENT_CHILD.length}`);

  // Seed People (use setDoc with stable IDs for idempotency)
  console.log('\n📝 Seeding people...');
  for (const person of PEOPLE) {
    await setDoc(
      doc(db, 'people', person.id),
      {
        fullName: person.fullName,
        gender: person.gender,
        isLiving: person.isLiving,
        isPlaceholder: person.isPlaceholder,
        isDeleted: false,
        notes: person.notes || '',
        bio: '',
        createdAt: now,
        updatedAt: now,
        createdBy: SEED_USER_ID,
        updatedBy: SEED_USER_ID,
      },
      { merge: true } // Don't overwrite if already exists
    );
    console.log(`  ✅ ${person.fullName} (${person.id})`);
  }

  // Seed Relationships
  console.log('\n🔗 Seeding relationships...');
  for (const rel of PARENT_CHILD) {
    const relId = `rel_${rel.parent}_${rel.child}`;
    await setDoc(
      doc(db, 'relationships', relId),
      {
        personA: rel.parent,
        personB: rel.child,
        relationshipType: 'parent',
        createdAt: now,
        createdBy: SEED_USER_ID,
        status: 'approved',
      },
      { merge: true }
    );
    console.log(`  ✅ ${rel.parent} → ${rel.child}`);
  }

  // Seed Family Settings
  console.log('\n⚙️  Seeding family settings...');
  await setDoc(
    doc(db, 'familySettings', 'primary'),
    {
      familyName: 'Kassim Pillai Family',
      rootPersonId: IDS.kassim_father,
      privacyLevel: 'family_only',
      requireApprovalForEdits: true,
      allowSelfRegistration: false,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  console.log('\n✅ Seed complete!');
  console.log(`\n📈 Summary:`);
  console.log(`  Root: Kassim Pillai's Father`);
  console.log(`  Total people: ${PEOPLE.length}`);
  console.log(`  Total relationships: ${PARENT_CHILD.length}`);
  console.log(`  Placeholder records: ${PEOPLE.filter(p => p.isPlaceholder).length} (Nahas's unnamed children)`);
  console.log(`  Unknown gender: ${PEOPLE.filter(p => p.gender === 'unknown').length} (Shafeek's children)`);

  return {
    people: PEOPLE.length,
    relationships: PARENT_CHILD.length,
    rootId: IDS.kassim_pillai,
  };
}

// ─── Verification ─────────────────────────────────────────────────────────────

export function getExpectedRelationships() {
  return {
    kassim_parents_children: [IDS.kassim_pillai],
    kassim_pillai_children: [IDS.nassir, IDS.nahas, IDS.naseeha, IDS.naseeja, IDS.nabeesath],
    nassir_children: [IDS.muhammad_fayis, IDS.farhan_nj, IDS.fathima_kn],
    nahas_children: [IDS.nahas_son, IDS.nahas_daughter],
    naseeha_children: [IDS.shafeek, IDS.siyad_n, IDS.shemi],
    shafeek_children: [IDS.ahdiya, IDS.ahmed, IDS.adam],
    naseeja_children: [IDS.jahamkeer, IDS.nathiya, IDS.najiya],
    jahamkeer_children: [IDS.inarah],
    nathiya_children: [IDS.ramsan, IDS.ramees],
    najiya_children: [IDS.haiza, IDS.ayan],
    nabeesath_children: [IDS.safeer, IDS.bismina, IDS.sufina],
    safeer_children: [IDS.afia, IDS.afrin],
    bismina_children: [IDS.mishab, IDS.sabith, IDS.safiya],
    sufina_children: [IDS.shefin, IDS.afan],
  };
}

export { IDS };
