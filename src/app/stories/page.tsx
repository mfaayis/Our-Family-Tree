'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { getStories } from '@/lib/db';
import type { Story } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BookOpen, User } from 'lucide-react';
import Link from 'next/link';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStories();
        setStories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-heritage-parchment-light pt-32 pb-16 px-4 max-w-4xl mx-auto" data-cursor="default">
      <Navbar />
      
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-semibold tracking-[0.25em] uppercase text-heritage-gold-dark border border-heritage-gold-dark/20 bg-heritage-gold-dark/5">
            <BookOpen className="w-3 h-3" />
            Family Stories
          </div>
          <h1 className="text-6xl md:text-8xl font-serif text-heritage-espresso mb-8 tracking-tighter leading-none">
            Generations of <br />
            <span className="text-heritage-gold italic">Memories</span>
          </h1>
          <p className="text-xl text-heritage-espresso-light/70 max-w-2xl mx-auto font-serif italic">
            The anecdotes, trials, and triumphs that have shaped the Kassim Pillai family.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-stone-700 mb-2">No stories written yet</h3>
            <p className="text-stone-500">Check back later or ask an administrator to add family stories.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {stories.map((story, i) => (
              <motion.article 
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-stone-200/50 border border-stone-200/60"
              >
                {story.photoUrls && story.photoUrls.length > 0 && (
                  <div className="w-full h-64 md:h-80 bg-stone-200 relative overflow-hidden">
                    <img 
                      src={story.photoUrls[0]} 
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-amber-700 mb-4">
                    {story.date && <span>{story.date}</span>}
                    {story.date && <span className="w-1 h-1 bg-amber-300 rounded-full" />}
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {story.authorName}
                    </span>
                  </div>
                  <h2 className="text-3xl font-serif text-stone-800 mb-6 leading-tight">{story.title}</h2>
                  <div className="prose prose-stone prose-lg max-w-none text-stone-600 font-serif leading-relaxed">
                    {/* In a real app we'd use a markdown parser, but for now we'll just split by newlines */}
                    {story.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                  
                  {story.personIds && story.personIds.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-stone-400 uppercase tracking-wider mr-2">Featured:</span>
                      {story.personIds.map(id => (
                        <Link key={id} href={`/tree?focus=${id}`} className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm rounded-full transition-colors">
                          View in Tree
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
