'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getFamilyStats } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { TreePine, Users, GitBranch, Layers, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { slideUp, staggerContainer, scaleUp, fadeIn } from '@/lib/animations';

export function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalMembers: 0, generations: 0, branches: 5 });

  useEffect(() => {
    if (!loading && user) {
      router.push('/tree');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Show public stats (counts only, no private data)
    getFamilyStats().then(s => setStats(s)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 overflow-hidden">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" 
          />
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 text-center"
        >
          {/* Logo */}
          <motion.div variants={scaleUp} className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-600 to-amber-800 rounded-[2rem] mb-8 shadow-2xl shadow-amber-900/20">
            <TreePine className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1 variants={slideUp} className="text-5xl sm:text-7xl font-bold text-stone-800 mb-6 leading-tight tracking-tight">
            Our Family Tree
          </motion.h1>
          <motion.p variants={slideUp} className="text-xl sm:text-2xl text-stone-600 mb-4 max-w-2xl mx-auto">
            Preserving our family history for generations to come.
          </motion.p>
          <motion.p variants={slideUp} className="text-lg text-amber-700 font-medium mb-12 uppercase tracking-widest">
            The Kassim Pillai Family
          </motion.p>

          {/* Stats */}
          <motion.div variants={slideUp} className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-16">
            <div className="text-center group">
              <div className="text-5xl font-black text-stone-800 group-hover:text-amber-700 transition-colors">{stats.totalMembers || '35+'}</div>
              <div className="text-sm font-medium text-stone-500 mt-2 flex items-center gap-1.5 justify-center uppercase tracking-wider">
                <Users className="w-4 h-4 text-amber-600" />
                Members
              </div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-black text-stone-800 group-hover:text-amber-700 transition-colors">{stats.generations || '4'}</div>
              <div className="text-sm font-medium text-stone-500 mt-2 flex items-center gap-1.5 justify-center uppercase tracking-wider">
                <Layers className="w-4 h-4 text-amber-600" />
                Generations
              </div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-black text-stone-800 group-hover:text-amber-700 transition-colors">{stats.branches}</div>
              <div className="text-sm font-medium text-stone-500 mt-2 flex items-center gap-1.5 justify-center uppercase tracking-wider">
                <GitBranch className="w-4 h-4 text-amber-600" />
                Branches
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button size="xl" className="gap-2 shadow-xl shadow-amber-900/10 hover:shadow-2xl hover:shadow-amber-900/20 transition-all rounded-full px-8">
                Explore Family Tree
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="xl" variant="ghost" className="gap-2 rounded-full px-8 hover:bg-amber-100/50">
                Join Family
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="max-w-5xl mx-auto px-4 pb-24"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔒',
              title: 'Private & Secure',
              desc: 'Only approved family members can access the family tree. Your family data is protected.'
            },
            {
              icon: '🌳',
              title: 'Living Family Tree',
              desc: 'The tree grows as family members add new relatives. It is always up to date.'
            },
            {
              icon: '📜',
              title: 'Trusted History',
              desc: 'Every change is reviewed and approved. An audit log preserves the complete history.'
            },
          ].map((feature, i) => (
            <motion.div 
              key={feature.title} 
              variants={slideUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-stone-200/50 hover:shadow-xl hover:bg-white transition-all"
            >
              <div className="text-4xl mb-4 bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center">{feature.icon}</div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">{feature.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Privacy notice */}
        <motion.div variants={fadeIn} className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-stone-500 bg-stone-100/50 px-4 py-2 rounded-full">
            <Lock className="w-4 h-4 text-stone-400" />
            This is a private family website. Authentication is required to view family information.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
