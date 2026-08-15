'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function AnimatedTreeEmblem() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const paths = svgRef.current.querySelectorAll('path');
    
    // Set initial state for drawing animation
    gsap.set(paths, { 
      strokeDasharray: (i, target) => target.getTotalLength(),
      strokeDashoffset: (i, target) => target.getTotalLength(),
      opacity: 0,
    });
    
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    
    // Draw the trunk first
    tl.to(paths[0], { strokeDashoffset: 0, opacity: 1, duration: 2, ease: 'power3.out' })
    // Then branches stagger
    .to(Array.from(paths).slice(1), { 
      strokeDashoffset: 0, 
      opacity: 1, 
      duration: 1.5, 
      stagger: 0.1 
    }, "-=1")
    // Finally, ambient floating movement for the whole tree
    .to(svgRef.current, {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

  }, []);

  return (
    <svg 
      ref={svgRef}
      viewBox="0 0 400 400" 
      className="w-full h-full max-w-[600px] max-h-[600px]"
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Trunk */}
      <path className="text-heritage-gold" strokeWidth="4" d="M200 380 Q190 250 200 200" />
      {/* Main Branches */}
      <path className="text-heritage-gold" d="M200 200 Q150 150 100 100" />
      <path className="text-heritage-gold" d="M200 200 Q250 150 300 100" />
      <path className="text-heritage-gold" d="M195 250 Q120 200 80 180" />
      <path className="text-heritage-gold" d="M205 250 Q280 200 320 180" />
      
      {/* Secondary Branches */}
      <path className="text-heritage-gold/60" d="M150 150 Q120 100 140 80" />
      <path className="text-heritage-gold/60" d="M250 150 Q280 100 260 80" />
      <path className="text-heritage-gold/60" d="M160 215 Q140 160 100 150" />
      <path className="text-heritage-gold/60" d="M240 215 Q260 160 300 150" />
      
      {/* Tertiary / Small Branches */}
      <path className="text-heritage-gold/40" d="M125 125 Q100 80 110 60" />
      <path className="text-heritage-gold/40" d="M275 125 Q300 80 290 60" />
      <path className="text-heritage-gold/40" d="M100 100 Q80 70 60 80" />
      <path className="text-heritage-gold/40" d="M300 100 Q320 70 340 80" />
      <path className="text-heritage-gold/40" d="M200 200 Q180 130 200 80" />
    </svg>
  );
}
