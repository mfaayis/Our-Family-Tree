'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Search, History, BookOpen, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/tree', label: 'Tree', icon: TreePine },
  { href: '/stories', label: 'Story', icon: BookOpen },
  { href: '/timeline', label: 'Timeline', icon: History },
  { href: '/gallery', label: 'Archive', icon: Search }, // Or Image, but using Search to match concept for now
];

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: scrolled ? 1 : 0, 
        pointerEvents: scrolled ? 'auto' : 'none' 
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-full bg-heritage-parchment/80 backdrop-blur-md border border-heritage-gold-dark/20 shadow-xl"
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-cursor="hover"
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300',
            pathname === item.href
              ? 'bg-heritage-gold-dark text-white shadow-md'
              : 'text-heritage-espresso-light hover:bg-heritage-gold-dark/10'
          )}
        >
          {item.label}
        </Link>
      ))}

      {isAdmin && (
        <Link
          href="/admin"
          data-cursor="hover"
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 ml-2 border-l border-heritage-gold-dark/20',
            pathname.startsWith('/admin')
              ? 'text-heritage-gold-dark'
              : 'text-heritage-espresso-light hover:text-heritage-gold-dark'
          )}
        >
          Admin
        </Link>
      )}
    </motion.nav>
  );
}
