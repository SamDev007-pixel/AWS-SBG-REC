'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BirdInstance {
  id: string;
  direction: 'ltr' | 'rtl';
  yStart: number; // in vh
  yEnd: number;   // in vh
  scale: number;
  opacity: number;
  duration: number;
  flapSpeed: number;
  delayOffset: number;
  waveAmplitude: number;
  xOffset: number; // offset within flock (px)
  yOffset: number; // offset within flock (px)
}

export const RandomBirds: React.FC = () => {
  const [birds, setBirds] = useState<BirdInstance[]>([]);

  useEffect(() => {
    const maxBirds = 10;

    const spawnBirdGroup = () => {
      setBirds((prev) => {
        if (prev.length >= maxBirds) return prev;

        const groupCount = Math.random() > 0.7 ? (Math.random() > 0.5 ? 3 : 2) : 1;
        const groupId = Math.random().toString(36).substring(2, 9);
        const direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
        const yStart = 15 + Math.random() * 55; // 15vh to 70vh (keep in visible screen height)
        const yEnd = yStart + (Math.random() * 20 - 10); // +/- 10vh drift
        const duration = 12 + Math.random() * 10; // 12s to 22s flight duration
        const waveAmplitude = 2 + Math.random() * 5; // 2vh to 7vh waviness
        
        const newBirds: BirdInstance[] = [];
        for (let i = 0; i < groupCount; i++) {
          const uniqueId = `bird-${groupId}-${i}`;
          // Offset position for birds in a flock
          const xOffset = i * -35 - (Math.random() * 15); // flocking trail offset
          const yOffset = (i % 2 === 0 ? 1 : -1) * i * 12 + (Math.random() * 8 - 4);
          
          // Shared path characteristics with minor individual variations
          const scale = (0.5 + Math.random() * 0.6) * (1 - (i * 0.05)); 
          const opacity = 0.4 + Math.random() * 0.4;
          const flapSpeed = 0.4 + Math.random() * 0.3; // 0.4s to 0.7s
          const delayOffset = Math.random() * -0.6; // desynchronize wings flap

          newBirds.push({
            id: uniqueId,
            direction,
            yStart,
            yEnd,
            scale,
            opacity,
            duration,
            flapSpeed,
            delayOffset,
            waveAmplitude,
            xOffset,
            yOffset
          });
        }

        return [...prev, ...newBirds];
      });
    };

    // Spawn first bird group, then spawn at intervals
    spawnBirdGroup();
    const interval = setInterval(spawnBirdGroup, 6000 + Math.random() * 5000); // 6s to 11s spawn timer

    return () => clearInterval(interval);
  }, []);

  const removeBird = (id: string) => {
    setBirds((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      <style>{`
        @keyframes bird-flap-left {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-35deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes bird-flap-right {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(35deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      <AnimatePresence>
        {birds.map((bird) => {
          const xPath = bird.direction === 'ltr' ? ['-15%', '115%'] : ['115%', '-15%'];
          const yPath = [
            `${bird.yStart + bird.yOffset}vh`,
            `${bird.yStart + bird.yOffset + bird.waveAmplitude}vh`,
            `${bird.yStart + bird.yOffset - bird.waveAmplitude}vh`,
            `${bird.yStart + bird.yOffset + bird.waveAmplitude * 0.4}vh`,
            `${bird.yEnd + bird.yOffset}vh`
          ];

          return (
            <motion.div
              key={bird.id}
              initial={{
                x: bird.direction === 'ltr' ? '-15%' : '115%',
                y: `${bird.yStart + bird.yOffset}vh`,
                opacity: 0
              }}
              animate={{
                x: xPath,
                y: yPath,
                opacity: [0, bird.opacity, bird.opacity, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: bird.duration,
                ease: 'easeInOut',
                times: [0, 0.1, 0.9, 1] // Fade in, hold, fade out
              }}
              onAnimationComplete={() => removeBird(bird.id)}
              className="absolute pointer-events-none select-none"
              style={{
                width: '32px',
                height: '24px',
                transform: bird.direction === 'rtl' ? 'scaleX(-1)' : undefined,
                marginLeft: `${bird.xOffset}px`
              }}
            >
              <div
                style={{
                  transform: `scale(${bird.scale})`,
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}
              >
                <svg viewBox="0 0 40 30" fill="currentColor" className="text-slate-800 w-full h-full">
                  {/* Bird Body */}
                  <path d="M 18,15 Q 20,13 22,15 Q 21,17 19,17 Z" />
                  {/* Left Wing */}
                  <path
                    d="M 19,15 Q 10,8 6,12 Q 13,14 19,15 Z"
                    style={{
                      transformOrigin: '19px 15px',
                      animation: `bird-flap-left ${bird.flapSpeed}s ease-in-out infinite`,
                      animationDelay: `${bird.delayOffset}s`
                    }}
                  />
                  {/* Right Wing */}
                  <path
                    d="M 21,15 Q 30,8 34,12 Q 27,14 21,15 Z"
                    style={{
                      transformOrigin: '21px 15px',
                      animation: `bird-flap-right ${bird.flapSpeed}s ease-in-out infinite`,
                      animationDelay: `${bird.delayOffset}s`
                    }}
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
