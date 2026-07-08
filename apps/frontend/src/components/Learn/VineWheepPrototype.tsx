'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. Types & Interfaces
// ==========================================

interface VineWheepPrototypeProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export type LandingState = 'CLIMBING' | 'DESCENDING' | 'TOUCHDOWN' | 'RELEASE' | 'WALKING' | 'IDLE';

interface LeafPoint {
  id: string;
  x: number;
  y: number;
  angle: number;
  progress: number;
  isFlower: boolean;
  side: number;
}

// ==========================================
// 2. Leaf and Flower Components
// ==========================================

const Leaf: React.FC<{ active: boolean }> = ({ active }) => (
  <motion.path
    d="M0,0 C5,-8 15,-8 18,-4 C22,0 15,8 0,0"
    fill="#22c55e"
    stroke="#15803d"
    strokeWidth="1.5"
    initial={{ scale: 0 }}
    animate={{ scale: active ? 1 : 0 }}
    transition={{ type: 'spring', stiffness: 150, damping: 10 }}
  />
);

const Flower: React.FC<{ active: boolean }> = ({ active }) => (
  <motion.g
    initial={{ scale: 0 }}
    animate={{ scale: active ? 1.1 : 0 }}
    transition={{ type: 'spring', stiffness: 150, damping: 10 }}
  >
    {/* Pink petals */}
    <circle cx="-5" cy="0" r="4.5" fill="#f472b6" />
    <circle cx="5" cy="0" r="4.5" fill="#f472b6" />
    <circle cx="0" cy="-5" r="4.5" fill="#f472b6" />
    <circle cx="0" cy="5" r="4.5" fill="#f472b6" />
    <circle cx="-3.5" cy="-3.5" r="4.5" fill="#f472b6" />
    <circle cx="3.5" cy="3.5" r="4.5" fill="#f472b6" />
    <circle cx="-3.5" cy="3.5" r="4.5" fill="#f472b6" />
    <circle cx="3.5" cy="-3.5" r="4.5" fill="#f472b6" />
    {/* Yellow Center */}
    <circle cx="0" cy="0" r="4" fill="#fef08a" />
    <circle cx="0" cy="0" r="2" fill="#facc15" />
  </motion.g>
);

// ==========================================
// 3. CloudMan (VineWheep) Character SVG
// ==========================================

interface CloudManProps {
  isScrolling: boolean;
  scrollDirection: 'up' | 'down';
  climbIntensity: number;
  cycleDist: number;
  stepProgress: number;
  isLeftStep: boolean;
  swingRotate: number;
  swingX: number;
  landingState: LandingState;
  touchdownTime: number | null;
  walkProgress: number;
}

