'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Minus, Plus, Edit3, Heart, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Person } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface PersonNodeData {
  person: Person;
  isSpouse?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onSelectPerson?: (person: Person) => void;
}

function PersonNode({ data, id }: { data: PersonNodeData; id: string }) {
  const { person, isSpouse, hasChildren, isExpanded, onToggleExpand, onSelectPerson } = data;
  const isPlaceholder = person.isPlaceholder;
  const { canEdit } = useAuth();

  // Vintage Parchment Aesthetic
  const cardBg = 'bg-[#fffdf5]/95';
  const cardBorder = 'border-[#8b5a2b]/40';
  
  const birthYear = person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : '';
  const deathYear = person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : '';
  const dateStr = birthYear ? `${birthYear} ${deathYear ? '- ' + deathYear : ''}` : '';

  const locationStr = person.birthPlace || person.currentLocation || '';

  const nameParts = person.fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  return (
    <>
      {/* Handles for React Flow (Hidden via CSS classes but functional) */}
      <Handle type="target" position={Position.Top} className="opacity-0" isConnectable={false} />
      <Handle type="source" position={Position.Bottom} className="opacity-0" isConnectable={false} />
      <Handle type="source" position={Position.Right} id="spouse-right" className="opacity-0" isConnectable={false} />
      <Handle type="target" position={Position.Left} id="spouse-left" className="opacity-0" isConnectable={false} />

      <motion.div
        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectPerson?.(person)}
        className={cn(
          'person-card group border shadow-[0_4px_20px_-4px_rgba(139,90,43,0.15)] cursor-pointer select-none relative backdrop-blur-md transition-all flex flex-col items-center justify-center',
          'rounded-[100px]',
          cardBg,
          cardBorder,
          'py-4 px-6 min-w-[160px] max-w-[200px] h-[95px]',
          isPlaceholder && 'opacity-70 border-dashed bg-[#fffdf5]/60'
        )}
      >
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

          {/* Role/Relationship Label */}
          {isSpouse && (
            <p className="font-serif text-[#8b5a2b]/80 text-[8px] mt-1 tracking-widest uppercase italic">
              Spouse
            </p>
          )}
        </div>

        {/* Expand / Collapse Button */}
        {hasChildren && !isSpouse && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.(person.id);
            }}
            className="absolute -bottom-3 bg-[#fffdf5] border border-[#8b5a2b] text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-[#fffdf5] rounded-full p-0.5 shadow-sm transition-colors z-10"
            title={isExpanded ? "Collapse Branch" : "Expand Branch"}
          >
            {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}
      </motion.div>
    </>
  );
}

export default memo(PersonNode);
