'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles } from 'lucide-react';
import { AnimatedTreeEmblem } from './AnimatedTreeEmblem';

export function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const storyGroupRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    // --- Initial Entry Animation ---
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Staggered reveal for main title words (using mask/clip-path effect)
    tl.fromTo('.hero-title-word', 
      { y: 100, opacity: 0, rotationX: 45 },
      { y: 0, opacity: 1, rotationX: 0, duration: 1.2, stagger: 0.15, delay: 0.5 }
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1 },
      "-=0.5"
    );

    // --- ScrollTrigger: The Transition to the Tree ---
    const stTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=150%', // 150vh of scrolling before it unpins
        pin: true,
        scrub: 1,
      }
    });

    // 1. Text fades out and moves away
    stTl.to(titleGroupRef.current, { opacity: 0, y: -100, scale: 0.9, duration: 1 })
    
    // 2. The "Every family has a story" text appears
    .fromTo(storyGroupRef.current, 
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1 }
    )
    .to(storyGroupRef.current, { opacity: 0, y: -50, scale: 1.05, duration: 1 }, "+=0.5")

    // 3. The Tree Emblem zooms massively to become the background/canvas
    .to(emblemRef.current, {
      scale: 30, // massive zoom
      opacity: 0, // fade out right as the actual ReactFlow tree underneath becomes visible
      duration: 2,
      ease: 'power2.inOut'
    }, "-=1");

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-heritage-parchment-light">
      
      {/* The Central Tree Emblem */}
      <div 
        ref={emblemRef}
        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-40"
      >
        <AnimatedTreeEmblem />
      </div>

      {/* Main Title Group */}
      <div ref={titleGroupRef} className="relative z-10 text-center px-4 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-semibold tracking-[0.25em] uppercase text-heritage-gold-dark border border-heritage-gold-dark/20 bg-heritage-gold-dark/5">
          <Sparkles className="w-3 h-3" />
          The Kassim Pillai Family Archive
        </div>
        
        <h1 className="font-serif text-7xl sm:text-8xl md:text-9xl font-bold leading-[0.9] tracking-tighter text-heritage-espresso mb-8 flex flex-col gap-2 [perspective:1000px]">
          <span className="hero-title-word origin-bottom block">OUR FAMILY</span>
          <span className="hero-title-word origin-bottom block text-heritage-gold">STORY</span>
        </h1>
        
        <p className="hero-subtitle text-lg sm:text-xl text-heritage-espresso-light/70 max-w-xl font-serif mt-4">
          A living digital archive. Travel through generations, explore connections, and discover the history that shapes us.
        </p>

        <div className="hero-subtitle mt-12 text-sm font-semibold tracking-[0.2em] uppercase text-heritage-espresso-light/40 animate-pulse">
          Scroll to explore
        </div>
      </div>

      {/* Interstitial Story Text */}
      <div ref={storyGroupRef} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-0 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-5xl sm:text-7xl font-bold text-heritage-espresso leading-tight mb-8">
            EVERY FAMILY <br/> HAS A STORY.
          </h2>
          <p className="font-serif text-2xl sm:text-3xl text-heritage-espresso-light/80 leading-relaxed italic">
            More than names. More than dates. <br/>
            A collection of lives, relationships and memories.
          </p>
        </div>
      </div>
    </div>
  );
}