const CloudMan: React.FC<CloudManProps> = ({
  isScrolling,
  scrollDirection,
  climbIntensity,
  cycleDist,
  stepProgress,
  isLeftStep,
  swingRotate,
  swingX,
  landingState,
  touchdownTime,
  walkProgress
}) => {
  // Occasional eye blink state
  const [blink, setBlink] = useState(false);

  // Whip states (preserved for backward compatibility with click interaction)
  const [whipState, setWhipState] = useState<
    'idle' | 'whip-left' | 'whip-right' | 'climb-down-left' | 'climb-down-right' | 'climb-up-left' | 'climb-up-right'
  >('idle');
  const [whipProgress, setWhipProgress] = useState<'none' | 'shoot' | 'sparkle' | 'retract'>('none');
  const [bodyOffset, setBodyOffset] = useState({ x: 0, y: 0, rotate: 0 });

  useEffect(() => {
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      // Schedule next blink at random interval (4-7 seconds)
      const nextTime = 4000 + Math.random() * 3000;
      blinkTimeoutRef.current = setTimeout(triggerBlink, nextTime);
    };

    const blinkTimeoutRef = { current: setTimeout(triggerBlink, 3000) };

    return () => clearTimeout(blinkTimeoutRef.current);
  }, []);

  const triggerWhip = useCallback((type: 'left' | 'right') => {
    // Only allow one whip at a time
    setWhipState((current) => {
      if (current !== 'idle') return current;

      const targetState = type === 'left' ? 'whip-left' : 'whip-right';
      setWhipProgress('shoot');

      // Pull action at 200ms
      setTimeout(() => {
        setWhipProgress('sparkle');
        if (type === 'left') {
          setBodyOffset({ x: -10, y: -2, rotate: -6 });
        } else {
          setBodyOffset({ x: 10, y: -2, rotate: 6 });
        }
      }, 200);

      // Retract at 450ms
      setTimeout(() => {
        setWhipProgress('retract');
        setBodyOffset({ x: 0, y: 0, rotate: 0 });
      }, 450);

      // Reset at 700ms
      setTimeout(() => {
        setWhipState('idle');
        setWhipProgress('none');
      }, 700);

      return targetState;
    });
  }, []);

  if (whipState !== 'idle') {
    // Original whipping animation fallback
    const leftArmVariants = {
      idle: { d: "M -18 5 Q -12 8 -6 5" },
      whipLeft: { d: "M -18 5 Q -30 -5 -40 -10" },
      climbUp: { d: "M -18 5 Q -15 -15 -6 -25" },
      climbDown: { d: "M -18 5 Q -15 15 -6 25" }
    };
    const leftHandVariants = {
      idle: { cx: -6, cy: 5 },
      whipLeft: { cx: -40, cy: -10 },
      climbUp: { cx: -6, cy: -25 },
      climbDown: { cx: -6, cy: 25 }
    };

    const rightArmVariants = {
      idle: { d: "M 18 5 Q 12 8 6 5" },
      whipRight: { d: "M 18 5 Q 30 -5 40 -10" },
      climbUp: { d: "M 18 5 Q 15 -15 6 -25" },
      climbDown: { d: "M 18 5 Q 15 15 6 25" }
    };
    const rightHandVariants = {
      idle: { cx: 6, cy: 5 },
      whipRight: { cx: 40, cy: -10 },
      climbUp: { cx: 6, cy: -25 },
      climbDown: { cx: 6, cy: 25 }
    };

    const isWhippingLeft = whipState === 'whip-left';
    const isWhippingRight = whipState === 'whip-right';

    let leftArmAnimate = 'idle';
    if (isWhippingLeft) leftArmAnimate = 'whipLeft';

    let rightArmAnimate = 'idle';
    if (isWhippingRight) rightArmAnimate = 'whipRight';

    return (
      <g
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        onClick={(e) => {
          e.stopPropagation();
          const side = Math.random() > 0.5 ? 'left' : 'right';
          triggerWhip(side);
        }}
      >
        <circle cx="0" cy="0" r="35" fill="transparent" />

        <motion.g
          animate={{
            x: bodyOffset.x,
            y: bodyOffset.y,
            rotate: bodyOffset.rotate
          }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        >
          <motion.g
            animate={{
              y: [0, -3.2, 0],
              x: [0, 1.8, -1.8, 0],
              rotate: [0, 1.2, -1.2, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4.8,
              ease: 'easeInOut'
            }}
          >
            {/* Dangling legs */}
            <motion.g>
              <line x1="-7" y1="16" x2="-9" y2="25" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="-9" cy="25" r="3" fill="#94a3b8" />

              <line x1="7" y1="16" x2="9" y2="25" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="9" cy="25" r="3" fill="#94a3b8" />
            </motion.g>

            {/* Cloud body shadow layer */}
            <path
              d="M -26 4 A 14 14 0 0 1 -8 -14 A 20 20 0 0 1 12 -16 A 16 16 0 0 1 28 4 A 12 12 0 0 1 22 18 L -22 18 A 12 12 0 0 1 -26 4 Z"
              fill="#e2e8f0"
            />

            {/* Cloud body main layer */}
            <path
              d="M -26 1 A 14 14 0 0 1 -8 -17 A 20 20 0 0 1 12 -19 A 16 16 0 0 1 28 1 A 12 12 0 0 1 22 15 L -22 15 A 12 12 0 0 1 -26 1 Z"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Blush Cheeks */}
            <circle cx="-15" cy="3" r="3" fill="#fda4af" opacity="0.9" />
            <circle cx="15" cy="3" r="3" fill="#fda4af" opacity="0.9" />

            {/* Sparkly Eyes */}
            <circle cx="-8" cy="-1" r="2.2" fill="#0f172a" />
            {!blink && <circle cx="-8.7" cy="-1.7" r="0.7" fill="#ffffff" />}

            <circle cx="8" cy="-1" r="2.2" fill="#0f172a" />
            {!blink && <circle cx="7.3" cy="-1.7" r="0.7" fill="#ffffff" />}

            {/* Mouth */}
            <path d="M -2.5 4 Q 0 6.5 2.5 4" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" fill="none" />

            {/* Left arm */}
            <motion.path
              variants={leftArmVariants}
              animate={leftArmAnimate}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              stroke="#cbd5e1"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <motion.circle
              variants={leftHandVariants}
              animate={leftArmAnimate}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              r="4.5"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Right arm */}
            <motion.path
              variants={rightArmVariants}
              animate={rightArmAnimate}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              stroke="#cbd5e1"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <motion.circle
              variants={rightHandVariants}
              animate={rightArmAnimate}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              r="4.5"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Whip effect */}
            <AnimatePresence>
              {whipProgress !== 'none' && (
                <g>
                  <motion.path
                    d={
                      isWhippingLeft
                        ? "M -40 -10 Q -65 -30 -90 -20 T -120 -25"
                        : "M 40 -10 Q 65 -30 90 -20 T 120 -25"
                    }
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0.8 }}
                    animate={{
                      pathLength: whipProgress === 'shoot' || whipProgress === 'sparkle' ? 1 : 0,
                      opacity: whipProgress === 'retract' ? 0 : 1
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  />
                  {whipProgress === 'sparkle' && (
                    <g transform={isWhippingLeft ? "translate(-120, -25)" : "translate(120, -25)"}>
                      <motion.circle
                        r="0"
                        fill="none"
                        stroke="#fef08a"
                        strokeWidth="1.5"
                        animate={{ r: 12, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                      <motion.circle
                        r="4"
                        fill="#fef08a"
                        animate={{ scale: [1, 1.5, 0] }}
                        transition={{ duration: 0.25 }}
                      />
                    </g>
                  )}
                </g>
              )}
            </AnimatePresence>
          </motion.g>
        </motion.g>
      </g>
    );
  }

  // ==========================================
  // CLIMBING, LANDING, & WALKING VECTOR SOLVER
  // ==========================================
  const time = typeof window !== 'undefined' ? performance.now() : 0;
  const HALF_CYCLE = 30;

  // 1. Hand and Shoulder / Arm Positions
  const leftHandIdle = { x: -6, y: 5 };
  const rightHandIdle = { x: 6, y: 5 };

  let leftHandClimb = { x: -6, y: 5 };
  let rightHandClimb = { x: 6, y: 5 };

  if (isLeftStep) {
    rightHandClimb = {
      x: 6,
      y: -15 + 30 * stepProgress
    };
    leftHandClimb = {
      x: -6 - 12 * Math.sin(Math.PI * stepProgress),
      y: 15 - 30 * stepProgress
    };
  } else {
    leftHandClimb = {
      x: -6,
      y: -15 + 30 * stepProgress
    };
    rightHandClimb = {
      x: 6 + 12 * Math.sin(Math.PI * stepProgress),
      y: 15 - 30 * stepProgress
    };
  }

  // Base arm coordinates
  let leftHand = {
    x: leftHandIdle.x * (1 - climbIntensity) + leftHandClimb.x * climbIntensity,
    y: leftHandIdle.y * (1 - climbIntensity) + leftHandClimb.y * climbIntensity
  };
  let rightHand = {
    x: rightHandIdle.x * (1 - climbIntensity) + rightHandClimb.x * climbIntensity,
    y: rightHandIdle.y * (1 - climbIntensity) + rightHandClimb.y * climbIntensity
  };

  // Base squash & stretch & offsets
  let stretchY = 1 + 0.08 * Math.sin(2 * Math.PI * stepProgress - Math.PI / 2) * climbIntensity;
  let stretchX = 1 - 0.05 * Math.sin(2 * Math.PI * stepProgress - Math.PI / 2) * climbIntensity;

  let bodyRotate = swingRotate * climbIntensity;
  let bodyX = swingX * climbIntensity;

  const idleY = Math.sin(time * 0.002) * 2.5 * (1 - climbIntensity);
  const idleX = Math.sin(time * 0.001) * 1.5 * (1 - climbIntensity);
  const idleRotate = Math.sin(time * 0.0015) * 1.2 * (1 - climbIntensity);

  let totalX = bodyX + idleX;
  let totalY = idleY;
  let totalRotate = bodyRotate + idleRotate;
  let totalScaleX = stretchX;
  let totalScaleY = stretchY;

  // Adapt for different landing states
  const isWalking = landingState === 'WALKING';
  const isIdle = landingState === 'IDLE';
  const isTouchdown = landingState === 'TOUCHDOWN';
  const isRelease = landingState === 'RELEASE';

  if (isTouchdown) {
    // 300ms squash & stretch
    const elapsed = touchdownTime ? Math.max(0, time - touchdownTime) : 0;
    const t = Math.min(1, elapsed / 300);
    const squash = Math.sin(t * Math.PI);
    totalScaleY = 1.0 - 0.15 * squash;
    totalScaleX = 1.0 + 0.08 * squash;
    totalRotate = 0;
    totalX = 0;
    totalY = 4; // Sink slightly on touchdown
  } else if (isRelease || isWalking || isIdle) {
    // Straight relaxed body, turn slightly towards learner
    totalRotate = isIdle ? Math.sin(time * 0.0015) * 0.8 : 0;
    totalX = 0;
    totalY = isIdle ? Math.sin(time * 0.002) * 0.6 : 0;

    // Idle breathing
    if (isIdle) {
      const breathe = Math.sin(time * 0.002) * 0.015;
      totalScaleY = 1.0 + breathe;
      totalScaleX = 1.0 - breathe * 0.5;
    } else {
      totalScaleY = 1.0;
      totalScaleX = 1.0;
    }
  }

  // Calculate shoulder locations based on body transforms
  const transformPoint = (x: number, y: number, tx: number, ty: number, angle: number, sx: number, sy: number) => {
    const scaleX = x * sx;
    const scaleY = y * sy;
    const rad = (angle * Math.PI) / 180;
    const rotX = scaleX * Math.cos(rad) - scaleY * Math.sin(rad);
    const rotY = scaleX * Math.sin(rad) + scaleY * Math.cos(rad);
    return {
      x: rotX + tx,
      y: rotY + ty
    };
  };

  const leftShoulder = transformPoint(-18, 5, totalX, totalY, totalRotate, totalScaleX, totalScaleY);
  const rightShoulder = transformPoint(18, 5, totalX, totalY, totalRotate, totalScaleX, totalScaleY);

  // Arm Path String setup
  let leftArmD = '';
  let rightArmD = '';

  if (isRelease || isWalking || isIdle) {
    // Relaxed hanging arms at the body's sides
    let lSwing = 0;
    let rSwing = 0;
    if (isWalking) {
      // Walking arm swing cycle
      const walkCycle = walkProgress * Math.PI * 10;
      lSwing = 5 * Math.sin(walkCycle);
      rSwing = -5 * Math.sin(walkCycle);
    }
    leftHand = { x: leftShoulder.x - 3 + lSwing, y: leftShoulder.y + 20 };
    rightHand = { x: rightShoulder.x + 3 + rSwing, y: rightShoulder.y + 20 };

    leftArmD = `M ${leftShoulder.x} ${leftShoulder.y} Q ${leftShoulder.x - 3} ${leftShoulder.y + 10}, ${leftHand.x} ${leftHand.y}`;
    rightArmD = `M ${rightShoulder.x} ${rightShoulder.y} Q ${rightShoulder.x + 3} ${rightShoulder.y + 10}, ${rightHand.x} ${rightHand.y}`;
  } else {
    // Standard climbing arms holding the vine
    const leftMid = { x: (leftShoulder.x + leftHand.x) / 2, y: (leftShoulder.y + leftHand.y) / 2 };
    const leftControl = {
      x: leftMid.x - 6 * climbIntensity,
      y: leftMid.y + 4 * climbIntensity
    };
    leftArmD = `M ${leftShoulder.x} ${leftShoulder.y} Q ${leftControl.x} ${leftControl.y}, ${leftHand.x} ${leftHand.y}`;

    const rightMid = { x: (rightShoulder.x + rightHand.x) / 2, y: (rightShoulder.y + rightHand.y) / 2 };
    const rightControl = {
      x: rightMid.x + 6 * climbIntensity,
      y: rightMid.y + 4 * climbIntensity
    };
    rightArmD = `M ${rightShoulder.x} ${rightShoulder.y} Q ${rightControl.x} ${rightControl.y}, ${rightHand.x} ${rightHand.y}`;
  }

  // 5. Leg Coordinates
  let legLeftY = 25;
  let legLeftX = -9;
  let legRightY = 25;
  let legRightX = 9;

  if (isTouchdown || isRelease) {
    // Standing flat on platform
    legLeftY = 24;
    legLeftX = -8;
    legRightY = 24;
    legRightX = 8;
  } else if (isWalking) {
    // Walking leg steps cycle
    const walkCycle = walkProgress * Math.PI * 10;
    legLeftY = 24 + 4 * Math.max(0, Math.sin(walkCycle));
    legLeftX = -8 + 3 * Math.cos(walkCycle);
    legRightY = 24 + 4 * Math.max(0, Math.sin(walkCycle + Math.PI));
    legRightX = 8 + 3 * Math.cos(walkCycle + Math.PI);
  } else if (isIdle) {
    // Tiny gentle idle stand breath sway
    legLeftY = 24;
    legLeftX = -8;
    legRightY = 24;
    legRightX = 8;
  } else {
    // Standard climbing bicycling legs
    legLeftY = 25 + 4 * Math.sin(Math.PI * (cycleDist / HALF_CYCLE)) * climbIntensity;
    legLeftX = -9 - 2 * Math.cos(Math.PI * (cycleDist / HALF_CYCLE)) * climbIntensity;
    legRightY = 25 - 4 * Math.sin(Math.PI * (cycleDist / HALF_CYCLE)) * climbIntensity;
    legRightX = 9 - 2 * Math.cos(Math.PI * (cycleDist / HALF_CYCLE)) * climbIntensity;
  }

  return (
    <g
      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      onClick={(e) => {
        e.stopPropagation();
        const side = Math.random() > 0.5 ? 'left' : 'right';
        triggerWhip(side);
      }}
    >
      <circle cx="0" cy="0" r="35" fill="transparent" />

      {/* Arms (drawn outside body scale/rotate to keep hands anchored to vine) */}
      <path d={leftArmD} stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx={leftHand.x} cy={leftHand.y} r="4.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

      <path d={rightArmD} stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx={rightHand.x} cy={rightHand.y} r="4.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Main Body Group */}
      <g transform={`translate(${totalX}, ${totalY}) rotate(${totalRotate}) scale(${totalScaleX}, ${totalScaleY})`}>
        {/* Legs */}
        <line x1="-7" y1="16" x2={legLeftX} y2={legLeftY} stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={legLeftX} cy={legLeftY} r="3" fill="#94a3b8" />

        <line x1="7" y1="16" x2={legRightX} y2={legRightY} stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={legRightX} cy={legRightY} r="3" fill="#94a3b8" />

        {/* Cloud shadow */}
        <path
          d="M -26 4 A 14 14 0 0 1 -8 -14 A 20 20 0 0 1 12 -16 A 16 16 0 0 1 28 4 A 12 12 0 0 1 22 18 L -22 18 A 12 12 0 0 1 -26 4 Z"
          fill="#e2e8f0"
        />

        {/* Cloud main */}
        <path
          d="M -26 1 A 14 14 0 0 1 -8 -17 A 20 20 0 0 1 12 -19 A 16 16 0 0 1 28 1 A 12 12 0 0 1 22 15 L -22 15 A 12 12 0 0 1 -26 1 Z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* Cheeks */}
        <circle cx="-15" cy="3" r="3" fill="#fda4af" opacity="0.9" />
        <circle cx="15" cy="3" r="3" fill="#fda4af" opacity="0.9" />

        {/* Eyes (Blinking details) */}
        {blink ? (
          <>
            <line x1="-10.2" y1="-1" x2="-5.8" y2="-1" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="5.8" y1="-1" x2="10.2" y2="-1" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="-8" cy="-1" r="2.2" fill="#0f172a" />
            <circle cx="-8.7" cy="-1.7" r="0.7" fill="#ffffff" />
            <circle cx="8" cy="-1" r="2.2" fill="#0f172a" />
            <circle cx="7.3" cy="-1.7" r="0.7" fill="#ffffff" />
          </>
        )}

        {/* Mouth */}
        <path
          d={isRelease || isWalking || isIdle ? "M -3.5 3 Q 0 6 3.5 3" : (climbIntensity > 0.3 ? "M -3 3 Q 0 1 3 3" : "M -2.5 4 Q 0 6.5 2.5 4")}
          stroke="#0f172a"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </g>
  );
};

