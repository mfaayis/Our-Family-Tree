'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAllPeople, getAllRelationships, getFamilySettings } from '@/lib/db';
import { buildGraph, buildTreeFromRoot, assignTreePositions, getChildren, getParents, getSpouses, getSiblings } from '@/lib/tree-utils';
import type { Person, Relationship, FamilySettings } from '@/lib/types';

const ROOT_PERSON_ID_KEY = 'kassim_pillai_root';

interface FamilyTreeContextType {
  people: Person[];
  relationships: Relationship[];
  familySettings: FamilySettings | null;
  loading: boolean;
  error: string | null;
  rootPersonId: string | null;
  getPerson: (id: string) => Person | undefined;
  getChildrenOf: (id: string) => Person[];
  getParentsOf: (id: string) => Person[];
  getSpousesOf: (id: string) => Person[];
  getSiblingsOf: (id: string) => Person[];
  refresh: () => Promise<void>;
}

const FamilyTreeContext = createContext<FamilyTreeContextType | null>(null);

export function FamilyTreeProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [familySettings, setFamilySettings] = useState<FamilySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rootPersonId, setRootPersonId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allPeople, allRels, settings] = await Promise.all([
        getAllPeople(),
        getAllRelationships(),
        getFamilySettings(),
      ]);
      setPeople(allPeople.filter(p => !p.isDeleted));
      setRelationships(allRels);
      setFamilySettings(settings);
      if (settings?.rootPersonId) {
        setRootPersonId(settings.rootPersonId);
      }
    } catch (err) {
      setError('Failed to load family data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const peopleMap = new Map(people.map(p => [p.id, p]));

  const getPerson = (id: string) => peopleMap.get(id);

  const getChildrenOf = (id: string): Person[] =>
    getChildren(id, relationships)
      .map(cId => peopleMap.get(cId))
      .filter((p): p is Person => !!p);

  const getParentsOf = (id: string): Person[] =>
    getParents(id, relationships)
      .map(pId => peopleMap.get(pId))
      .filter((p): p is Person => !!p);

  const getSpousesOf = (id: string): Person[] =>
    getSpouses(id, relationships)
      .map(sId => peopleMap.get(sId))
      .filter((p): p is Person => !!p);

  const getSiblingsOf = (id: string): Person[] =>
    getSiblings(id, relationships)
      .map(sId => peopleMap.get(sId))
      .filter((p): p is Person => !!p);

  return (
    <FamilyTreeContext.Provider
      value={{
        people,
        relationships,
        familySettings,
        loading,
        error,
        rootPersonId,
        getPerson,
        getChildrenOf,
        getParentsOf,
        getSpousesOf,
        getSiblingsOf,
        refresh: loadData,
      }}
    >
      {children}
    </FamilyTreeContext.Provider>
  );
}

export function useFamilyTree() {
  const ctx = useContext(FamilyTreeContext);
  if (!ctx) throw new Error('useFamilyTree must be used within FamilyTreeProvider');
  return ctx;
}
