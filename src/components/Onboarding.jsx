import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

const SLIDE_DURATION = 7000;

const BRAND_GRADIENT = 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 40%, #5ec49a 100%)';

const SLIDES = [
  {
    image: '/onboarding/1.jpg',
    title: 'Благотворительный фонд «Шанырак»',
    text: 'Помогаем подопечным из всех уголков Казахстана сделать жизнь лучше',
    bullets: null,
    footer: null,
  },
  {
    image: '/onboarding/2.jpg',
    title: 'Куда направляется помощь?',
    text: null,
    bullets: [
      'Оплачиваем реабилитации и операции людям с онко-заболеваниями',
      'Помогаем малообеспеченным семьям',
      'Спонсируем социальные проекты',
      'Оказываем помощь детским домам',
    ],
    footer: 'Работаем только с проверенными и официальными фондами',
  },
  {
    image: '/onboarding/3.jpg',
    title: 'Просто и прозрачно',
    text: null,
    bullets: [
      'Вы сами выбираете, кому помочь',
      'Вся оказанная благотворительность отображается в вашем личном кабинете',
    ],
    footer: 'При помощи в фонд вы будете получать фотоотчет и чеки о доставленной помощи',
  },
  {
    image: '/onboarding/4.jpg',
    title: 'Сделайте первый шаг',
    text: 'Выберите подопечного, познакомьтесь с его историей и поддержите разовыми или регулярными пожертвованиями',
    bullets: null,
    footer: null,
  },
];

export default function Onboarding({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const didSwipe = useRef(false);
  const timerRef = useRef(null);

  const handleFinish = useCallback(() => {
    localStorage.setItem('onboarding_done', 'true');
    onComplete();
  }, [onComplete]);

  const goToSlide = useCallback((index) => {
    if (index >= SLIDES.length) handleFinish();
    else if (index >= 0) setCurrent(index);
  }, [handleFinish]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => goToSlide(current + 1), SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, goToSlide]);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
    touchEnd.current = e.touches[0].clientX;
    didSwipe.current = false;
  };
  const onTouchMove = (e) => {
    touchEnd.current = e.touches[0].clientX;
    if (Math.abs(touchStart.current - touchEnd.current) > 8) didSwipe.current = true;
  };
  const onTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(current + 1);
      else goToSlide(current - 1);
    }
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div
      className='fixed inset-0 z-[100] bg-white flex flex-col'
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Фото верх ── */}
      <div
        className='relative flex-shrink-0 overflow-hidden'
        style={{ height: '48dvh', borderRadius: '0 0 32px 32px' }}
      >
        {/* Только фото-часть картинки (обрезаем снизу где текст) */}
        {SLIDES.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt=""
            className='absolute inset-0 w-full h-full object-cover transition-opacity duration-500'
            style={{ opacity: i === current ? 1 : 0, objectPosition: 'center top' }}
          />
        ))}

        {/* Затемнение сверху для прогресс-баров */}
        <div className='absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none' />

        {/* Прогресс-бары */}
        <div
          className='absolute top-0 left-0 right-0 flex gap-1.5 px-4'
          style={{ paddingTop: 'max(44px, calc(env(safe-area-inset-top, 0px) + 10px))' }}
        >
          {SLIDES.map((_, i) => (
            <div key={i} className='flex-1 h-[3px] bg-white/35 rounded-full overflow-hidden'>
              {i < current && <div className='h-full w-full bg-white' />}
              {i === current && <div key={current} className='h-full bg-white ob-progress-active' />}
            </div>
          ))}
        </div>

        {/* Пропустить */}
        {!isLast && (
          <button
            onClick={handleFinish}
            className='absolute right-4 text-white text-sm font-medium'
            style={{ top: 'max(52px, calc(env(safe-area-inset-top, 0px) + 18px))' }}
          >
            Пропустить
          </button>
        )}

        {/* Тап-зоны (не перекрывают кнопки) */}
        <div className='absolute left-0 right-0 bottom-0 flex' style={{ top: '70px' }}>
          <div className='flex-1' onClick={() => !didSwipe.current && goToSlide(current - 1)} />
          <div className='flex-1' onClick={() => !didSwipe.current && goToSlide(current + 1)} />
        </div>

        {/* Стрелка-подсказка на первом слайде */}
        {current === 0 && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
            <div className='w-7 h-7 bg-white/25 rounded-full flex items-center justify-center animate-pulse'>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ── Контент ── */}
      <div className='flex-1 flex flex-col min-h-0'>

        {/* Скроллируемая часть */}
        <div className='flex-1 overflow-y-auto px-6 pt-5 pb-2'>
          <h1
            className={`font-bold text-[var(--text-primary)] mb-3 ${slide.bullets ? 'text-lg' : 'text-xl text-center'}`}
          >
            {slide.title}
          </h1>

          {slide.text && (
            <p className='text-sm text-[var(--text-secondary)] text-center leading-relaxed'>
              {slide.text}
            </p>
          )}

          {slide.bullets && (
            <ul className='space-y-2'>
              {slide.bullets.map((b, i) => (
                <li key={i} className='flex items-start gap-2 text-sm text-[var(--text-secondary)] leading-snug'>
                  <span className='font-bold flex-shrink-0 mt-px' style={{ color: '#2f8f6a' }}>•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {slide.footer && (
            <div className='flex items-start gap-2 bg-green-50 rounded-xl p-3 mt-3'>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f8f6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className='flex-shrink-0 mt-0.5'>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p className='text-xs text-[var(--text-secondary)] leading-snug'>{slide.footer}</p>
            </div>
          )}
        </div>

        {/* Кнопка — всегда видна */}
        <div
          className='px-6 pt-2 flex-shrink-0'
          style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={isLast ? handleFinish : () => goToSlide(current + 1)}
            className='w-full py-3.5 text-white rounded-2xl font-semibold text-base'
            style={{ background: BRAND_GRADIENT }}
          >
            {isLast ? 'Начать' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function shouldShowOnboarding() {
  if (!Capacitor.isNativePlatform()) return false;
  return !localStorage.getItem('onboarding_done');
}
