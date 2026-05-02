import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

const SLIDE_DURATION = 7000;
const BRAND_GRADIENT = 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 40%, #5ec49a 100%)';

const IMAGES = [
  'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/onboarding/Ellipse%202190-2.png',
  'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/onboarding/Ellipse%202191.png',
  'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/onboarding/Ellipse%202190.png',
  'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/onboarding/Ellipse%202190-1.png',
];

const CONTENT = {
  ru: {
    skip: 'Пропустить',
    next: 'Далее',
    start: 'Начать',
    slides: [
      {
        title: 'Благотворительный фонд «Шанырак»',
        text: 'Помогаем подопечным из всех уголков Казахстана сделать жизнь лучше',
        bullets: null,
        footer: null,
      },
      {
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
        title: 'Просто и прозрачно',
        text: null,
        bullets: [
          'Вы сами выбираете, кому помочь',
          'Вся оказанная благотворительность отображается в вашем личном кабинете',
        ],
        footer: 'При помощи в фонд вы будете получать фотоотчет и чеки о доставленной помощи',
      },
      {
        title: 'Сделайте первый шаг',
        text: 'Выберите подопечного, познакомьтесь с его историей и поддержите разовыми или регулярными пожертвованиями',
        bullets: null,
        footer: null,
      },
    ],
  },
  kz: {
    skip: 'Өткізу',
    next: 'Келесі',
    start: 'Бастау',
    slides: [
      {
        title: '«Шаңырақ» қайырымдылық қоры',
        text: 'Қазақстанның барлық өңірлерінен қолдаушыларға өмірді жақсартуға көмектесеміз',
        bullets: null,
        footer: null,
      },
      {
        title: 'Көмек қайда бағытталады?',
        text: null,
        bullets: [
          'Онкологиялық аурулары бар адамдарға реабилитация мен операцияларды төлейміз',
          'Аз қамтылған отбасыларға көмектесеміз',
          'Әлеуметтік жобаларды қаржыландырамыз',
          'Балалар үйлеріне қолдау көрсетеміз',
        ],
        footer: 'Тек тексерілген және ресми қорлармен жұмыс істейміз',
      },
      {
        title: 'Қарапайым және ашық',
        text: null,
        bullets: [
          'Кімге көмектесетінді өзіңіз таңдайсыз',
          'Барлық қайырымдылық жеке кабинетіңізде көрсетіледі',
        ],
        footer: 'Қорға көмек берген кезде жеткізілген көмек туралы фотоесеп пен чектер аласыз',
      },
      {
        title: 'Алғашқы қадам жасаңыз',
        text: 'Қолдаушыны таңдаңыз, оның тарихымен танысыңыз және бір реттік немесе тұрақты қайырымдылықпен қолдаңыз',
        bullets: null,
        footer: null,
      },
    ],
  },
};

