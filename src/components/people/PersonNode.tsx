'use client';

import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, UserPlus, ChevronDown, ChevronUp, User } from 'lucide-react';
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

  // Minimal accent based on gender
  const textAccent = 
    person.gender === 'male' ? 'text-[#6b8fa3]' :
    person.gender === 'female' ? 'text-[#b07070]' :
    'text-heritage-gold-dark';

  return (
    <>
      <Handle type="target" position={Position.Top}    className="!opacity-0 !w-1 !h-1 !border-0" isConnectable={false} />
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-1 !h-1 !border-0" isConnectable={false} />
      <Handle type="source" position={Position.Right}  id="spouse-right" className="!opacity-0 !w-1 !h-1 !border-0" isConnectable={false} />
      <Handle type="target" position={Position.Left}   id="spouse-left"  className="!opacity-0 !w-1 !h-1 !border-0" isConnectable={false} />

      <div className="relative" style={{ width: 170 }}>
        {/* Admin add parent */}
        <AnimatePresence>
          {canEdit && hovered && !isSpouse && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              onClick={(e) => { e.stopPropagation(); onAddParent?.(person); }}
              className="absolute -top-6 left-[20px] flex items-center gap-1 text-[9px] uppercase tracking-widest text-heritage-espresso/50 hover:text-heritage-gold transition-colors z-30"
            >
              <Plus className="w-3 h-3" /> Parent
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Editorial Constellation Node ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={() => onSelectPerson?.(person)}
          whileHover={{ scale: 1.02, x: 5 }}
          className={cn(
            'cursor-pointer select-none flex items-center gap-3',
            'transition-all duration-700',
            data.isHighlighted && 'scale-110 z-50',
            isPlaceholder && 'opacity-60'
          )}
          data-cursor="view"
          data-cursor-text={firstName}
        >
          {/* Constellation Point (Portrait) */}
          <div className={cn(
            'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-serif italic shadow-2xl transition-all duration-700',
            data.isHighlighted ? 'ring-[1px] ring-offset-[3px] ring-offset-heritage-parchment-light ring-heritage-gold' : 'opacity-80',
            person.gender === 'male' ? 'bg-[#d4e4f0] text-[#2c5f7a]' :
            person.gender === 'female' ? 'bg-[#f0d4d4] text-[#7a2c2c]' :
            'bg-[#e8ddd0] text-[#5c4033]'
          )}>
            {isPlaceholder ? <User className="w-4 h-4 opacity-50" /> : (firstName[0] || '?')}
          </div>

          {/* Floating Typography */}
          <div className="flex flex-col pt-1">
            <p className={cn(
              "font-serif tracking-widest leading-none uppercase transition-all duration-700",
              data.isHighlighted ? "text-heritage-espresso font-bold text-sm" : "text-heritage-espresso-light text-xs"
            )}>
              {firstName}
            </p>
            {restName && (
              <p className={cn(
                "font-serif tracking-widest leading-tight uppercase transition-all duration-700 mt-1",
                data.isHighlighted ? "text-heritage-espresso font-bold text-[10px]" : "text-heritage-espresso/60 text-[9px]"
              )}>
                {restName}
              </p>
            )}

            {dateStr && (
              <p className={cn("text-[9px] tracking-[0.2em] mt-1.5 opacity-60", textAccent)}>
                {dateStr}
              </p>
            )}

            {isSpouse && (
              <p className="text-heritage-gold text-[8px] tracking-[0.3em] uppercase mt-1 italic">Spouse</p>
            )}
          </div>

          {/* Admin Edit */}
          <AnimatePresence>
            {canEdit && hovered && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { e.stopPropagation(); onEdit?.(person); }}
                className="absolute right-0 top-2 text-heritage-espresso/30 hover:text-heritage-espresso transition-colors z-20"
              >
                <Edit3 className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Expand Toggle ── */}
        {hasChildren && !isSpouse && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand?.(person.id); }}
            className={cn(
              'absolute -bottom-6 left-[15px] flex items-center justify-center w-5 h-5 rounded-full',
              'text-[9px] transition-all z-10 border',
              isExpanded
                ? 'border-heritage-espresso/20 text-heritage-espresso/50 hover:bg-heritage-espresso/5'
                : 'border-heritage-gold text-heritage-gold hover:bg-heritage-gold hover:text-white'
            )}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {/* ── Admin Actions ── */}
        <AnimatePresence>
          {canEdit && hovered && !isSpouse && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute -bottom-10 left-[20px] flex gap-3 z-30"
            >
              {[
                { label: 'Child', action: () => onAddChild?.(person) },
                { label: 'Sibling', action: () => onAddSibling?.(person) },
                { label: 'Spouse', action: () => onAddSpouse?.(person) },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); action(); }}
                  className="text-[8px] tracking-widest uppercase text-heritage-espresso/50 hover:text-heritage-gold transition-colors"
                >
                  +{label}
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
