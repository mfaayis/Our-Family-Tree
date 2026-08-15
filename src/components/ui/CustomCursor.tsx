'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState('');
  const [cursorVariant, setCursorVariant] = useState('default');
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Look up tree for data-cursor attributes
      const el = target.closest('[data-cursor]') as HTMLElement;
      
      if (el) {
        setCursorVariant(el.getAttribute('data-cursor') || 'hover');
        setCursorText(el.getAttribute('data-cursor-text') || '');
      } else if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' ||
        target.closest('button') || 
        target.closest('a')
      ) {
        setCursorVariant('hover');
        setCursorText('');
      } else {
        setCursorVariant('default');
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  // Check if we are on touch device to disable custom cursor
  const [isTouch, setIsTouch] = useState(true);
  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  if (isTouch) return null;

  const variants = {
    default: {
      width: 12,
      height: 12,
      x: -6,
      y: -6,
      backgroundColor: 'rgba(44, 24, 16, 0.4)', // espresso with opacity
      border: '1px solid transparent',
      opacity: 1,
    },
    hover: {
      width: 48,
      height: 48,
      x: -24,
      y: -24,
      backgroundColor: 'rgba(196, 160, 100, 0.15)', // gold tint
      border: '1px solid rgba(196, 160, 100, 0.5)',
      opacity: 1,
    },
    explore: {
      width: 80,
      height: 80,
      x: -40,
      y: -40,
      backgroundColor: 'rgba(44, 24, 16, 0.85)',
      border: '1px solid rgba(196, 160, 100, 0.8)',
      opacity: 1,
    },
    view: {
      width: 64,
      height: 64,
      x: -32,
      y: -32,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      opacity: 1,
      mixBlendMode: 'difference' as any,
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full flex items-center justify-center text-center backdrop-blur-[1px]"
      variants={variants}
      animate={cursorVariant}
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 400, mass: 0.5 }}
    >
      {(cursorVariant === 'explore' || cursorVariant === 'view') && cursorText && (
        <span className="text-[10px] font-semibold tracking-widest uppercase font-sans text-white">
          {cursorText}
        </span>
      )}
    </motion.div>
  );
}