// ==========================================
// 4. Configurable Positioning Constants
// ==========================================
const LANDING_REVEAL_MARGIN = 50; // Distance in pixels before platform enters viewport to trigger landing transition

const getViewportHeight = (): number => {
  if (typeof window === 'undefined') return 600;
  return window.innerHeight || document.documentElement.clientHeight || 600;
};

// ==========================================
// 5. Main Component
// ==========================================

export const VineWheepPrototype: React.FC<VineWheepPrototypeProps> = ({
  scrollContainerRef
}) => {
  // Dimension state for responsive container width
  const [dimensions, setDimensions] = useState({ width: 300, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic height of the left topics list rail
  const [topicListHeight, setTopicListHeight] = useState(600);

  // Stable base points and leaf points
  const [basePoints, setBasePoints] = useState<{ x: number; y: number }[]>([]);
  const [baseLeafPoints, setBaseLeafPoints] = useState<LeafPoint[]>([]);

  // Keep path element in state to trigger react effects reliably on layout changes
  const [pathElement, setPathElement] = useState<SVGPathElement | null>(null);

  // Dynamically measured Level Badge coordinates relative to SVG top-left
  const [startCoords, setStartCoords] = useState<{ x: number; y: number } | null>(null);

  // Scroll active state
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef<number>(0);

  // Raw scroll pixel offset (scrollTop)
  const rawScrollTop = useMotionValue(0);

  // Spring smoothing on the pixel scroll position for a butter-smooth travel feeling
  const scrollTopSpring = useSpring(rawScrollTop, {
    stiffness: 90,
    damping: 20,
    restDelta: 0.05
  });

  // Track the smoothed progress along the vine (0.0 to 1.0)
  const [currentProgress, setCurrentProgress] = useState(0);

  // Standard React state for CloudMan position and rotation
  const [cloudPos, setCloudPos] = useState({ x: 150, y: 40, rotate: 0 });

  // Custom climbing intensity animation states
  const [climbIntensity, setClimbIntensity] = useState(0);
  const climbIntensityRef = useRef(0);
  const progressRef = useRef(0);

  // Time-driven climbing cycle phase state and ref accumulator
  const [climbCycle, setClimbCycle] = useState(0);
  const cyclePhaseRef = useRef(0);

  // Dedicated landing controller state variables and refs
  const [landingState, setLandingState] = useState<LandingState>('CLIMBING');
  const landingStateRef = useRef<LandingState>('CLIMBING');
  const [touchdownTime, setTouchdownTime] = useState<number | null>(null);
  const touchdownTimeRef = useRef<number | null>(null);
  const [walkProgress, setWalkProgress] = useState(0);
  const releaseTimeRef = useRef<number | null>(null);
  const walkStartTimeRef = useRef<number | null>(null);

  // Measure the width of the right column container
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      const el = containerRef.current;
      if (el) {
        const newWidth = el.clientWidth || 300;
        setDimensions((prev) => {
          if (prev.width === newWidth) return prev;
          return { ...prev, width: newWidth };
        });
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Measure and observe the height of the left topics list rail (topic-rail-section)
  // This ensures the vine height matches the active roadmap layout perfectly and grows dynamically
  useEffect(() => {
    const rail = document.getElementById('topic-rail-section');
    if (!rail) return;

    const updateHeight = () => {
      if (rail) {
        const newHeight = rail.scrollHeight || rail.clientHeight || 600;
        setTopicListHeight((prev) => {
          if (Math.abs(prev - newHeight) < 2) return prev;
          return newHeight;
        });
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(rail);

    return () => observer.disconnect();
  }, []);

  // Dynamically query coordinates of the green level badge container at the top header
  useEffect(() => {
    const updateCoords = () => {
      const badge = document.getElementById('level-badge-container');
      const svg = containerRef.current;
      if (badge && svg) {
        const badgeRect = badge.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();

        // Calculate center bottom of Level Badge relative to SVG top-left
        const x = badgeRect.left - svgRect.left + badgeRect.width / 2;
        const y = badgeRect.bottom - svgRect.top;

        if (x > 0 && y > -300) {
          setStartCoords((prev) => {
            if (prev && Math.abs(prev.x - x) < 1.5 && Math.abs(prev.y - y) < 1.5) return prev;
            return { x, y };
          });
        }
      }
    };

    // Run measurement after brief layout delay
    const timer = setTimeout(updateCoords, 250);
    window.addEventListener('resize', updateCoords, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
    };
  }, [dimensions.width, topicListHeight]);

  // Generate the stable base points once dimensions/height are resolved
  useEffect(() => {
    if (!dimensions.width || !topicListHeight) return;
    const startX = startCoords ? startCoords.x : dimensions.width / 2;
    const startY = startCoords ? startCoords.y : -40;

    const endY = topicListHeight - 40;
    const totalY = endY - startY;

    // Wave parameters: one wave segment every 140px
    const segmentHeight = 140;
    const numSegments = Math.max(4, Math.ceil(totalY / segmentHeight));
    const actualSegmentHeight = totalY / numSegments;

    const points: { x: number; y: number }[] = [];
    const offsetRange = 35; // wave amplitude

    for (let i = 0; i <= numSegments; i++) {
      const y = startY + i * actualSegmentHeight;
      const isEdge = i === 0 || i === numSegments;
      const randomOffset = isEdge ? 0 : (Math.random() - 0.5) * offsetRange * 2.2;

      // Interpolate horizontal position from level badge (startX) to column center (w / 2)
      const t = i / numSegments;
      const baseX = startX * (1 - t) + (dimensions.width / 2) * t;
      const x = baseX + randomOffset;

      points.push({ x, y });
    }
    setBasePoints(points);
  }, [dimensions.width, topicListHeight, startCoords]);

  // Compute static Bezier path string from base points
  const baseBezierPathString = useMemo(() => {
    if (basePoints.length === 0) return '';
    let path = `M ${basePoints[0].x} ${basePoints[0].y}`;
    const segmentHeight = basePoints[1].y - basePoints[0].y;
    const offsetRange = 35;
    for (let i = 0; i < basePoints.length - 1; i++) {
      const p0 = basePoints[i];
      const p1 = basePoints[i + 1];

      const cpY1 = p0.y + segmentHeight / 3;
      const cpX1 = p0.x + (i % 2 === 0 ? offsetRange : -offsetRange);

      const cpY2 = p1.y - segmentHeight / 3;
      const cpX2 = p1.x + (i % 2 === 0 ? -offsetRange : offsetRange);

      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [basePoints]);

  // Recalculates position coordinates by searching for the path length segment closest to targetY
  const updateCoordinates = useCallback((el: SVGPathElement, targetY: number) => {
    try {
      const totalLength = el.getTotalLength();
      if (totalLength === 0) return;

      // Binary search along the path length to find the point where point.y is closest to targetY
      let low = 0;
      let high = totalLength;
      let len = totalLength / 2;
      let point = el.getPointAtLength(len);

      for (let i = 0; i < 12; i++) {
        if (point.y < targetY) {
          low = len;
        } else {
          high = len;
        }
        len = (low + high) / 2;
        point = el.getPointAtLength(len);
      }

      const pointNext = el.getPointAtLength(Math.min(totalLength, len + 2));
      const pointPrev = el.getPointAtLength(Math.max(0, len - 2));
      const angleRad = Math.atan2(pointNext.y - pointPrev.y, pointNext.x - pointPrev.x);
      const angleDeg = (angleRad * 180) / Math.PI;

      const tilt = Math.max(-12, Math.min(12, angleDeg - 90));

      setCloudPos({
        x: point.x,
        y: targetY, // Keep Y perfectly locked to the camera-relative target Y
        rotate: tilt
      });

      const progressVal = len / totalLength;
      progressRef.current = progressVal;
      setCurrentProgress(progressVal);
    } catch (err) {
      console.error('Error calculating coordinates along path:', err);
    }
  }, []);

  // Ref callback to capture the path element when it mounts
  const pathRefCallback = useCallback((el: SVGPathElement | null) => {
    setPathElement(el);
  }, []);

  // Recalculate leaves, flowers, and CloudMan coordinates whenever the path element or base Bezier path string updates
  useEffect(() => {
    if (!pathElement || !baseBezierPathString) return;

    try {
      const totalLength = pathElement.getTotalLength();
      if (totalLength === 0) return;

      const tempPoints: LeafPoint[] = [];
      const numItems = Math.max(8, Math.floor(totalLength / 80));

      for (let i = 1; i < numItems; i++) {
        const p = i / numItems;
        const len = p * totalLength;
        const point = pathElement.getPointAtLength(len);

        const pointNext = pathElement.getPointAtLength(Math.min(totalLength, len + 2));
        const pointPrev = pathElement.getPointAtLength(Math.max(0, len - 2));
        const angleRad = Math.atan2(pointNext.y - pointPrev.y, pointNext.x - pointPrev.x);
        const angleDeg = (angleRad * 180) / Math.PI;

        const side = i % 2 === 0 ? 1 : -1;
        const leafAngle = angleDeg + side * 60;
        const isFlower = i % 4 === 0;

        tempPoints.push({
          id: `vinewheep-leaf-${i}`,
          x: point.x,
          y: point.y,
          angle: leafAngle,
          progress: p,
          isFlower,
          side
        });
      }
      setBaseLeafPoints(tempPoints);
    } catch (err) {
      console.error('Error generating leaves/flowers:', err);
    }
  }, [pathElement, baseBezierPathString]);



  // Cache layout parameters in refs to prevent useEffect teardown & infinite render loops
  const topicListHeightRef = useRef(topicListHeight);
  const startCoordsRef = useRef(startCoords);
  const scrollContainerRefRef = useRef(scrollContainerRef);
  const pathElementRef = useRef(pathElement);

  useEffect(() => {
    topicListHeightRef.current = topicListHeight;
  }, [topicListHeight]);

  useEffect(() => {
    startCoordsRef.current = startCoords;
  }, [startCoords]);

  useEffect(() => {
    scrollContainerRefRef.current = scrollContainerRef;
  }, [scrollContainerRef]);

  useEffect(() => {
    pathElementRef.current = pathElement;
  }, [pathElement]);

  // Perform initial layout of CloudMan matching the current scroll position
  useEffect(() => {
    if (!dimensions.width || !topicListHeight || !pathElement) return;

    try {
      const currentScrollTop = scrollTopSpring.get();
      const startY = startCoords ? startCoords.y : -40;
      const endY = topicListHeight - 40;

      const viewportHeight = getViewportHeight();

      const maxScroll = Math.max(50, topicListHeight - viewportHeight);
      const scrollRatio = Math.max(0, Math.min(1, currentScrollTop / maxScroll));

      // Lock to 58% of viewport height during main journey (ease in from top at beginning of scroll)
      const entryProgress = Math.min(1, scrollRatio / 0.15);
      const climbY = currentScrollTop + (startY + 45) + entryProgress * (viewportHeight * 0.58 - (startY + 45));

      const scrollAtLandingReveal = Math.max(0, endY - viewportHeight - LANDING_REVEAL_MARGIN);

      if (currentScrollTop >= maxScroll - 2) {
        // Initialize already landed at bottom on page refresh
        setLandingState('IDLE');
        landingStateRef.current = 'IDLE';
        setWalkProgress(1.0);

        const totalLength = pathElement.getTotalLength();
        const endPoint = pathElement.getPointAtLength(totalLength);
        const signboardAnchorX = dimensions.width / 2 + 35;

        setCloudPos({
          x: signboardAnchorX,
          y: endY,
          rotate: 0
        });
        setCurrentProgress(1.0);
      } else {
        const nextState = currentScrollTop >= scrollAtLandingReveal ? 'DESCENDING' : 'CLIMBING';
        setLandingState(nextState);
        landingStateRef.current = nextState;
        setWalkProgress(0);

        let targetY = 0;
        if (currentScrollTop < scrollAtLandingReveal) {
          targetY = climbY;
        } else {
          // Transition from climbY (at reveal scroll) to endY (landing platform) over remaining scroll
          const scrollRatioAtReveal = Math.max(0, Math.min(1, scrollAtLandingReveal / maxScroll));
          const entryProgressAtReveal = Math.min(1, scrollRatioAtReveal / 0.15);
          const climbYAtReveal = scrollAtLandingReveal + (startY + 45) + entryProgressAtReveal * (viewportHeight * 0.58 - (startY + 45));

          const denom = maxScroll - scrollAtLandingReveal;
          const t = denom > 1 ? Math.max(0, Math.min(1, (currentScrollTop - scrollAtLandingReveal) / denom)) : 1;
          const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOut
          targetY = (1 - easedT) * climbYAtReveal + easedT * endY;
        }

        const clampedTargetY = Math.max(startY + 45, Math.min(endY, targetY));
        const clampedProgress = Math.max(0, Math.min(1, (clampedTargetY - startY) / (endY - startY)));

        setCurrentProgress(clampedProgress);
        updateCoordinates(pathElement, clampedTargetY);
      }
    } catch (err) {
      console.error('Error performing dynamic layout updates:', err);
    }
  }, [pathElement, topicListHeight, startCoords, dimensions.width]);

  // Unified animation loop for climbing state transitions, continuous oscillation, and SVG path coordinate query tracking
  useEffect(() => {
    // Register change listener to keep the spring active and updating in Framer Motion's loop
    const unsubscribeSpring = scrollTopSpring.onChange(() => { });

    let animFrameId: number;
    const update = () => {
      // 1. Ease climb intensity (decay target to a minimum of 0.35 to maintain a gentle climbing idle state)
      // Lock climb intensity to 0 when walking or idle
      const state = landingStateRef.current;
      const target = (isScrolling && (state === 'CLIMBING' || state === 'DESCENDING')) ? 1 : 0.35;
      const current = climbIntensityRef.current;
      const diff = target - current;
      if (Math.abs(diff) > 0.001) {
        const step = target === 1 ? 0.15 : 0.08;
        climbIntensityRef.current = current + diff * step;
        setClimbIntensity(climbIntensityRef.current);
      } else if (current !== target) {
        climbIntensityRef.current = target;
        setClimbIntensity(target);
      }

      // Update time-based gait cycle accumulator
      const baseSpeed = 0.04;
      const activeSpeed = 0.14;
      const currentSpeed = baseSpeed + (activeSpeed - baseSpeed) * climbIntensityRef.current;
      cyclePhaseRef.current = (cyclePhaseRef.current + currentSpeed) % (Math.PI * 2);
      const cycleDist = (cyclePhaseRef.current / (Math.PI * 2)) * 60;
      setClimbCycle(cycleDist);

      // 2. Query dynamic layout parameters and update positions
      const currentPath = pathElementRef.current;
      if (currentPath) {
        const currentScrollTop = scrollTopSpring.get();
        const startCoordsVal = startCoordsRef.current;
        const topicListHeightVal = topicListHeightRef.current;

        const startY = startCoordsVal ? startCoordsVal.y : -40;
        const endY = topicListHeightVal - 40;

        const viewportHeight = getViewportHeight();
        const maxScroll = Math.max(50, topicListHeightVal - viewportHeight);
        const scrollRatio = Math.max(0, Math.min(1, currentScrollTop / maxScroll));

        const scrollAtLandingReveal = Math.max(0, endY - viewportHeight - LANDING_REVEAL_MARGIN);

        // Update landing state machine inside anim loop
        if (currentScrollTop < maxScroll - 6) {
          touchdownTimeRef.current = null;
          releaseTimeRef.current = null;
          walkStartTimeRef.current = null;

          const nextState = currentScrollTop >= scrollAtLandingReveal ? 'DESCENDING' : 'CLIMBING';
          if (landingStateRef.current !== nextState) {
            landingStateRef.current = nextState;
            setLandingState(nextState);
          }
          setWalkProgress(0);
        } else {
          if (landingStateRef.current === 'CLIMBING' || landingStateRef.current === 'DESCENDING') {
            landingStateRef.current = 'TOUCHDOWN';
            setLandingState('TOUCHDOWN');
            touchdownTimeRef.current = performance.now();
            setTouchdownTime(touchdownTimeRef.current);
          } else if (landingStateRef.current === 'TOUCHDOWN') {
            const elapsed = performance.now() - (touchdownTimeRef.current ?? 0);
            if (elapsed >= 300) {
              landingStateRef.current = 'RELEASE';
              setLandingState('RELEASE');
              releaseTimeRef.current = performance.now();
            }
          } else if (landingStateRef.current === 'RELEASE') {
            const elapsed = performance.now() - (releaseTimeRef.current ?? 0);
            if (elapsed >= 400) {
              landingStateRef.current = 'WALKING';
              setLandingState('WALKING');
              walkStartTimeRef.current = performance.now();
            }
          } else if (landingStateRef.current === 'WALKING') {
            const elapsed = performance.now() - (walkStartTimeRef.current ?? 0);
            const progress = Math.min(1, elapsed / 1500);
            setWalkProgress(progress);
            if (progress >= 1) {
              landingStateRef.current = 'IDLE';
              setLandingState('IDLE');
            }
          }
        }

        // Apply coordinates based on the landing state
        const currentState = landingStateRef.current;
        if (currentState === 'CLIMBING' || currentState === 'DESCENDING') {
          // Lock to 58% of viewport height during main journey (ease in from top at beginning of scroll)
          const entryProgress = Math.min(1, scrollRatio / 0.15);
          const climbY = currentScrollTop + (startY + 45) + entryProgress * (viewportHeight * 0.58 - (startY + 45));

          let targetY = 0;
          if (currentScrollTop < scrollAtLandingReveal) {
            targetY = climbY;
          } else {
            // Transition from climbY (at reveal scroll) to endY (landing platform) over remaining scroll
            const scrollRatioAtReveal = Math.max(0, Math.min(1, scrollAtLandingReveal / maxScroll));
            const entryProgressAtReveal = Math.min(1, scrollRatioAtReveal / 0.15);
            const climbYAtReveal = scrollAtLandingReveal + (startY + 45) + entryProgressAtReveal * (viewportHeight * 0.58 - (startY + 45));

            const denom = maxScroll - scrollAtLandingReveal;
            const t = denom > 1 ? Math.max(0, Math.min(1, (currentScrollTop - scrollAtLandingReveal) / denom)) : 1;
            const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOut
            targetY = (1 - easedT) * climbYAtReveal + easedT * endY;
          }

          // Clamp targetY to keep CloudMan within safe vine bounds
          const clampedTargetY = Math.max(startY + 45, Math.min(endY, targetY));

          const clampedProgress = Math.max(0, Math.min(1, (clampedTargetY - startY) / (endY - startY)));

          if (Math.abs(progressRef.current - clampedProgress) > 0.001) {
            progressRef.current = clampedProgress;
            setCurrentProgress(clampedProgress);
          }

          updateCoordinates(currentPath, clampedTargetY);
        } else {
          // Solved ground level position
          const totalLength = currentPath.getTotalLength();
          const endPoint = currentPath.getPointAtLength(totalLength);
          const vineEndX = endPoint.x;
          const signboardAnchorX = dimensions.width / 2 + 35;

          let targetX = vineEndX;
          if (currentState === 'WALKING') {
            const currentWalkProgress = (performance.now() - (walkStartTimeRef.current ?? 0)) / 1500;
            const clampedWalkProgress = Math.max(0, Math.min(1, currentWalkProgress));
            targetX = vineEndX + clampedWalkProgress * (signboardAnchorX - vineEndX);
          } else if (currentState === 'IDLE') {
            targetX = signboardAnchorX;
          }

          setCloudPos({
            x: targetX,
            y: endY,
            rotate: 0
          });
          setCurrentProgress(1.0);
        }
      }

      animFrameId = requestAnimationFrame(update);
    };

    animFrameId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(animFrameId);
      unsubscribeSpring();
    };
  }, [isScrolling, scrollTopSpring, updateCoordinates, dimensions.width]);
  // Monitor scroll events across all nested scroll elements dynamically
  useEffect(() => {
    const handleScroll = () => {
      let scrollTop = 0;

      // Traverse up from the container element to accumulate all nested scrolling offsets
      let el = scrollContainerRefRef.current?.current;
      while (el) {
        if (el.scrollTop > 0) {
          scrollTop += el.scrollTop;
        }
        el = el.parentElement;
      }

      // Add window scroll offset fallback
      scrollTop += window.scrollY || document.documentElement.scrollTop || 0;

      // Update scroll direction based on threshold
      if (scrollTop > lastScrollTopRef.current + 2) {
        setScrollDirection('down');
      } else if (scrollTop < lastScrollTopRef.current - 2) {
        setScrollDirection('up');
      }

      const hasChanged = Math.abs(scrollTop - lastScrollTopRef.current) > 0.5;
      lastScrollTopRef.current = scrollTop;

      // Update raw scroll offset (spring will smoothly ease updates)
      rawScrollTop.set(scrollTop);

      // Only track active scroll activity state if there is actual movement
      if (hasChanged) {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      }
    };

    // Use capture: true to intercept scroll events from any nested scrollable container in the layout subtree
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    // Check initial position
    handleScroll();

    // Periodically run handleScroll to capture layout shifts or dynamic topic loadings
    const interval = setInterval(handleScroll, 400);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      clearInterval(interval);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Fallbacks for start coordinates
  const effectiveStartX = startCoords ? startCoords.x : dimensions.width / 2;
  const effectiveStartY = startCoords ? startCoords.y : -40;

  const totalViewHeight = topicListHeight;

  // ==========================================
  // DYNAMIC VINE BENDING CALCULATIONS
  // ==========================================
  const CYCLE_LENGTH = 60;
  const HALF_CYCLE = 30;
  const cycleDist = climbCycle;
  const isLeftStep = cycleDist < HALF_CYCLE;
  const stepProgress = (cycleDist % HALF_CYCLE) / HALF_CYCLE; // 0 to 1

  // Side-to-side swing
  const swingAngle = Math.PI * (cycleDist / HALF_CYCLE);
  const swingX = 2.5 * Math.sin(swingAngle);
  const swingRotate = 5 * Math.sin(swingAngle);

  // Vine bend amount: proportional to the climber's swing and climb intensity (deactivated when letting go of vine)
  const bendX = (landingState === 'RELEASE' || landingState === 'WALKING' || landingState === 'IDLE') ? 0 : swingX * 1.5 * climbIntensity;

  // Dynamic deformed path string for the visible vine
  const deformedPathString = useMemo(() => {
    if (basePoints.length === 0) return '';
    const deformedPoints = basePoints.map((p) => {
      const dist = Math.abs(p.y - cloudPos.y);
      const range = 150; // Vertical span of the bend
      if (dist < range) {
        const factor = Math.exp(-Math.pow(dist / (range * 0.5), 2));
        return {
          x: p.x + bendX * factor,
          y: p.y
        };
      }
      return p;
    });

    let path = `M ${deformedPoints[0].x} ${deformedPoints[0].y}`;
    const segmentHeight = deformedPoints[1].y - deformedPoints[0].y;
    const offsetRange = 35;
    for (let i = 0; i < deformedPoints.length - 1; i++) {
      const p0 = deformedPoints[i];
      const p1 = deformedPoints[i + 1];

      const cpY1 = p0.y + segmentHeight / 3;
      const cpX1 = p0.x + (i % 2 === 0 ? offsetRange : -offsetRange);

      const cpY2 = p1.y - segmentHeight / 3;
      const cpX2 = p1.x + (i % 2 === 0 ? -offsetRange : offsetRange);

      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [basePoints, cloudPos.y, bendX]);

  // Dynamic deformed leaf points (keeps leaves attached to the bending vine)
  const deformedLeafPoints = useMemo(() => {
    return baseLeafPoints.map((leaf) => {
      const dist = Math.abs(leaf.y - cloudPos.y);
      const range = 150;
      if (dist < range) {
        const factor = Math.exp(-Math.pow(dist / (range * 0.5), 2));
        return {
          ...leaf,
          x: leaf.x + bendX * factor
        };
      }
      return leaf;
    });
  }, [baseLeafPoints, cloudPos.y, bendX]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full pointer-events-none select-none overflow-visible z-20"
      style={{ height: `${totalViewHeight}px` }}
    >
      {baseBezierPathString && (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${totalViewHeight}`}
          fill="none"
          className="absolute inset-0 overflow-visible"
        >
          <defs>
            <linearGradient id="bottomGrassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="bottomDirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>

          {/* Reference path used to query coordinates (static path) */}
          <path ref={pathRefCallback} d={baseBezierPathString} stroke="#000" strokeWidth="1" opacity="0" fill="none" />

          {/* Gentle wind-sway oscillation group for the entire vine */}
          <motion.g
            animate={{
              skewX: [0, 0.18, -0.18, 0],
              scaleX: [1, 1.001, 0.999, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 8.5,
              ease: 'easeInOut'
            }}
            style={{ transformOrigin: 'top center' }}
          >
            {/* Wavy Vine Path - Base thick layer (dynamically deformed) */}
            <motion.path
              d={deformedPathString}
              stroke="#16a34a"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Wavy Vine Path - Inner highlight layer (dynamically deformed) */}
            <motion.path
              d={deformedPathString}
              stroke="#86efac"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Leaves and Flowers (dynamically deformed to match vine bend) */}
            {deformedLeafPoints.map((item) => {
              return (
                <g key={item.id} transform={`translate(${item.x}, ${item.y}) rotate(${item.angle})`}>
                  {item.isFlower ? (
                    <Flower active={true} />
                  ) : (
                    <Leaf active={true} />
                  )}
                </g>
              );
            })}

            {/* Green tying loop decoration wrapping around the Level Badge container */}
            {startCoords && (
              <g>
                {/* Loop wrap behind Level Badge (centered around Y = startY - 12) */}
                <path d={`M ${effectiveStartX - 25} ${effectiveStartY - 12} A 12 12 0 0 1 ${effectiveStartX + 25} ${effectiveStartY - 12}`} stroke="#15803d" strokeWidth="3.5" fill="none" />

                {/* Double loop wrap in front to look tied up */}
                <path d={`M ${effectiveStartX - 26} ${effectiveStartY - 8} Q ${effectiveStartX} ${effectiveStartY + 2} ${effectiveStartX + 26} ${effectiveStartY - 8}`} stroke="#16a34a" strokeWidth="4" fill="none" />
                <path d={`M ${effectiveStartX - 20} ${effectiveStartY - 4} Q ${effectiveStartX} ${effectiveStartY + 8} ${effectiveStartX + 20} ${effectiveStartY - 4}`} stroke="#15803d" strokeWidth="2.5" fill="none" />

                {/* Hanging vine ends wrapping down */}
                <path d={`M ${effectiveStartX - 10} ${effectiveStartY + 2} Q ${effectiveStartX - 22} ${effectiveStartY + 25} ${effectiveStartX - 12} ${effectiveStartY + 35}`} stroke="#16a34a" strokeWidth="3" fill="none" />
                <path d={`M ${effectiveStartX + 8} ${effectiveStartY + 2} Q ${effectiveStartX + 18} ${effectiveStartY + 20} ${effectiveStartX + 8} ${effectiveStartY + 32}`} stroke="#15803d" strokeWidth="2" fill="none" />
              </g>
            )}
          </motion.g>

          {/* Land platform at the bottom of the SVG */}
          <g transform={`translate(${dimensions.width / 2}, ${totalViewHeight - 35})`}>
            {/* Soil/dirt base */}
            <path
              d="M -150,15 C -118,30 -64,35 0,35 C 64,35 118,30 150,15 C 118,8 64,8 0,8 C -64,8 -118,8 -150,15 Z"
              fill="url(#bottomDirtGrad)"
            />
            {/* Grass cover */}
            <path
              d="M -160,10 C -118,-5 -64,-10 0,-10 C 64,-10 118,-5 160,10 C 118,8 64,8 0,8 C -64,8 -118,8 -160,10 Z"
              fill="url(#bottomGrassGrad)"
              stroke="#166534"
              strokeWidth="1"
            />
            {/* Rocks */}
            <ellipse cx="-95" cy="8" rx="6" ry="4" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
            <ellipse cx="-88" cy="10" rx="4" ry="2.5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
            <ellipse cx="110" cy="9" rx="5" ry="3" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
            {/* Flowers */}
            <g transform="translate(-45, 0)">
              <circle cx="0" cy="0" r="1.5" fill="#fef08a" />
              <circle cx="-1.5" cy="0" r="1" fill="#f472b6" />
              <circle cx="1.5" cy="0" r="1" fill="#f472b6" />
              <circle cx="0" cy="-1.5" r="1" fill="#f472b6" />
              <circle cx="0" cy="1.5" r="1" fill="#f472b6" />
            </g>
            <g transform="translate(60, 2)">
              <circle cx="0" cy="0" r="1.2" fill="#fef08a" />
              <circle cx="-1.2" cy="0" r="0.8" fill="#38bdf8" />
              <circle cx="1.2" cy="0" r="0.8" fill="#38bdf8" />
              <circle cx="0" cy="-1.2" r="0.8" fill="#38bdf8" />
              <circle cx="0" cy="1.2" r="0.8" fill="#38bdf8" />
            </g>
            {/* Bushes */}
            <path d="M -115,5 Q -122,-2 -115,-8 Q -108,-12 -102,-6 Q -95,-8 -95,0 Q -95,7 -115,5 Z" fill="#15803d" opacity="0.9" />
            <path d="M 100,6 Q 93,-1 100,-7 Q 107,-11 113,-5 Q 120,-7 120,1 Q 120,8 100,6 Z" fill="#15803d" opacity="0.9" />
            {/* Roots */}
            <path d="M 0,-1 Q -8,-3 -15,-6" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 0,-1 Q 10,-3 17,-5" stroke="#15803d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Beautiful wooden custom signboard */}
            <g>
              <rect x="65" y="-12" width="6" height="25" fill="#78350f" stroke="#451a03" strokeWidth="1" />
              <rect x="45" y="-32" width="46" height="20" rx="3" fill="#b45309" stroke="#451a03" strokeWidth="1.2" />
              {/* Wood grain detail lines */}
              <line x1="48" y1="-22" x2="88" y2="-22" stroke="#78350f" strokeWidth="1.5" />
              <line x1="52" y1="-17" x2="82" y2="-17" stroke="#78350f" strokeWidth="1.2" />
              <text x="68" y="-18" fill="#fef3c7" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">AWS</text>
            </g>
          </g>

          {/* CloudMan Character - Translated to match vine bending horizontally, and vertically along the vine */}
          <g transform={`translate(${cloudPos.x + bendX}, ${cloudPos.y}) rotate(${cloudPos.rotate})`}>
            <motion.g
              animate={{
                y: (landingState === 'RELEASE' || landingState === 'WALKING' || landingState === 'IDLE' || landingState === 'TOUCHDOWN') ? 0 : [0, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: (landingState === 'RELEASE' || landingState === 'WALKING' || landingState === 'IDLE' || landingState === 'TOUCHDOWN') ? 0 : Infinity,
                ease: "easeInOut"
              }}
            >
              <CloudMan
                isScrolling={isScrolling}
                scrollDirection={scrollDirection}
                climbIntensity={climbIntensity}
                cycleDist={cycleDist}
                stepProgress={stepProgress}
                isLeftStep={isLeftStep}
                swingRotate={swingRotate}
                swingX={swingX}
                landingState={landingState}
                touchdownTime={touchdownTime}
                walkProgress={walkProgress}
              />
            </motion.g>
          </g>
        </svg>
      )}
    </div>
  );
};
