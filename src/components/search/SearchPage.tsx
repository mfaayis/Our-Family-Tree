'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAncestors } from '@/lib/tree-utils';
import { getInitials, cn } from '@/lib/utils';
import { Search, ChevronRight, Users } from 'lucide-react';
import type { Person } from '@/lib/types';

export function SearchPage() {
  const { people, relationships, rootPersonId } = useFamilyTree();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const peopleMap = new Map(people.map(p => [p.id, p]));

  const results = query.trim().length >= 1
    ? people.filter(p =>
        !p.isDeleted &&
        p.fullName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  function getAncestorPath(personId: string): string {
    if (!rootPersonId) return '';
    const ancestors = getAncestors(personId, relationships)
      .sort((a, b) => b.generation - a.generation)
      .map(a => peopleMap.get(a.id)?.fullName)
      .filter(Boolean);
    return ancestors.slice(0, 3).join(' → ');
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Search Family</h1>
            <p className="text-stone-500 text-sm">Find any family member by name</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <Input
            autoFocus
            placeholder="Search by name... (e.g. Ahmed, Naseeha)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>

        {query.trim() && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No family members found for <strong>&ldquo;{query}&rdquo;</strong></p>
          </div>
        )}

        {!query.trim() && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400">Start typing to search for family members</p>
            <p className="text-stone-300 text-sm mt-1">{people.filter(p => !p.isDeleted).length} people in the family tree</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="text-sm text-stone-400 mb-3">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            <div className="space-y-2">
              {results.map(person => {
                const ancestorPath = getAncestorPath(person.id);
                return (
                  <button
                    key={person.id}
                    onClick={() => router.push(`/people/${person.id}`)}
                    className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all text-left"
                  >
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarImage src={person.photoUrl || ''} />
                      <AvatarFallback className={cn(
                        'font-semibold',
                        person.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                        person.gender === 'female' ? 'bg-rose-100 text-rose-600' :
                        'bg-stone-100 text-stone-600'
                      )}>
                        {person.isPlaceholder ? '?' : getInitials(person.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-semibold text-stone-800',
                        person.isPlaceholder && 'italic text-stone-400'
                      )}>
                        {person.isPlaceholder ? 'Name to be updated' : person.fullName}
                      </p>
                      {ancestorPath && (
                        <p className="text-xs text-stone-400 mt-0.5 truncate">{ancestorPath}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {person.gender !== 'unknown' && (
                          <Badge variant={person.gender === 'male' ? 'male' : 'female'} className="text-xs">
                            {person.gender === 'male' ? '\u2642' : '\u2640'} {person.gender}
                          </Badge>
                        )}
                        {person.isPlaceholder && <Badge variant="warning" className="text-xs">Placeholder</Badge>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
