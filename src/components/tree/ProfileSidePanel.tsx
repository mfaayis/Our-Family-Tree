import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Person } from '@/lib/types';
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
  onOpenProfile,
  onViewBranch,
  onViewAncestors,
  onViewDescendants,
  onAddRelative
}: ProfileSidePanelProps) {
  const { canEdit } = useAuth();

  return (
    <AnimatePresence>
      {person && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-40 pointer-events-none flex flex-col md:flex-row justify-between p-8 md:p-16"
        >
          {/* Close Button Top Right */}
          <div className="absolute top-12 right-12 pointer-events-auto z-50">
            <button
              onClick={onClose}
              className="text-heritage-espresso hover:text-heritage-gold transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Left Column: Massive Editorial Name */}
          <div className="flex flex-col justify-end max-w-2xl pb-12 pointer-events-auto">
            <motion.h2 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="font-serif text-7xl md:text-9xl text-heritage-espresso leading-[0.8] tracking-tighter"
            >
              {person.fullName.split(' ').map((name, i) => (
                <span key={i} className="block">{name.toUpperCase()}</span>
              ))}
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-8 flex gap-8 font-serif text-xl text-heritage-espresso/60 tracking-widest uppercase"
            >
              {person.dateOfBirth && <span>Born {new Date(person.dateOfBirth).getFullYear()}</span>}
              {person.dateOfDeath && <span>Died {new Date(person.dateOfDeath).getFullYear()}</span>}
            </motion.div>
          </div>

          {/* Right Column: Actions floating in negative space */}
          <div className="flex flex-col justify-end items-end pb-12 pointer-events-auto">
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-6 text-right"
            >
              <button 
                onClick={() => onOpenProfile(person.id)}
                className="font-serif text-4xl md:text-5xl text-heritage-espresso hover:text-heritage-gold transition-colors italic"
              >
                Read Story
              </button>
              
              <button 
                onClick={() => onViewBranch(person.id)}
                className="font-serif text-2xl text-heritage-espresso/50 hover:text-heritage-gold transition-colors uppercase tracking-widest"
              >
                Explore Branch
              </button>

              <button 
                onClick={() => onViewAncestors(person.id)}
                className="font-serif text-2xl text-heritage-espresso/50 hover:text-heritage-gold transition-colors uppercase tracking-widest"
              >
                View Ancestors
              </button>

              <button 
                onClick={() => onViewDescendants(person.id)}
                className="font-serif text-2xl text-heritage-espresso/50 hover:text-heritage-gold transition-colors uppercase tracking-widest"
              >
                View Descendants
              </button>
            </motion.div>

            {/* Admin Controls */}
            {canEdit && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-16 flex gap-4 text-xs font-semibold tracking-widest uppercase text-heritage-espresso/40"
              >
                <button onClick={() => onAddRelative('parent', person)} className="hover:text-heritage-gold">Add Parent</button>
                <button onClick={() => onAddRelative('sibling', person)} className="hover:text-heritage-gold">Add Sibling</button>
                <button onClick={() => onAddRelative('spouse', person)} className="hover:text-heritage-gold">Add Spouse</button>
                <button onClick={() => onAddRelative('child', person)} className="hover:text-heritage-gold">Add Child</button>
              </motion.div>
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
