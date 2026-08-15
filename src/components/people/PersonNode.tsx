'use client';

import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Edit3, UserPlus, ChevronDown, ChevronUp, User } from 'lucide-react';
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
  onAddChild?: (person: Person) => void;
  onAddSpouse?: (person: Person) => void;
  onAddSibling?: (person: Person) => void;
  onAddParent?: (person: Person) => void;
  onEdit?: (person: Person) => void;
  isHighlighted?: boolean;
}

function PersonNode({ data }: { data: PersonNodeData }) {
  const {
    person, isSpouse, hasChildren, isExpanded,
    onToggleExpand, onSelectPerson,
    onAddChild, onAddSpouse, onAddSibling, onAddParent, onEdit
  } = data;
  const isPlaceholder = person.isPlaceholder;
  const { canEdit } = useAuth();
  const [hovered, setHovered] = useState(false);

  const birthYear = person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : '';
  const deathYear = person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : '';
  const dateStr = birthYear ? `${birthYear}${deathYear ? ' — ' + deathYear : ''}` : '';

  const nameParts = person.fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  // Gender-accented border color
  const genderAccent =
    person.gender === 'male' ? 'border-[#6b8fa3]/60 shadow-[0_0_0_1.5px_#6b8fa322]' :
    person.gender === 'female' ? 'border-[#b07070]/60 shadow-[0_0_0_1.5px_#b0707022]' :
    'border-[#8b5a2b]/40';

  return (
    <>
      {/* React Flow connection handles — invisible but required */}
      <Handle type="target" position={Position.Top}    className="!opacity-0 !w-1 !h-1 !border-0" isConnectable={false} />
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-1 !h-1 !border-0" isConnectable={false} />
      <Handle type="source" position={Position.Right}  id="spouse-right" className="!opacity-0 !w-1 !h-1 !border-0" isConnectable={false} />
      <Handle type="target" position={Position.Left}   id="spouse-left"  className="!opacity-0 !w-1 !h-1 !border-0" isConnectable={false} />

      <div className="relative" style={{ width: 175 }}>
        {/* ── Add-Parent button (above, admin only) ── */}
        <AnimatePresence>
          {canEdit && hovered && !isSpouse && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              onClick={(e) => { e.stopPropagation(); onAddParent?.(person); }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] font-semibold bg-[#fffdf5] border border-[#8b5a2b]/40 text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-white rounded-full px-2.5 py-0.5 shadow-sm transition-all whitespace-nowrap z-30"
            >
              <Plus className="w-2.5 h-2.5" /> Parent
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={() => onSelectPerson?.(person)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className={cn(
            'cursor-pointer select-none relative flex flex-col items-center justify-center',
            'bg-[#fffdf5] border-2 rounded-[90px]',
            'py-4 px-5 h-[100px]',
            'shadow-[0_6px_30px_-6px_rgba(139,90,43,0.18)]',
            'transition-all duration-500 hover:shadow-[0_12px_40px_-8px_rgba(139,90,43,0.35)]',
            genderAccent,
            data.isHighlighted && 'ring-4 ring-heritage-gold shadow-[0_0_50px_rgba(196,160,100,0.6)] scale-110 z-50 bg-white',
            isPlaceholder && 'opacity-70 border-dashed'
          )}
          data-cursor="view"
          data-cursor-text={firstName}
        >
          {/* Avatar initial circle */}
          <div className={cn(
            'absolute -top-4 w-8 h-8 rounded-full border-2 border-[#fffdf5] flex items-center justify-center text-xs font-bold shadow',
            person.gender === 'male' ? 'bg-[#d4e4f0] text-[#2c5f7a]' :
            person.gender === 'female' ? 'bg-[#f0d4d4] text-[#7a2c2c]' :
            'bg-[#e8ddd0] text-[#5c4033]'
          )}>
            {isPlaceholder ? <User className="w-3.5 h-3.5 opacity-50" /> : (firstName[0] || '?')}
          </div>

          {/* Name */}
          <div className="text-center w-full mt-2">
            {isPlaceholder ? (
              <p className="font-serif text-[#8b5a2b]/60 italic text-xs">Unknown</p>
            ) : (
              <>
                <p className="font-serif font-bold text-[#4a332a] uppercase tracking-wider leading-none text-[11px]">
                  {firstName}
                </p>
                {restName && (
                  <p className="font-serif font-bold text-[#4a332a] uppercase tracking-wider leading-tight text-[11px]">
                    {restName}
                  </p>
                )}
              </>
            )}

            {dateStr && (
              <p className="font-serif text-[#a07850] text-[8.5px] mt-0.5 tracking-widest">
                {dateStr}
              </p>
            )}

            {isSpouse && (
              <p className="text-[#8b5a2b]/50 text-[7.5px] tracking-[0.2em] uppercase mt-0.5 italic">Spouse</p>
            )}
          </div>

          {/* Edit button — top-right corner on hover (admin only) */}
          <AnimatePresence>
            {canEdit && hovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                onClick={(e) => { e.stopPropagation(); onEdit?.(person); }}
                className="absolute -top-2 -right-2 bg-[#4a332a] text-[#fffdf5] rounded-full p-1 shadow-md hover:bg-[#6b4c3b] transition-colors z-20"
                title="Edit person"
              >
                <Edit3 className="w-2.5 h-2.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Expand / Collapse toggle ── */}
        {hasChildren && !isSpouse && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand?.(person.id); }}
            className={cn(
              'absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5',
              'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border',
              'transition-all shadow-sm z-10',
              isExpanded
                ? 'bg-[#8b5a2b] text-white border-[#8b5a2b]'
                : 'bg-[#fffdf5] text-[#8b5a2b] border-[#8b5a2b]/50 hover:bg-[#8b5a2b] hover:text-white'
            )}
            title={isExpanded ? 'Collapse branch' : 'Expand branch'}
          >
            {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </button>
        )}

        {/* ── Action row (Add Child / Sibling / Spouse) — below card, admin only ── */}
        <AnimatePresence>
          {canEdit && hovered && !isSpouse && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-1 z-30"
            >
              {[
                { label: 'Child', action: () => onAddChild?.(person) },
                { label: 'Sibling', action: () => onAddSibling?.(person) },
                { label: 'Spouse', action: () => onAddSpouse?.(person) },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); action(); }}
                  className="flex items-center gap-0.5 text-[8px] font-semibold bg-[#fffdf5] border border-[#8b5a2b]/40 text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-white rounded-full px-2 py-0.5 shadow-sm transition-all whitespace-nowrap"
                >
                  <UserPlus className="w-2 h-2" />
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default memo(PersonNode);
