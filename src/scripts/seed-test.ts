// Automated test for seed data accuracy
// Run with: npx jest (after adding jest to package.json)
// Or: node --experimental-vm-modules src/scripts/seed-test.mjs

import { getChildren } from '../lib/tree-utils';
import { IDS, getExpectedRelationships } from './seed';

// This test verifies the seed data structure is correct
// It can be run against live Firestore or against the static seed arrays

const PARENT_CHILD_RELS = [
  { personA: IDS.kassim_father, personB: IDS.kassim_pillai, relationshipType: 'parent' as const },
  { personA: IDS.kassim_mother, personB: IDS.kassim_pillai, relationshipType: 'parent' as const },
  { personA: IDS.kassim_pillai, personB: IDS.nassir, relationshipType: 'parent' as const },
  { personA: IDS.kassim_pillai, personB: IDS.nahas, relationshipType: 'parent' as const },
  { personA: IDS.kassim_pillai, personB: IDS.naseeha, relationshipType: 'parent' as const },
  { personA: IDS.kassim_pillai, personB: IDS.naseeja, relationshipType: 'parent' as const },
  { personA: IDS.kassim_pillai, personB: IDS.nabeesath, relationshipType: 'parent' as const },
  { personA: IDS.nassir, personB: IDS.muhammad_fayis, relationshipType: 'parent' as const },
  { personA: IDS.nassir, personB: IDS.farhan_nj, relationshipType: 'parent' as const },
  { personA: IDS.nassir, personB: IDS.fathima_kn, relationshipType: 'parent' as const },
  { personA: IDS.nahas, personB: IDS.nahas_son, relationshipType: 'parent' as const },
  { personA: IDS.nahas, personB: IDS.nahas_daughter, relationshipType: 'parent' as const },
  { personA: IDS.naseeha, personB: IDS.shafeek, relationshipType: 'parent' as const },
  { personA: IDS.naseeha, personB: IDS.siyad_n, relationshipType: 'parent' as const },
  { personA: IDS.naseeha, personB: IDS.shemi, relationshipType: 'parent' as const },
  { personA: IDS.shafeek, personB: IDS.ahdiya, relationshipType: 'parent' as const },
  { personA: IDS.shafeek, personB: IDS.ahmed, relationshipType: 'parent' as const },
  { personA: IDS.shafeek, personB: IDS.adam, relationshipType: 'parent' as const },
  { personA: IDS.naseeja, personB: IDS.jahamkeer, relationshipType: 'parent' as const },
  { personA: IDS.naseeja, personB: IDS.nathiya, relationshipType: 'parent' as const },
  { personA: IDS.naseeja, personB: IDS.najiya, relationshipType: 'parent' as const },
  { personA: IDS.jahamkeer, personB: IDS.inarah, relationshipType: 'parent' as const },
  { personA: IDS.nathiya, personB: IDS.ramsan, relationshipType: 'parent' as const },
  { personA: IDS.nathiya, personB: IDS.ramees, relationshipType: 'parent' as const },
  { personA: IDS.najiya, personB: IDS.haiza, relationshipType: 'parent' as const },
  { personA: IDS.najiya, personB: IDS.ayan, relationshipType: 'parent' as const },
  { personA: IDS.nabeesath, personB: IDS.safeer, relationshipType: 'parent' as const },
  { personA: IDS.nabeesath, personB: IDS.bismina, relationshipType: 'parent' as const },
  { personA: IDS.nabeesath, personB: IDS.sufina, relationshipType: 'parent' as const },
  { personA: IDS.safeer, personB: IDS.afia, relationshipType: 'parent' as const },
  { personA: IDS.safeer, personB: IDS.afrin, relationshipType: 'parent' as const },
  { personA: IDS.bismina, personB: IDS.mishab, relationshipType: 'parent' as const },
  { personA: IDS.bismina, personB: IDS.sabith, relationshipType: 'parent' as const },
  { personA: IDS.bismina, personB: IDS.safiya, relationshipType: 'parent' as const },
  { personA: IDS.sufina, personB: IDS.shefin, relationshipType: 'parent' as const },
  { personA: IDS.sufina, personB: IDS.afan, relationshipType: 'parent' as const },
];

// Add fake IDs for the relationship objects
const RELS = PARENT_CHILD_RELS.map((r, i) => ({ ...r, id: `rel_${i}`, createdAt: '', createdBy: '', status: 'approved' as const }));

interface TestResult {
  name: string;
  passed: boolean;
  expected: number | string[];
  actual: number | string[];
  error?: string;
}

