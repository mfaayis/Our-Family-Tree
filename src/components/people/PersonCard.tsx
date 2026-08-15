'use client';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Person } from '@/lib/types';

interface PersonCardProps {
  person: Person;
  childCount?: number;
  relationshipLabel?: string;
  compact?: boolean;
  onAddChild?: () => void;
  onAddSpouse?: () => void;
  onAddSibling?: () => void;
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
  onAddSibling,
  onEdit,
  showQuickActions = false,
}: PersonCardProps) {
  const router = useRouter();
  const isPlaceholder = person.isPlaceholder;

  function handleClick() {
    router.push(`/people/${person.id}`);
  }

  // Vintage Parchment Aesthetic
  const cardBg = 'bg-[#fffdf5]/95';
  const cardBorder = 'border-[#8b5a2b]/40';
  
  const birthYear = person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : '';
  const deathYear = person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : '';
  const dateStr = birthYear ? `${birthYear} ${deathYear ? '- ' + deathYear : ''}` : '';

  const locationStr = person.birthPlace || person.currentLocation || '';

  // Split name into first and last for aesthetic stacking
  const nameParts = person.fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'person-card group border shadow-[0_4px_20px_-4px_rgba(139,90,43,0.15)] cursor-pointer select-none relative backdrop-blur-md transition-all flex flex-col items-center justify-center',
        'rounded-[100px]', // Oval shape
        cardBg,
        cardBorder,
        compact ? 'py-3 px-4 min-w-[140px] max-w-[160px] h-[70px]' : 'py-4 px-6 min-w-[160px] max-w-[200px] h-[95px]',
        isPlaceholder && 'opacity-70 border-dashed bg-[#fffdf5]/60'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`View profile of ${person.fullName}`}
    >
      {/* Quick Action Buttons - Visible on hover or touch */}
      {showQuickActions && !isPlaceholder && (
        <div className="absolute -top-3 -right-3 flex gap-1 opacity-60 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {onEdit && (
            <button
              onClick={e => { e.stopPropagation(); onEdit(); }}
              className="bg-[#fffdf5] hover:bg-[#f4ebd8] text-[#8b5a2b] border border-[#8b5a2b]/30 shadow-sm rounded-full p-1.5 transition-colors"
              title="Edit Person"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onAddSpouse && (
            <button
              onClick={e => { e.stopPropagation(); onAddSpouse(); }}
              className="bg-[#fffdf5] hover:bg-[#f4ebd8] text-[#8b5a2b] border border-[#8b5a2b]/30 shadow-sm rounded-full p-1.5 transition-colors"
              title="Add Spouse"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          )}
          {onAddSibling && (
            <button
              onClick={e => { e.stopPropagation(); onAddSibling(); }}
              className="bg-[#fffdf5] hover:bg-[#f4ebd8] text-[#8b5a2b] border border-[#8b5a2b]/30 shadow-sm rounded-full p-1.5 transition-colors"
              title="Add Sibling"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          )}
          {onAddChild && (
            <button
              onClick={e => { e.stopPropagation(); onAddChild(); }}
              className="bg-[#fffdf5] hover:bg-[#f4ebd8] text-[#8b5a2b] border border-[#8b5a2b]/30 shadow-sm rounded-full p-1.5 transition-colors"
              title="Add Child"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Name */}
      <div className="text-center w-full">
        {isPlaceholder ? (
          <p className="font-serif font-bold text-[#5c4033] leading-tight text-sm italic opacity-60">
            Unknown
          </p>
        ) : (
          <>
            <p className="font-serif font-bold text-[#4a332a] leading-[1.1] uppercase tracking-wider text-[11px] sm:text-xs">
              {firstName}
            </p>
            {lastName && (
              <p className="font-serif font-bold text-[#4a332a] leading-[1.1] uppercase tracking-wider text-[11px] sm:text-xs">
                {lastName}
              </p>
            )}
          </>
        )}

        {/* Dates */}
        {dateStr && (
          <p className="font-serif text-[#785b46] text-[9px] mt-0.5 tracking-widest uppercase">
            {dateStr}
          </p>
        )}

        {/* Location */}
        {locationStr && (
          <p className="font-serif text-[#785b46] text-[8px] mt-0.5 tracking-widest uppercase truncate max-w-full px-2">
            {locationStr}
          </p>
        )}

        {/* Placeholder note */}
        {isPlaceholder && (
          <p className="font-serif text-[#8b5a2b]/80 text-[8px] mt-1 tracking-widest uppercase">
            To Be Added
          </p>
        )}
      </div>
    </motion.div>
  );
}
