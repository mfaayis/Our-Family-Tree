'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getFamilyStats } from '@/lib/db';
import { Users, GitBranch, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';


const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: 'easeOut' as const },
  }),
};

export function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalMembers: 0, generations: 0, branches: 5 });

  useEffect(() => {
    if (!loading && user) router.push('/tree');
  }, [user, loading, router]);

  useEffect(() => {
    getFamilyStats().then(s => setStats(s)).catch(() => {});
  }, []);

  const statItems = [
    { value: stats.totalMembers || '35+', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { value: stats.generations || '4', label: 'Generations', icon: <Layers className="w-4 h-4" /> },
    { value: stats.branches || '5', label: 'Branches', icon: <GitBranch className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(145deg, #faf6ee 0%, #f4ebd8 40%, #eedfc4 100%)' }}>

      {/* ── Decorative floating orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,160,100,0.18) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,90,43,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,180,120,0.10) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Navbar strip ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex items-center justify-between px-6 sm:px-12 pt-6"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="font-serif font-bold text-[#4a332a] text-lg tracking-tight">Kassim Pillai Family</span>
        </div>
        <Link href="/login">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="text-sm font-semibold text-[#8b5a2b] hover:text-[#4a332a] transition-colors px-4 py-1.5 rounded-full border border-[#8b5a2b]/30 hover:border-[#8b5a2b]/60 bg-[#fffdf5]/60 backdrop-blur"
          >
            Admin Login
          </motion.button>
        </Link>
      </motion.nav>

      {/* ── Hero ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 sm:pt-24">

        {/* Floating family crest / seal */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-10"
        >
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 border-[#c4a064]/50"
            style={{
              background: 'linear-gradient(135deg, #f4ebd8 0%, #eddcb8 50%, #e4cc98 100%)',
              boxShadow: '0 20px 60px -10px rgba(139,90,43,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            🌳
          </div>
        </motion.div>

        {/* Eyebrow label */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ background: 'rgba(139,90,43,0.08)', color: '#8b5a2b', border: '1px solid rgba(139,90,43,0.2)' }}>
            <Sparkles className="w-3 h-3" />
            The Kassim Pillai Family Heritage
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.0] tracking-tight mb-6"
          style={{ color: '#2c1810' }}
        >
          Our Family<br />
          <span style={{
            background: 'linear-gradient(135deg, #8b5a2b 0%, #c4a064 50%, #8b5a2b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Story
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-lg sm:text-xl text-[#5c4033]/70 mb-14 max-w-xl leading-relaxed font-serif"
        >
          A living archive of every person, every story, and every connection that makes us who we are. Explore four generations of the Kassim Pillai family.
        </motion.p>

        {/* Stats row */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="flex gap-6 sm:gap-12 mb-14"
        >
          {statItems.map(({ value, label, icon }) => (
            <div key={label} className="text-center">
              <div className="text-4xl sm:text-5xl font-black mb-1" style={{ color: '#4a332a' }}>{value}</div>
              <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest font-semibold" style={{ color: '#8b5a2b' }}>
                {icon} {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Single CTA Button — no sign up */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/tree">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 20px 50px -8px rgba(139,90,43,0.40)' }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-base font-bold text-[#fffdf5] shadow-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #4a332a 0%, #8b5a2b 50%, #c4a064 100%)',
                boxShadow: '0 12px 40px -6px rgba(139,90,43,0.35)',
              }}
            >
              <span>Explore the Family Tree</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
            </motion.button>
          </Link>
          <p className="text-xs text-[#8b5a2b]/50 mt-3 tracking-wide">No account required · Free to explore</p>
        </motion.div>
      </div>

      {/* ── Feature cards ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative z-10 max-w-5xl mx-auto px-4 pb-24"
      >
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              emoji: '🌿',
              title: 'Living Archive',
              desc: 'The tree grows in real time as new relatives and stories are added by the family admin.',
              color: 'from-emerald-50 to-teal-50',
              border: 'border-emerald-200/50',
            },
            {
              emoji: '📜',
              title: 'Centuries of History',
              desc: 'Trace your roots across four generations. Every branch tells a chapter of our shared story.',
              color: 'from-amber-50 to-orange-50',
              border: 'border-amber-200/50',
            },
            {
              emoji: '🔗',
              title: 'Every Connection',
              desc: 'See how cousins, aunts, uncles, and spouses weave together into one beautiful family portrait.',
              color: 'from-rose-50 to-pink-50',
              border: 'border-rose-200/50',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
              className={`rounded-3xl p-8 border bg-gradient-to-br ${f.color} ${f.border} backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-900/10 transition-shadow duration-300`}
            >
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="font-serif text-lg font-bold text-[#4a332a] mb-2">{f.title}</h3>
              <p className="text-[#785b46]/80 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          custom={3}
          variants={fadeUp}
          className="text-center text-xs text-[#8b5a2b]/40 mt-10 tracking-wide font-serif italic"
        >
          A private digital heritage archive · Kassim Pillai Family · Est. 2024
        </motion.p>
      </motion.div>
    </div>
  );
}