function assertChildCount(personId: string, expectedCount: number, label: string): TestResult {
  const children = getChildren(personId, RELS);
  const passed = children.length === expectedCount;
  return {
    name: label,
    passed,
    expected: expectedCount,
    actual: children.length,
    error: passed ? undefined : `Expected ${expectedCount} children, got ${children.length}`,
  };
}

function assertChildNames(personId: string, expectedIds: string[], label: string): TestResult {
  const children = getChildren(personId, RELS);
  const childSet = new Set(children);
  const allPresent = expectedIds.every(id => childSet.has(id));
  const passed = allPresent && children.length === expectedIds.length;
  return {
    name: label,
    passed,
    expected: expectedIds,
    actual: children,
    error: passed ? undefined : `Children mismatch. Expected: [${expectedIds.join(', ')}], Got: [${children.join(', ')}]`,
  };
}

export function runSeedTests(): { passed: number; failed: number; results: TestResult[] } {
  const expected = getExpectedRelationships();
  const results: TestResult[] = [
    assertChildCount(IDS.kassim_father, 1, 'Kassim Father has exactly 1 child'),
    assertChildNames(IDS.kassim_father, expected.kassim_parents_children, 'Kassim Father child is Kassim Pillai'),
    assertChildCount(IDS.kassim_mother, 1, 'Kassim Mother has exactly 1 child'),
    assertChildNames(IDS.kassim_mother, expected.kassim_parents_children, 'Kassim Mother child is Kassim Pillai'),
    assertChildCount(IDS.kassim_pillai, 5, 'Kassim Pillai has exactly 5 children'),
    assertChildNames(IDS.kassim_pillai, expected.kassim_pillai_children, 'Kassim Pillai children are Nassir, Nahas, Naseeha, Naseeja, Nabeesath'),
    assertChildCount(IDS.nassir, 3, 'Nassir has exactly 3 children'),
    assertChildNames(IDS.nassir, expected.nassir_children, 'Nassir children are Muhammad Fayis, Farhan NJ, Fathima KN'),
    assertChildCount(IDS.nahas, 2, 'Nahas has exactly 2 placeholder children'),
    assertChildCount(IDS.naseeha, 3, 'Naseeha has exactly 3 children'),
    assertChildCount(IDS.shafeek, 3, 'Shafeek has exactly 3 children'),
    assertChildNames(IDS.shafeek, expected.shafeek_children, 'Shafeek children are Ahdiya, Ahmed, Adam'),
    assertChildCount(IDS.naseeja, 3, 'Naseeja has exactly 3 children'),
    assertChildCount(IDS.jahamkeer, 1, 'Jahamkeer has exactly 1 child'),
    assertChildNames(IDS.jahamkeer, expected.jahamkeer_children, 'Jahamkeer child is Inarah'),
    assertChildCount(IDS.nathiya, 2, 'Nathiya has exactly 2 children'),
    assertChildNames(IDS.nathiya, expected.nathiya_children, 'Nathiya children are Ramsan, Ramees'),
    assertChildCount(IDS.najiya, 2, 'Najiya has exactly 2 children'),
    assertChildNames(IDS.najiya, expected.najiya_children, 'Najiya children are Haiza, Ayan'),
    assertChildCount(IDS.nabeesath, 3, 'Nabeesath has exactly 3 children'),
    assertChildCount(IDS.safeer, 2, 'Safeer has exactly 2 children'),
    assertChildNames(IDS.safeer, expected.safeer_children, 'Safeer children are Afia, Afrin'),
    assertChildCount(IDS.bismina, 3, 'Bismina has exactly 3 children'),
    assertChildNames(IDS.bismina, expected.bismina_children, 'Bismina children are Mishab, Sabith, Safiya'),
    assertChildCount(IDS.sufina, 2, 'Sufina has exactly 2 children'),
    assertChildNames(IDS.sufina, expected.sufina_children, 'Sufina children are Shefin, Afan'),
  ];

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  return { passed, failed, results };
}

// Run and print results
const { passed, failed, results } = runSeedTests();

console.log('\n🧪 Family Tree Seed Data Accuracy Tests');
console.log('═══════════════════════════════════════');
for (const result of results) {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}`);
  if (!result.passed) {
    console.log(`   Error: ${result.error}`);
  }
}

console.log('\n─────────────────────────────────────────');
console.log(`Passed: ${passed}/${results.length}`);
if (failed > 0) {
  console.log(`Failed: ${failed}/${results.length}`);
  process.exit(1);
} else {
  console.log('All tests passed! ✅');
}