export default function Onboarding({ onComplete }) {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ru');
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const didSwipe = useRef(false);
  const timerRef = useRef(null);

  const t = CONTENT[lang];
  const slide = t.slides[current];
  const isLast = current === t.slides.length - 1;

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem('app_lang', l);
  };

  const handleFinish = useCallback(() => {
    localStorage.setItem('onboarding_done', 'true');
    onComplete();
  }, [onComplete]);

  const goToSlide = useCallback((index) => {
    if (index >= IMAGES.length) handleFinish();
    else if (index >= 0) setCurrent(index);
  }, [handleFinish]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => goToSlide(current + 1), SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, goToSlide]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    didSwipe.current = false;
  };
  const onTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 8) didSwipe.current = true;
  };
  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      didSwipe.current = true;
      if (diff > 0) goToSlide(current + 1);
      else goToSlide(current - 1);
    }
  };

  const handleClick = (e) => {
    if (didSwipe.current) return;
    if (e.target.closest('button')) return;
    const half = window.innerWidth / 2;
    if (e.clientX < half) goToSlide(current - 1);
    else goToSlide(current + 1);
  };

  return (
    <div
      className='fixed inset-0 z-[100] bg-white flex flex-col'
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
    >
      {/* ── Фото: полный экран сверху, arc снизу ── */}
      <div
        className='relative flex-shrink-0 overflow-hidden'
        style={{ height: 'clamp(260px, 54dvh, 440px)', background: '#f5f5f5' }}
      >
        {/* Полноэкранные фото — касаются краёв слева, справа, сверху */}
        {IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className='absolute inset-0 w-full h-full transition-opacity duration-500'
            style={{
              opacity: i === current ? 1 : 0,
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        ))}

        {/* Затемнение сверху под прогресс-бары */}
        <div className='absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10' />

        {/* Прогресс-бары — сторис-анимация */}
        <div
          className='absolute inset-x-0 top-0 flex gap-1.5 px-4 z-20'
          style={{ paddingTop: 'max(14px, calc(env(safe-area-inset-top, 0px) + 10px))' }}
        >
          {IMAGES.map((_, i) => (
            <div key={i} className='flex-1 h-[3px] bg-white/40 rounded-full overflow-hidden'>
              {i < current && (
                <div className='h-full w-full bg-white' />
              )}
              {i === current && (
                <div key={`bar-${current}`} className='h-full bg-white ob-progress-active' />
              )}
            </div>
          ))}
        </div>

        {/* Кнопка «Пропустить» */}
        {!isLast && (
          <button
            onClick={(e) => { e.stopPropagation(); handleFinish(); }}
            className='absolute right-4 z-20 text-white/90 text-sm font-semibold drop-shadow'
            style={{ top: 'max(20px, calc(env(safe-area-inset-top, 0px) + 16px))' }}
          >
            {t.skip}
          </button>
        )}

        {/* Подсказка — тап вправо на первом слайде */}
        {current === 0 && (
          <div className='absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none'>
            <div className='w-8 h-8 bg-white/30 rounded-full flex items-center justify-center animate-pulse'>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        )}

        {/* Arc — белая SVG дуга поверх фото снизу */}
        <div className='absolute inset-x-0 bottom-0 z-10 pointer-events-none' style={{ height: '72px' }}>
          <svg
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <path d="M0 20 L0 8 C25 22 75 22 100 8 L100 20 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* ── Контент ── */}
      <div className='flex-1 flex flex-col min-h-0'>
        <div className='flex-1 overflow-y-auto px-6 pt-5 pb-2'>

          <h1 className={`font-bold text-gray-900 mb-2 ${slide.bullets ? 'text-xl' : 'text-2xl text-center'}`}>
            {slide.title}
          </h1>

          {slide.text && (
            <p className='text-sm text-gray-800 text-center leading-relaxed mb-3'>
              {slide.text}
            </p>
          )}

          {/* Переключатель языка — только на 1-м слайде, под подзаголовком */}
          {current === 0 && (
            <div className='flex justify-center mt-4'>
              <div className='flex items-center bg-gray-100 rounded-2xl p-1 gap-1'>
                <button
                  onClick={(e) => { e.stopPropagation(); switchLang('ru'); }}
                  className={`text-sm font-semibold px-5 py-2 rounded-xl transition-all ${
                    lang === 'ru' ? 'bg-white text-[#1e6b4e] shadow-sm' : 'text-gray-400'
                  }`}
                >
                  Русский
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); switchLang('kz'); }}
                  className={`text-sm font-semibold px-5 py-2 rounded-xl transition-all ${
                    lang === 'kz' ? 'bg-white text-[#1e6b4e] shadow-sm' : 'text-gray-400'
                  }`}
                >
                  Қазақша
                </button>
              </div>
            </div>
          )}

          {slide.bullets && (
            <ul className='space-y-3 mt-1'>
              {slide.bullets.map((b, i) => (
                <li key={i} className='flex items-start gap-2.5 text-sm text-gray-800 leading-snug'>
                  <span className='font-bold flex-shrink-0 mt-0.5 text-base' style={{ color: '#2f8f6a' }}>•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {slide.footer && (
            <div className='flex items-start gap-3 bg-green-50 border border-green-100 rounded-2xl p-4 mt-4'>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2f8f6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className='flex-shrink-0 mt-0.5'>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p className='text-sm text-gray-800 leading-snug'>{slide.footer}</p>
            </div>
          )}
        </div>

        {/* Кнопка всегда видна */}
        <div
          className='px-6 pt-3 flex-shrink-0'
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); isLast ? handleFinish() : goToSlide(current + 1); }}
            className='w-full py-4 text-white rounded-2xl font-semibold text-base'
            style={{ background: BRAND_GRADIENT }}
          >
            {isLast ? t.start : t.next}
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
