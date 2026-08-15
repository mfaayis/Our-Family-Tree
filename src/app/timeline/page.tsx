'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { getTimelineEvents } from '@/lib/db';
import type { TimelineEvent } from '@/lib/types';
import { motion } from 'framer-motion';
import { History, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTimelineEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group events by year for better visual layout
  const eventsByYear = events.reduce((acc, event) => {
    if (!acc[event.year]) acc[event.year] = [];
    acc[event.year].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  const years = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => a - b); // Chronological

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="pt-32 pb-24 px-4 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <History className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4 tracking-tight">Family Timeline</h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto font-serif">
            A chronological journey through the generations of the Kassim Pillai family.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : years.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-stone-700 mb-2">No timeline events yet</h3>
            <p className="text-stone-500">Administrators can add significant dates to build the family timeline.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Center Line for Desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-amber-200 -translate-x-1/2" />
            
            {/* Left Line for Mobile */}
            <div className="md:hidden absolute left-8 top-0 bottom-0 w-px bg-amber-200" />

            <div className="space-y-24">
              {years.map((year, yearIndex) => (
                <div key={year} className="relative">
                  {/* Year Marker */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="sticky top-24 z-10 flex justify-start md:justify-center mb-12"
                  >
                    <div className="bg-amber-600 text-white font-serif font-bold text-2xl px-6 py-2 rounded-full shadow-lg border-4 border-stone-50 md:mx-auto ml-2">
                      {year}
                    </div>
                  </motion.div>

                  <div className="space-y-12">
                    {eventsByYear[year].map((event, eventIndex) => {
                      const isEven = eventIndex % 2 === 0;
                      return (
                        <motion.div 
                          key={event.id}
                          initial={{ opacity: 0, y: 30, x: isEven ? -20 : 20 }}
                          whileInView={{ opacity: 1, y: 0, x: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          className={cn(
                            "relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16",
                            isEven ? "md:flex-row-reverse" : ""
                          )}
                        >
                          {/* Point on the line */}
                          <div className="absolute left-[31px] md:left-1/2 w-4 h-4 rounded-full bg-amber-400 border-4 border-stone-50 md:-translate-x-1/2 mt-6 md:mt-0 z-10" />

                          {/* Empty side for layout balance on desktop */}
                          <div className="hidden md:block md:w-1/2" />

                          {/* Content Card */}
                          <div className="w-full md:w-1/2 pl-16 md:pl-0">
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200 hover:shadow-2xl hover:border-amber-200 transition-all duration-300 group">
                              {event.date && (
                                <div className="text-sm font-semibold text-amber-700 mb-2">{event.date}</div>
                              )}
                              <h3 className="text-2xl font-serif text-stone-800 mb-3 group-hover:text-amber-800 transition-colors">{event.title}</h3>
                              <p className="text-stone-600 leading-relaxed font-serif">
                                {event.description}
                              </p>
                              {event.photoUrl && (
                                <div className="mt-6 rounded-xl overflow-hidden aspect-video bg-stone-100">
                                  <img src={event.photoUrl} alt={event.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
