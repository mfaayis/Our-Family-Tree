'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, Filter } from 'lucide-react';
import { getInitials, cn } from '@/lib/utils';
import type { Person } from '@/lib/types';

export function PeopleListPage() {
  const { people, getChildrenOf, relationships } = useFamilyTree();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');

  const filtered = people
    .filter(p => !p.isDeleted)
    .filter(p => genderFilter === 'all' || p.gender === genderFilter)
    .filter(p => {
      if (!search.trim()) return true;
      return p.fullName.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">All Family Members</h1>
            <p className="text-stone-500 text-sm">{people.filter(p => !p.isDeleted).length} members in the family tree</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'male', 'female', 'unknown'].map(g => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                  genderFilter === g
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                )}
              >
                {g === 'all' ? 'All' : g === 'male' ? '\u2642 Male' : g === 'female' ? '\u2640 Female' : '? Unknown'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No family members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(person => (
              <PersonListItem
                key={person.id}
                person={person}
                childCount={getChildrenOf(person.id).length}
                onClick={() => router.push(`/people/${person.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonListItem({ person, childCount, onClick }: { person: Person; childCount: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:shadow-md hover:border-amber-200 transition-all text-left w-full',
        person.isPlaceholder && 'opacity-70 border-dashed'
      )}
    >
      <Avatar className="w-12 h-12 shrink-0">
        <AvatarImage src={person.photoUrl || ''} />
        <AvatarFallback className={cn(
          'font-semibold text-sm',
          person.gender === 'male' ? 'bg-blue-100 text-blue-700' : person.gender === 'female' ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-600'
        )}>
          {person.isPlaceholder ? '?' : getInitials(person.fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-stone-800 truncate', person.isPlaceholder && 'italic text-stone-400')}>
          {person.isPlaceholder ? 'Name to be updated' : person.fullName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {person.gender !== 'unknown' && (
            <span className={cn('text-xs', person.gender === 'male' ? 'text-blue-600' : 'text-rose-500')}>
              {person.gender === 'male' ? '\u2642' : '\u2640'}
            </span>
          )}
          {childCount > 0 && (
            <span className="text-xs text-stone-400">{childCount} {childCount === 1 ? 'child' : 'children'}</span>
          )}
          {person.isPlaceholder && <Badge variant="warning" className="text-xs">Placeholder</Badge>}
        </div>
      </div>
    </button>
  );
}
