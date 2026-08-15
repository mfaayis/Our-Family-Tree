'use client';
import { useRouter } from 'next/navigation';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAncestors, getDescendants } from '@/lib/tree-utils';
import { getInitials, cn } from '@/lib/utils';
import type { Person } from '@/lib/types';
import { GitBranch, ChevronRight } from 'lucide-react';

export function MyBranchPage() {
  const { userProfile } = useAuth();
  const { relationships, getPerson, getChildrenOf, getParentsOf, getSiblingsOf } = useFamilyTree();
  const router = useRouter();

  // Find the linked person for this user
  const linkedPersonId = userProfile?.linkedPersonId;
  const linkedPerson = linkedPersonId ? getPerson(linkedPersonId) : null;

  // Ancestors
  const ancestors = linkedPersonId
    ? getAncestors(linkedPersonId, relationships)
        .sort((a, b) => b.generation - a.generation)
        .map(a => getPerson(a.id))
        .filter((p): p is Person => !!p)
    : [];

  const siblings = linkedPersonId ? getSiblingsOf(linkedPersonId) : [];
  const children = linkedPersonId ? getChildrenOf(linkedPersonId) : [];

  const descendants = linkedPersonId
    ? getDescendants(linkedPersonId, relationships)
        .sort((a, b) => a.generation - b.generation)
    : [];

  if (!linkedPerson) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-20 max-w-2xl mx-auto px-4 py-12 text-center">
          <GitBranch className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-800 mb-3">My Family Branch</h1>
          <p className="text-stone-500 mb-6">
            Your account is not yet linked to a family member profile.
            Ask an admin to link your account to your family record.
          </p>
          <Button onClick={() => router.push('/tree')}>View Full Family Tree</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">My Family Branch</h1>
            <p className="text-stone-500 text-sm">Your place in the family tree</p>
          </div>
        </div>

        {/* Ancestors chain */}
        {ancestors.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Ancestors</p>
            <div className="space-y-2">
              {ancestors.map((person, i) => (
                <div key={person.id} className="flex items-center gap-2">
                  {i > 0 && <div className="w-8 h-6 flex items-end justify-center">
                    <div className="w-0.5 h-full bg-stone-200" />
                  </div>}
                  <PersonRow person={person} onClick={() => router.push(`/people/${person.id}`)} />
                </div>
              ))}
            </div>
            <div className="ml-4 w-0.5 h-8 bg-stone-200" />
          </div>
        )}

        {/* You */}
        <div className="mb-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">You</p>
          <div className="border-2 border-amber-400 rounded-2xl p-1 bg-amber-50">
            <PersonRow
              person={linkedPerson}
              onClick={() => router.push(`/people/${linkedPerson.id}`)}
              highlighted
            />
          </div>

          {/* Siblings */}
          {siblings.length > 0 && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-stone-200">
              <p className="text-xs text-stone-400 mb-2">Siblings</p>
              <div className="flex flex-wrap gap-2">
                {siblings.map(p => (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/people/${p.id}`)}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-stone-200 hover:border-amber-200 transition-all text-sm"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{getInitials(p.fullName)}</AvatarFallback>
                    </Avatar>
                    {p.fullName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Children / descendants */}
        {children.length > 0 && (
          <>
            <div className="ml-4 w-0.5 h-8 bg-stone-200" />
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Children</p>
              <div className="space-y-2">
                {children.map(p => (
                  <PersonRow key={p.id} person={p} onClick={() => router.push(`/people/${p.id}`)} />
                ))}
              </div>
            </div>
          </>
        )}

        {descendants.length > children.length && (
          <div className="mt-4 bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-sm text-stone-500">+{descendants.length - children.length} more descendants</p>
            <Button variant="ghost" size="sm" className="mt-1" onClick={() => router.push(`/people/${linkedPersonId}`)}>
              View full branch
            </Button>
          </div>
        )}

        {children.length === 0 && descendants.length === 0 && (
          <div className="mt-4 bg-stone-100 rounded-xl p-6 text-center">
            <p className="text-stone-400 text-sm">No children recorded yet.</p>
            <Button size="sm" className="mt-3" onClick={() => router.push(`/people/${linkedPersonId}`)}>Add Child</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonRow({ person, onClick, highlighted }: { person: Person; onClick: () => void; highlighted?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
        highlighted ? 'bg-amber-50' : 'bg-white border border-stone-200 hover:border-amber-200 hover:shadow-sm'
      )}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={person.photoUrl || ''} />
        <AvatarFallback className={cn(
          'font-semibold text-sm',
          person.gender === 'male' ? 'bg-blue-100 text-blue-700' : person.gender === 'female' ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-600'
        )}>
          {person.isPlaceholder ? '?' : getInitials(person.fullName)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-stone-800 text-sm">{person.isPlaceholder ? 'Unknown' : person.fullName}</p>
        <p className="text-xs text-stone-400 capitalize">{person.gender !== 'unknown' ? person.gender : 'Gender unknown'}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 ml-auto" />
    </button>
  );
}
