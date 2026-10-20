'use client';

/**
 * Quantity stepper — from 21st.dev, "Quantity Stepper" by Spectrum UI
 * (arihantcodes). Kept: the ARIA spinbutton, keyboard support (arrows,
 * PageUp/Down, Home/End), press-and-hold acceleration, rolling digits, the
 * shake at a limit and reduced-motion handling. Changed: colours come from
 * our tokens instead of neutral-*, the buttons are 44px targets at size "md",
 * and the buttons stay in the tab order so keyboard users can reach them
 * directly (the original relied on the spinbutton alone).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface QuantityStepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md';
  /** Shown as the decrement icon when the next press would remove the item. */
  removeAtMin?: boolean;
  label: string;
  disabled?: boolean;
  className?: string;
}

const HOLD_DELAY = 400;
const HOLD_INTERVAL = 80;
const HOLD_FAST_INTERVAL = 40;
const HOLD_FAST_AFTER = 10;
const FLASH_DURATION = 400;
const SPRING_SNAPPY = { type: 'spring', stiffness: 500, damping: 30 } as const;
const ROLL_SPRING = { type: 'spring', stiffness: 400, damping: 30 } as const;
const ROLL_REPEAT_TRANSITION = { duration: 0.1, ease: 'easeOut' } as const;
const SHAKE_KEYFRAMES = [0, -4, 4, -2, 2, 0];

const SIZES = {
  sm: { container: 'h-10 gap-0.5 px-0.5', button: 'size-9', icon: 15, value: 'h-9 min-w-8 text-sm' },
  md: { container: 'h-12 gap-1 px-0.5', button: 'size-11', icon: 17, value: 'h-11 min-w-10 text-base' },
} as const;

const valueVariants = {
  enter: (d: number) => ({ y: d * 12, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (d: number) => ({ y: d * -12, opacity: 0 }),
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function QuantityStepper({
  value,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  size = 'md',
  removeAtMin = false,
  label,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const reduce = useReducedMotion();
  const [direction, setDirection] = useState(1);
  const [flash, setFlash] = useState(0);
  const [repeating, setRepeating] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const shake = useAnimationControls();
  const current = clamp(value, min, max);
  const s = SIZES[size];

  const valueRef = useRef(current);
  useEffect(() => {
    valueRef.current = current;
  }, [current]);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);

  const stopRepeat = useCallback(() => {
    if (delayRef.current) clearTimeout(delayRef.current);
    if (repeatRef.current) clearInterval(repeatRef.current);
    delayRef.current = null;
    repeatRef.current = null;
    countRef.current = 0;
    setRepeating(false);
  }, []);
  useEffect(() => stopRepeat, [stopRepeat]);

  useEffect(() => {
    if (flash === 0) return;
    if (!reduce) {
      shake.set({ x: 0 });
      void shake.start({ x: SHAKE_KEYFRAMES, transition: { duration: 0.3, ease: 'easeInOut' } });
    }
    const id = setTimeout(() => setFlash(0), FLASH_DURATION);
    return () => clearTimeout(id);
  }, [flash, reduce, shake]);

  const stepBy = useCallback(
    (delta: number) => {
      const next = clamp(valueRef.current + delta, min, max);
      if (next === valueRef.current) {
        setFlash((c) => c + 1);
        setAnnouncement(delta < 0 ? `Minimum quantity is ${min}` : `Maximum quantity is ${max}`);
        return false;
      }
      valueRef.current = next;
      setDirection(delta > 0 ? 1 : -1);
      onValueChange(next);
      setAnnouncement(next === 0 ? `${label} removed` : `${label}: ${next}`);
      return true;
    },
    [min, max, onValueChange, label],
  );

  function startHold(e: React.PointerEvent<HTMLButtonElement>, delta: number) {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    stopRepeat();
    if (!stepBy(delta)) return;
    delayRef.current = setTimeout(() => {
      setRepeating(true);
      const tick = () => {
        if (!stepBy(delta)) return stopRepeat();
        countRef.current += 1;
        if (countRef.current === HOLD_FAST_AFTER) {
          if (repeatRef.current) clearInterval(repeatRef.current);
          repeatRef.current = setInterval(tick, HOLD_FAST_INTERVAL);
        }
      };
      repeatRef.current = setInterval(tick, HOLD_INTERVAL);
    }, HOLD_DELAY);
  }

  // Pointer presses are handled on pointerdown (for hold-to-repeat); a keyboard
  // "click" (Enter/Space) has detail === 0 and is handled here instead.
  function keyboardClick(e: React.MouseEvent<HTMLButtonElement>, delta: number) {
    if (e.detail === 0) stepBy(delta);
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    const map: Record<string, number> = {
      ArrowUp: current + step,
      ArrowDown: current - step,
      PageUp: current + step * 10,
      PageDown: current - step * 10,
      Home: min,
      End: max,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = clamp(map[e.key]!, min, max);
    if (next === current) {
      if (e.key !== 'Home' && e.key !== 'End') setFlash((c) => c + 1);
      return;
    }
    valueRef.current = next;
    setDirection(next > current ? 1 : -1);
    onValueChange(next);
  };

  const btn = cn(
    'flex shrink-0 touch-manipulation items-center justify-center rounded-full text-ink transition-colors hover:bg-ground-subtle disabled:opacity-40',
    s.button,
  );
  const squish = reduce || disabled ? undefined : { scale: 0.85 };
  const roll = reduce || flash > 0 ? { duration: 0 } : repeating ? ROLL_REPEAT_TRANSITION : ROLL_SPRING;
  const removing = removeAtMin && current - step <= min;

  return (
    <div
      role="group"
      aria-label={`Quantity of ${label}`}
      className={cn(
        'inline-flex select-none items-center rounded-full border border-line-strong bg-ground',
        disabled && 'pointer-events-none opacity-50',
        s.container,
        className,
      )}
    >
      <motion.button
        type="button"
        disabled={disabled}
        aria-label={removing ? `Remove ${label}` : `One fewer ${label}`}
        onPointerDown={(e) => startHold(e, -step)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        onClick={(e) => keyboardClick(e, -step)}
        whileTap={squish}
        transition={reduce ? { duration: 0 } : SPRING_SNAPPY}
        className={btn}
      >
        {removing ? <Trash2 size={s.icon} aria-hidden="true" /> : <Minus size={s.icon} aria-hidden="true" />}
      </motion.button>

      <motion.span
        role="spinbutton"
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={`Quantity of ${label}`}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        animate={shake}
        className={cn(
          'flex items-center justify-center overflow-hidden px-1 font-bold tabular-nums transition-colors',
          flash > 0 ? 'text-brand' : 'text-ink',
          s.value,
        )}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.span
            key={current}
            className="inline-block"
            custom={direction}
            variants={valueVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={roll}
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </motion.span>

      <motion.button
        type="button"
        disabled={disabled}
        aria-label={`One more ${label}`}
        onPointerDown={(e) => startHold(e, step)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        onClick={(e) => keyboardClick(e, step)}
        whileTap={squish}
        transition={reduce ? { duration: 0 } : SPRING_SNAPPY}
        className={btn}
      >
        <Plus size={s.icon} aria-hidden="true" />
      </motion.button>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
