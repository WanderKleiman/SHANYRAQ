import React, { useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

const SLIDES = [
  'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/first%20.png',
  'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/second.png',
  'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/third%20.png',
  'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/fourth.png',
];

export default function Onboarding({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < SLIDES.length - 1) {
        setCurrent(current + 1);
      } else if (diff < 0 && current > 0) {
        setCurrent(current - 1);
      }
    }
  };

  const handleFinish = () => {
    localStorage.setItem('onboarding_done', 'true');
    onComplete();
  };

  return (
    <div
      className='fixed inset-0 z-[100] bg-white flex flex-col'
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      {current < SLIDES.length - 1 && (
        <button
          onClick={handleFinish}
          className='absolute top-12 right-6 z-10 text-gray-500 text-sm font-medium'
        >
          Пропустить
        </button>
      )}

      {/* Slide image */}
      <div className='flex-1 flex items-center justify-center'>
        <img
          src={SLIDES[current]}
          alt={`Онбординг ${current + 1}`}
          className='w-full h-full object-contain'
        />
      </div>

      {/* Bottom area */}
      <div className='pb-10 px-6'>
        {/* Dots */}
        <div className='flex justify-center space-x-2 mb-6'>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-[var(--primary-color)] w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {current < SLIDES.length - 1 ? (
          <button
            onClick={() => setCurrent(current + 1)}
            className='w-full py-4 bg-[var(--primary-color)] text-white rounded-2xl font-medium text-lg'
          >
            Далее
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className='w-full py-4 bg-[var(--primary-color)] text-white rounded-2xl font-medium text-lg'
          >
            Начать
          </button>
        )}
      </div>
    </div>
  );
}

// Check if onboarding should be shown (only in native app, only first time)
export function shouldShowOnboarding() {
  if (!Capacitor.isNativePlatform()) return false;
  return !localStorage.getItem('onboarding_done');
}
