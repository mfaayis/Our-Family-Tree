import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, ArrowUpCircle, ArrowDownCircle, Target } from 'lucide-react';
import type { Person } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSidePanelProps {
  person: Person | null;
  onClose: () => void;
  onViewBranch: (id: string) => void;
  onViewAncestors: (id: string) => void;
  onViewDescendants: (id: string) => void;
  onAddRelative: (type: 'child' | 'parent' | 'sibling' | 'spouse', target: Person) => void;
  onOpenProfile: (id: string) => void;
}

export function ProfileSidePanel({
  person,
  onClose,
  onViewBranch,
  onViewAncestors,
  onViewDescendants,
  onAddRelative,
  onOpenProfile,
}: ProfileSidePanelProps) {
  const { canEdit } = useAuth();

  return (
    <AnimatePresence>
      {person && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/30 z-40 md:hidden"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-96 bg-[#fffdf5] border-l border-[#8b5a2b]/20 shadow-2xl z-50 flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-[#8b5a2b]/10 flex flex-col items-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[#8b5a2b] hover:bg-[#8b5a2b]/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <Avatar className="w-24 h-24 ring-4 ring-[#f4ebd8] shadow-md mb-4">
                <AvatarImage src={person.photoUrl || ''} alt={person.fullName} className="object-cover" />
                <AvatarFallback className="text-2xl font-serif bg-gradient-to-br from-[#f4ebd8] to-[#e6d5b8] text-[#8b5a2b]">
                  {person.isPlaceholder ? '?' : getInitials(person.fullName)}
                </AvatarFallback>
              </Avatar>

              <h2 className="font-serif text-2xl font-bold text-[#4a332a] text-center leading-tight">
                {person.isPlaceholder ? 'Unknown Person' : person.fullName}
              </h2>
              
              <div className="flex gap-4 mt-2 font-serif text-sm text-[#785b46] tracking-wide uppercase">
                {person.dateOfBirth && <span>★ {new Date(person.dateOfBirth).getFullYear()}</span>}
                {person.dateOfDeath && <span>✝ {new Date(person.dateOfDeath).getFullYear()}</span>}
              </div>
            </div>

            {/* Content Actions */}
            <div className="flex-1 p-6 space-y-6">
              
              <div className="space-y-3">
                <h3 className="font-serif text-xs tracking-widest text-[#8b5a2b]/80 uppercase">Navigate Tree</h3>
                
                <button
                  onClick={() => onViewBranch(person.id)}
                  className="w-full flex items-center gap-3 p-3 text-left border border-[#8b5a2b]/20 rounded-xl hover:bg-[#8b5a2b]/5 hover:border-[#8b5a2b]/40 transition-colors text-[#5c4033]"
                >
                  <Target className="w-5 h-5 opacity-70" />
                  <div>
                    <div className="font-medium">Center & View Branch</div>
                    <div className="text-xs opacity-70">Focus the tree on this person</div>
                  </div>
                </button>

                <button
                  onClick={() => onViewAncestors(person.id)}
                  className="w-full flex items-center gap-3 p-3 text-left border border-[#8b5a2b]/20 rounded-xl hover:bg-[#8b5a2b]/5 hover:border-[#8b5a2b]/40 transition-colors text-[#5c4033]"
                >
                  <ArrowUpCircle className="w-5 h-5 opacity-70" />
                  <div>
                    <div className="font-medium">View Ancestors</div>
                    <div className="text-xs opacity-70">Trace lineage upwards</div>
                  </div>
                </button>

                <button
                  onClick={() => onViewDescendants(person.id)}
                  className="w-full flex items-center gap-3 p-3 text-left border border-[#8b5a2b]/20 rounded-xl hover:bg-[#8b5a2b]/5 hover:border-[#8b5a2b]/40 transition-colors text-[#5c4033]"
                >
                  <ArrowDownCircle className="w-5 h-5 opacity-70" />
                  <div>
                    <div className="font-medium">View Descendants</div>
                    <div className="text-xs opacity-70">See all generations below</div>
                  </div>
                </button>
              </div>

              {canEdit && (
                <div className="space-y-3">
                  <h3 className="font-serif text-xs tracking-widest text-[#8b5a2b]/80 uppercase">Add Relatives</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(['parent', 'child', 'spouse', 'sibling'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => onAddRelative(type, person)}
                        className="flex items-center justify-center gap-2 p-2.5 text-sm font-medium border border-[#8b5a2b]/20 rounded-lg hover:bg-[#8b5a2b]/5 text-[#5c4033] capitalize transition-colors"
                      >
                        <UserPlus className="w-4 h-4 opacity-70" />
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-[#8b5a2b]/10 bg-[#f4ebd8]/30">
              <button
                onClick={() => onOpenProfile(person.id)}
                className="w-full py-3 bg-[#4a332a] hover:bg-[#5c4033] text-[#fffdf5] font-serif font-medium tracking-wide rounded-xl shadow-md transition-colors"
              >
                Open Full Profile
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
