'use client';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { getInitials, getGenderBg, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Person } from '@/lib/types';

interface PersonCardProps {
  person: Person;
  childCount?: number;
  relationshipLabel?: string;
  compact?: boolean;
  onAddChild?: () => void;
  showAddChild?: boolean;
}

export function PersonCard({
  person,
  childCount = 0,
  relationshipLabel,
  compact = false,
  onAddChild,
  showAddChild = false,
}: PersonCardProps) {
  const router = useRouter();
  const isPlaceholder = person.isPlaceholder;

  function handleClick() {
    router.push(`/people/${person.id}`);
  }

  const genderBg = getGenderBg(person.gender);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'person-card bg-white rounded-2xl border shadow-sm cursor-pointer select-none relative',
        genderBg,
        compact ? 'p-3 min-w-[140px] max-w-[160px]' : 'p-4 min-w-[160px] max-w-[200px]',
        isPlaceholder && 'opacity-70 border-dashed'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`View profile of ${person.fullName}`}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-2">
        <Avatar className={compact ? 'w-10 h-10' : 'w-14 h-14'}>
          <AvatarImage src={person.photoUrl || ''} alt={person.fullName} />
          <AvatarFallback className={cn(
            'font-semibold',
            person.gender === 'male' ? 'bg-blue-100 text-blue-700' : person.gender === 'female' ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-600',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {isPlaceholder ? '?' : getInitials(person.fullName)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name */}
      <div className="text-center">
        <p className={cn(
          'font-semibold text-stone-800 leading-tight',
          compact ? 'text-xs' : 'text-sm',
          isPlaceholder && 'italic text-stone-400'
        )}>
          {isPlaceholder ? 'Name unknown' : person.fullName}
        </p>

        {relationshipLabel && (
          <p className="text-xs text-stone-500 mt-0.5 capitalize">{relationshipLabel}</p>
        )}

        {/* Gender badge */}
        {!compact && person.gender !== 'unknown' && (
          <Badge
            variant={person.gender === 'male' ? 'male' : 'female'}
            className="mt-1.5 text-xs"
          >
            {person.gender === 'male' ? '\u2642 Male' : '\u2640 Female'}
          </Badge>
        )}

        {/* Child count */}
        {childCount > 0 && (
          <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-stone-500">
            <Users className="w-3 h-3" />
            {childCount} {childCount === 1 ? 'child' : 'children'}
          </div>
        )}

        {/* Placeholder note */}
        {isPlaceholder && (
          <p className="text-xs text-amber-600 mt-1">Name to be updated</p>
        )}
      </div>

      {/* Add child button */}
      {showAddChild && onAddChild && (
        <button
          onClick={e => { e.stopPropagation(); onAddChild(); }}
          className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-amber-700 hover:text-amber-800 py-1 rounded-lg hover:bg-amber-50 transition-colors"
          aria-label={`Add child to ${person.fullName}`}
        >
          <Plus className="w-3 h-3" />
          Add child
        </button>
      )}
    </motion.div>
  );
}
