'use client';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit3, Heart } from 'lucide-react';
import { getInitials, getGenderBg, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Person } from '@/lib/types';

interface PersonCardProps {
  person: Person;
  childCount?: number;
  relationshipLabel?: string;
  compact?: boolean;
  onAddChild?: () => void;
  onAddSpouse?: () => void;
  onEdit?: () => void;
  showQuickActions?: boolean;
}

export function PersonCard({
  person,
  childCount = 0,
  relationshipLabel,
  compact = false,
  onAddChild,
  onAddSpouse,
  onEdit,
  showQuickActions = false,
}: PersonCardProps) {
  const router = useRouter();
  const isPlaceholder = person.isPlaceholder;

  function handleClick() {
    router.push(`/people/${person.id}`);
  }

  // Base background derived from gender, but we'll apply a glass effect
  const genderBg = person.gender === 'male' ? 'bg-blue-50/80' : 
                   person.gender === 'female' ? 'bg-rose-50/80' : 
                   'bg-stone-50/80';

  const genderBorder = person.gender === 'male' ? 'border-blue-200/60' : 
                       person.gender === 'female' ? 'border-rose-200/60' : 
                       'border-stone-200/60';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'person-card group rounded-2xl border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] cursor-pointer select-none relative backdrop-blur-md transition-all',
        genderBg,
        genderBorder,
        compact ? 'p-3 min-w-[140px] max-w-[160px]' : 'p-4 min-w-[160px] max-w-[200px]',
        isPlaceholder && 'opacity-70 border-dashed bg-white/50'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`View profile of ${person.fullName}`}
    >
      {/* Quick Action Buttons (Hover) */}
      {showQuickActions && !isPlaceholder && (
        <div className="absolute -top-3 -right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {onEdit && (
            <button
              onClick={e => { e.stopPropagation(); onEdit(); }}
              className="bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 shadow-sm rounded-full p-1.5 transition-colors"
              title="Edit Person"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onAddSpouse && (
            <button
              onClick={e => { e.stopPropagation(); onAddSpouse(); }}
              className="bg-white hover:bg-pink-50 text-pink-600 border border-pink-100 shadow-sm rounded-full p-1.5 transition-colors"
              title="Add Spouse"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          )}
          {onAddChild && (
            <button
              onClick={e => { e.stopPropagation(); onAddChild(); }}
              className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 shadow-sm rounded-full p-1.5 transition-colors"
              title="Add Child"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Avatar */}
      <div className="flex justify-center mb-2">
        <Avatar className={cn(compact ? 'w-10 h-10' : 'w-14 h-14', 'ring-2 ring-white shadow-sm')}>
          <AvatarImage src={person.photoUrl || ''} alt={person.fullName} className="object-cover" />
          <AvatarFallback className={cn(
            'font-semibold',
            person.gender === 'male' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700' : 
            person.gender === 'female' ? 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-700' : 
            'bg-gradient-to-br from-stone-100 to-stone-200 text-stone-700',
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
          <p className="text-[11px] font-medium text-stone-500 mt-0.5 capitalize tracking-wide">{relationshipLabel}</p>
        )}

        {/* Gender badge */}
        {!compact && person.gender !== 'unknown' && (
          <Badge
            variant={person.gender === 'male' ? 'male' : 'female'}
            className="mt-1.5 text-[10px] font-medium px-1.5 py-0 shadow-sm"
          >
            {person.gender === 'male' ? '\u2642 Male' : '\u2640 Female'}
          </Badge>
        )}

        {/* Child count */}
        {childCount > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2 text-[11px] font-medium text-stone-500 bg-white/60 inline-flex px-2 py-0.5 rounded-full border border-stone-200/50">
            <Users className="w-3 h-3" />
            {childCount} {childCount === 1 ? 'child' : 'children'}
          </div>
        )}

        {/* Placeholder note */}
        {isPlaceholder && (
          <p className="text-xs text-amber-600/80 mt-1 font-medium">Name to be updated</p>
        )}
      </div>
    </motion.div>
  );
}
