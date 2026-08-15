'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '@/components/layout/Navbar';
import { CinematicHero } from '@/components/landing/CinematicHero';
import { TreeCanvas } from '@/components/tree/FamilyTreePage';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  return (
    <div className="relative bg-heritage-parchment-light min-h-screen">
      <Navbar />
      
      {/* 
        We stack the Hero and the Tree.
        The Hero component will handle pinning and transition out,
        revealing the TreeCanvas beneath it or morphing into it.
      */}
      
      <div className="relative z-10">
        <CinematicHero />
      </div>

      <div className="relative z-20" id="tree-section">
        {/* The Family Tree Interactive Canvas */}
        <div className="h-screen w-full relative">
          <TreeCanvas />
        </div>
      </div>
    </div>
  );
}
