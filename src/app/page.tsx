'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TreeCanvas } from '@/components/tree/FamilyTreePage';
import { AnimatedTreeEmblem } from '@/components/landing/AnimatedTreeEmblem';

export default function CinematicExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scene Refs
  const scene1Ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HTMLDivElement>(null);
  
  // To coordinate with TreeCanvas
  const [treeVisible, setTreeVisible] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Intro sequence (Blank Parchment -> Tree Draws -> Title)
    const tlIntro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tlIntro
      .fromTo('.emblem-svg', { opacity: 0 }, { opacity: 1, duration: 1 })
      // (The tree drawing animation runs inside AnimatedTreeEmblem)
      .fromTo('.cinematic-title', 
        { clipPath: 'inset(100% 0% 0% 0%)', y: 50 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.5, stagger: 0.2 },
        "+=1.5"
      );

    // Scroll sequence (The Hero Must Move)
    const tlScroll = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=400%', // 4 screens of scrolling
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          // Once we pass 80% of the scrub, we trigger the tree construction
          if (self.progress > 0.8 && !treeVisible) {
            setTreeVisible(true);
            
            // GSAP stagger to reveal tree nodes
            gsap.fromTo('.react-flow__node', 
              { opacity: 0, scale: 0.8 }, 
              { opacity: 1, scale: 1, duration: 0.8, stagger: 0.05, ease: 'back.out(1.7)' }
            );
            gsap.fromTo('.react-flow__edge', 
              { opacity: 0 }, 
              { opacity: 1, duration: 0.5, stagger: 0.02, delay: 0.5 }
            );
          }
        }
      }
    });

    tlScroll
      // Scene 02: Camera moves toward the tree
      .to(titleRef.current, { scale: 1.5, opacity: 0, filter: 'blur(10px)', duration: 1 })
      .to('.emblem-svg', { scale: 5, opacity: 0, duration: 1.5 }, "<")
      
      // Scene 03: Every Family Has A Story
      .fromTo(storyRef.current, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1 }, "-=0.5")
      .to('.story-word', { color: 'var(--color-heritage-gold)', stagger: 0.1, duration: 0.5 })
      .to(storyRef.current, { opacity: 0, y: -100, scale: 1.1, duration: 1 }, "+=0.5")
      
      // Scene 04: Every Name Becomes A Connection
      .fromTo(connectionRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1 })
      .to(connectionRef.current, { opacity: 0, scale: 1.5, filter: 'blur(10px)', duration: 1 }, "+=0.5")
      
      // Transition to Tree
      .to('.tree-overlay', { opacity: 0, duration: 1 });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [treeVisible]);

  return (
    <div className="bg-noise min-h-screen bg-heritage-parchment-light">
      {/* 
        This is the main scroll container. It is pinned for 400vh.
        Behind it, the TreeCanvas is mounted but hidden by an overlay.
      */}
      
      <div className="fixed inset-0 z-0">
        <TreeCanvas />
      </div>

      <div className="fixed inset-0 z-10 tree-overlay bg-heritage-parchment-light pointer-events-none" />

      <div ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden z-20 pointer-events-none">
        
        {/* Scene 01 / 02 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40 emblem-svg">
          <AnimatedTreeEmblem />
        </div>

        <div ref={titleRef} className="absolute flex flex-col items-center justify-center text-center px-4">
          <div className="cinematic-title font-serif text-sm tracking-[0.4em] uppercase text-heritage-gold-dark mb-6">
            The Kassim Pillai Family Archive
          </div>
          <h1 className="font-serif text-7xl md:text-9xl font-bold leading-[0.9] tracking-tighter text-heritage-espresso">
            <span className="cinematic-title block">OUR FAMILY</span>
            <span className="cinematic-title block text-heritage-gold italic mt-2">STORY</span>
          </h1>
        </div>

        {/* Scene 03 */}
        <div ref={storyRef} className="absolute flex flex-col items-center justify-center text-center opacity-0 px-4 w-full">
          <h2 className="font-serif text-5xl md:text-7xl font-bold text-heritage-espresso leading-tight mb-8 max-w-4xl">
            <span className="story-word">EVERY</span> <span className="story-word">FAMILY</span> <br/>
            <span className="story-word">HAS</span> <span className="story-word">A</span> <span className="story-word">STORY.</span>
          </h2>
          <p className="font-serif text-2xl md:text-4xl text-heritage-espresso-light/80 italic">
            More than names. More than dates. <br/>
            A collection of lives and memories.
          </p>
        </div>

        {/* Scene 04 */}
        <div ref={connectionRef} className="absolute flex items-center justify-center text-center opacity-0 px-4">
          <h2 className="font-serif text-5xl md:text-8xl font-bold text-heritage-espresso leading-tight">
            EVERY NAME <br/>
            <span className="text-heritage-gold italic">BECOMES A CONNECTION.</span>
          </h2>
        </div>

      </div>

      {/* 
        Archival Tail (Scene 17-21)
        This section sits below the 400vh pinned Hero/Tree orchestrator.
        When you scroll past the tree, you enter the archive.
      */}
      <div className="relative z-30 bg-heritage-parchment-light w-full min-h-screen pt-32 pb-64 px-4 flex flex-col items-center border-t border-heritage-gold-dark/10">
        <h2 className="font-serif text-5xl md:text-7xl font-bold text-heritage-espresso mb-32 text-center">
          THE <span className="text-heritage-gold italic">ARCHIVE</span>
        </h2>
        
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-32">
          {/* Asymmetric layout */}
          <div className="md:mt-24" data-cursor="explore" data-cursor-text="STORIES">
            <a href="/stories" className="block relative group">
              <div className="overflow-hidden rounded-2xl aspect-[3/4] bg-heritage-gold-dark/5">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 filter grayscale sepia-[0.3]" />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-heritage-parchment p-8 shadow-xl border border-heritage-gold-dark/10 max-w-[80%]">
                <h3 className="font-serif text-3xl text-heritage-espresso mb-2">Generations of Memories</h3>
                <p className="text-heritage-espresso-light/60 text-sm">Read the stories that shaped us.</p>
              </div>
            </a>
          </div>

          <div data-cursor="explore" data-cursor-text="TIMELINE">
            <a href="/timeline" className="block relative group">
              <div className="overflow-hidden rounded-2xl aspect-[4/3] bg-heritage-gold-dark/5">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=800')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 filter grayscale sepia-[0.3]" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-heritage-parchment p-8 shadow-xl border border-heritage-gold-dark/10 max-w-[80%]">
                <h3 className="font-serif text-3xl text-heritage-espresso mb-2">The Family Timeline</h3>
                <p className="text-heritage-espresso-light/60 text-sm">Trace the major events through history.</p>
              </div>
            </a>
          </div>
        </div>

        {/* Final Constellation / Outro */}
        <div className="mt-48 text-center" data-cursor="default">
          <p className="font-serif text-3xl md:text-5xl text-heritage-espresso italic mb-8">
            The story continues...
          </p>
          <div className="w-px h-32 bg-gradient-to-b from-heritage-gold-dark to-transparent mx-auto opacity-50" />
        </div>
      </div>
    </div>
  );
}
