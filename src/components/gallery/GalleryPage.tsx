'use client';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { getPhotos } from '@/lib/db';
import type { PhotoAsset } from '@/lib/types';
import { motion } from 'framer-motion';
import { Image as ImageIcon, MapPin } from 'lucide-react';

export function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPhotos();
        setPhotos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4 tracking-tight">Photo Archive</h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto font-serif">
            A visual record of the Kassim Pillai family.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm max-w-3xl mx-auto">
            <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-stone-700 mb-2">No photos uploaded yet</h3>
            <p className="text-stone-500">Administrators can add family photos to build the archive.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-stone-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || 'Family photo'} 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {photo.caption && (
                    <p className="text-white font-medium text-lg font-serif mb-2">{photo.caption}</p>
                  )}
                  <div className="flex items-center gap-4 text-white/80 text-xs font-semibold uppercase tracking-wider">
                    {photo.date && <span>{photo.date}</span>}
                    {photo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {photo.location}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
