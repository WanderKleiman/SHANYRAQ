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
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
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
    if (index >= CONTENT.ru.slides.length) handleFinish();
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
        {IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className='absolute inset-0 w-full h-full object-cover transition-opacity duration-500'
            style={{ opacity: i === current ? 1 : 0, objectPosition: 'center center' }}
          />
        ))}

        {/* Затемнение сверху */}
        <div className='absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none' />

        {/* Прогресс-бары */}
        <div
          className='absolute top-0 left-0 right-0 flex gap-1.5 px-4'
          style={{ paddingTop: 'max(44px, calc(env(safe-area-inset-top, 0px) + 10px))' }}
        >
          {IMAGES.map((_, i) => (
            <div key={i} className='flex-1 h-[3px] bg-white/35 rounded-full overflow-hidden'>
              {i < current && <div className='h-full w-full bg-white' />}
              {i === current && <div key={current} className='h-full bg-white ob-progress-active' />}
            </div>
          ))}
        </div>

        {/* Переключатель языка — левый верхний угол */}
        <div
          className='absolute left-4 flex items-center gap-1 bg-black/30 rounded-full px-1 py-1'
          style={{ top: 'max(52px, calc(env(safe-area-inset-top, 0px) + 18px))' }}
        >
          <button
            onClick={() => switchLang('ru')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
              lang === 'ru' ? 'bg-white text-[#1e6b4e]' : 'text-white/80'
            }`}
          >
            РУ
          </button>
          <button
            onClick={() => switchLang('kz')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
              lang === 'kz' ? 'bg-white text-[#1e6b4e]' : 'text-white/80'
            }`}
          >
            ҚАЗ
          </button>
        </div>

        {/* Пропустить */}
        {!isLast && (
          <button
            onClick={handleFinish}
            className='absolute right-4 text-white text-sm font-medium'
            style={{ top: 'max(52px, calc(env(safe-area-inset-top, 0px) + 18px))' }}
          >
            {t.skip}
          </button>
        )}

        {/* Тап-зоны */}
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
