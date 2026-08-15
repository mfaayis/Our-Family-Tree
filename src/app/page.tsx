'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TreeCanvas } from '@/components/tree/FamilyTreePage';
import { AnimatedTreeEmblem } from '@/components/landing/AnimatedTreeEmblem';

export default function CinematicExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  
  // Z-Axis Layers
  const layerEmblemRef = useRef<HTMLDivElement>(null);
  const layerTitleRef = useRef<HTMLDivElement>(null);
  const layerStory1Ref = useRef<HTMLDivElement>(null);
  const layerStory2Ref = useRef<HTMLDivElement>(null);
  const layerTreeRef = useRef<HTMLDivElement>(null);
  
  const [treeVisible, setTreeVisible] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Scene 01: The Origin (Blank Parchment -> SVG Draw -> Clip Path Reveal)
    const tlIntro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tlIntro
      .fromTo('.emblem-svg', { opacity: 0 }, { opacity: 1, duration: 1 })
      .fromTo('.cinematic-title', 
        { clipPath: 'inset(100% 0% 0% 0%)', y: 30, opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1, duration: 1.5, stagger: 0.2 },
        "+=1.5"
      );

    // Z-Axis Spatial Scroll Engine
    // We pin the wrapper for 600vh. As you scrub from 0 to 1, we fly through layers.
    const tlZ = gsap.timeline({
      scrollTrigger: {
        trigger: scrollWrapperRef.current,
        start: 'top top',
        end: '+=600%', 
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          // Trigger Tree construction when we arrive at its Z-plane (e.g. 70% of scroll)
          if (self.progress > 0.70 && !treeVisible) {
            setTreeVisible(true);
            gsap.fromTo('.react-flow__node', 
              { opacity: 0, scale: 0.5, filter: 'blur(10px)' }, 
              { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.05, ease: 'expo.out' }
            );
            gsap.fromTo('.react-flow__edge', 
              { opacity: 0 }, 
              { opacity: 1, duration: 0.8, stagger: 0.02, delay: 0.8 }
            );
          }
        }
      }
    });

    // We define the flight path. 
    // To fly "past" an object, we scale it to 20x and blur/fade it.
    // To arrive "at" an object, we scale it from 0.1 to 1.

    // 1. Fly through Title and Emblem
    tlZ
      .to(layerTitleRef.current, { scale: 20, opacity: 0, filter: 'blur(20px)', ease: 'power2.in', duration: 2 }, 0)
      .to(layerEmblemRef.current, { scale: 30, opacity: 0, filter: 'blur(30px)', ease: 'power2.in', duration: 2.5 }, 0)
      
    // 2. Approach Story 1 (EVERY FAMILY HAS A STORY)
      .fromTo(layerStory1Ref.current, 
        { scale: 0.1, opacity: 0, filter: 'blur(10px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 1.5 },
        0.5 // Start approaching as we pass the title
      )
      // Fly past Story 1
      .to(layerStory1Ref.current, { scale: 15, opacity: 0, filter: 'blur(20px)', ease: 'power2.in', duration: 1.5 }, 2)

    // 3. Approach Story 2 (EVERY NAME BECOMES A CONNECTION)
      .fromTo(layerStory2Ref.current,
        { scale: 0.1, opacity: 0, filter: 'blur(10px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 1.5 },
        2 // Start approaching as we pass Story 1
      )
      // Fly past Story 2
      .to(layerStory2Ref.current, { scale: 15, opacity: 0, filter: 'blur(20px)', ease: 'power2.in', duration: 1.5 }, 3.5)

    // 4. Approach the Tree Canvas
      .fromTo(layerTreeRef.current,
        { scale: 0.2, opacity: 0, filter: 'blur(30px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'power3.out', duration: 2 },
        3.5 // Start approaching as we pass Story 2
      );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [treeVisible]);

  return (
    <div className="bg-noise min-h-screen bg-heritage-parchment-light overflow-x-hidden">
      
      {/* 
        SPATIAL CAMERA WRAPPER
        This div is pinned. The Z-layers inside it are manipulated by GSAP.
        By stacking them absolute and scaling them, we simulate a 3D Z-axis camera.
      */}
      <div ref={scrollWrapperRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden z-20">
        
        {/* LAYER 5: THE TREE (Deepest Z) */}
        <div ref={layerTreeRef} className="absolute inset-0 z-10 w-full h-full opacity-0 pointer-events-auto">
           <TreeCanvas />
        </div>

        {/* LAYER 4: STORY 2 */}
        <div ref={layerStory2Ref} className="absolute z-20 flex flex-col items-center justify-center text-center opacity-0 pointer-events-none w-full px-4">
          <h2 className="font-serif text-5xl md:text-8xl font-bold text-heritage-espresso leading-tight">
            EVERY NAME <br/>
            <span className="text-heritage-gold italic">BECOMES A CONNECTION.</span>
          </h2>
        </div>

        {/* LAYER 3: STORY 1 */}
        <div ref={layerStory1Ref} className="absolute z-30 flex flex-col items-center justify-center text-center opacity-0 pointer-events-none w-full px-4">
          <h2 className="font-serif text-5xl md:text-7xl font-bold text-heritage-espresso leading-tight mb-8">
            <span className="inline-block">EVERY</span> <span className="inline-block">FAMILY</span> <br/>
            <span className="inline-block">HAS</span> <span className="inline-block">A</span> <span className="inline-block">STORY.</span>
          </h2>
          <p className="font-serif text-2xl md:text-4xl text-heritage-espresso-light/80 italic">
            More than names. More than dates. <br/>
            A collection of lives and memories.
          </p>
        </div>

        {/* LAYER 2: EMBLEM (Background of Title) */}
        <div ref={layerEmblemRef} className="absolute z-40 inset-0 flex items-center justify-center opacity-40 emblem-svg pointer-events-none">
          <AnimatedTreeEmblem />
        </div>

        {/* LAYER 1: TITLE (Closest Z) */}
        <div ref={layerTitleRef} className="absolute z-50 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <div className="cinematic-title font-serif text-sm tracking-[0.4em] uppercase text-heritage-gold-dark mb-6">
            The Kassim Pillai Family Archive
          </div>
          <h1 className="font-serif text-7xl md:text-9xl font-bold leading-[0.9] tracking-tighter text-heritage-espresso">
            <span className="cinematic-title block">OUR FAMILY</span>
            <span className="cinematic-title block text-heritage-gold italic mt-2">STORY</span>
          </h1>
        </div>

      </div>

      {/* 
        ARCHIVAL TAIL (SCENES 17-21)
        This exists outside the pinned Z-camera. 
        Once you scroll past 600vh, the pinned container unpins and scrolls up,
        revealing the Archival Tail underneath it.
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
