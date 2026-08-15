'use client';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';

export function GalleryPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Family Gallery</h1>
            <p className="text-stone-500 text-sm">Photos and memories from the family</p>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-12 h-12 text-amber-300" />
          </div>
          <h2 className="text-xl font-bold text-stone-700 mb-3">Gallery Coming Soon</h2>
          <p className="text-stone-400 max-w-md mx-auto">
            The family photo gallery will allow members to upload and share photos.
            Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
