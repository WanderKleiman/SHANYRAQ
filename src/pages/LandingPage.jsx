import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMainPageData } from '../hooks/useMainPageData';
import { usePartnerFunds } from '../hooks/usePartnerFunds';

const SUPABASE_IMG = 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images';

const APP_STORE_URL = 'https://apps.apple.com/kz/app/%D1%88%D0%B0%D0%BD%D1%8B%D1%80%D0%B0%D0%BA/id6766084376';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=world.shanyrak.app&pcampaignid=web_share';

const FEATURES = [
  {
    icon: '🏠',
    title: 'Подопечные по всему Казахстану',
    desc: 'Дети, пожилые, люди с инвалидностью, питомцы и социальные проекты — всё в одном месте.',
  },
  {
    icon: '🤝',
    title: 'Проверенные фонды-партнёры',
    desc: 'Мы работаем только с официально зарегистрированными благотворительными фондами.',
  },
  {
    icon: '💳',
    title: 'Оплата через Kaspi',
    desc: 'Удобная оплата через Kaspi.kz — любой казахстанец может помочь за несколько секунд.',
  },
  {
    icon: '🎁',
    title: 'Бонусы Kaspi',
    desc: 'Помогайте бонусами Kaspi Gold — тратьте баллы на добрые дела.',
  },
  {
    icon: '📱',
    title: 'Мобильное приложение',
    desc: 'Доступно на iOS и Android. Помогайте в любое время из любой точки страны.',
  },
  {
    icon: '🔗',
    title: 'Реферальная система',
    desc: 'Делитесь ссылками и отслеживайте свой вклад — сколько людей перешли и помогли.',
  },
];

const CATEGORIES = [
  { key: 'children', label: 'Дети', image: `${SUPABASE_IMG}/111-1.png`, green: true },
  { key: 'animals', label: 'Питомцы', image: `${SUPABASE_IMG}/pet.png`, green: false },
  { key: 'urgent', label: 'Взрослые', image: `${SUPABASE_IMG}/people.png`, green: false },
  { key: 'operations', label: 'Пожилые', image: `${SUPABASE_IMG}/grandma2.png`, green: true },
  { key: 'social', label: 'Социальные проекты', image: `${SUPABASE_IMG}/social.png`, green: false },
];

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return val;
}

function StatCard({ value, suffix, label, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const elRef = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (elRef.current) obs.observe(elRef.current);
    return () => obs.disconnect();
  }, []);
  const count = useCountUp(visible ? value : 0);
  return (
    <div ref={elRef} className='text-center'>
      <div className='text-4xl font-bold text-white mb-1'>
        {count.toLocaleString('ru-RU')}{suffix}
      </div>
      <div className='text-sm text-white/70'>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { categoryCounts, totalRaised, totalTarget } = useMainPageData();
  const { funds } = usePartnerFunds();
  const carouselRef = useRef(null);

  const totalPercent = totalTarget > 0 ? Math.min(Math.round((totalRaised / totalTarget) * 100), 100) : 0;
  const totalBeneficiaries = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const menuItems = [
    { label: 'Подопечные', path: '/feed' },
    { label: 'Фонды-партнёры', path: '/partner-funds' },
    { label: 'Документы', path: '/documents' },
    { label: 'Контакты', path: '/contacts' },
    { label: 'Компаниям', path: '/companies', highlight: true },
  ];

  return (
    <div className='bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden'>

      {/* ── HEADER ── */}
      <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-8 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
            <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-9 h-9 object-contain' />
            <span className='font-bold text-lg text-gray-900'>Шаңырақ</span>
          </div>
          <nav className='flex items-center gap-8'>
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors ${
                  item.highlight
                    ? 'text-[#2f8f6a] border border-[#2f8f6a] rounded-full px-4 py-1.5 hover:bg-[#2f8f6a] hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => navigate('/feed')}
            className='bg-[#2f8f6a] text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity'
          >
            Помочь сейчас
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className='relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-2/3 h-full pointer-events-none'
          style={{ background: 'radial-gradient(ellipse at 80% 20%, #7EF1D0 0%, transparent 60%)', opacity: 0.5 }} />
        <div className='max-w-7xl mx-auto px-8 py-20 flex items-center gap-16 relative z-10'>
          <div className='flex-1 max-w-xl'>
            <div className='inline-flex items-center gap-2 bg-[#e8f8f2] text-[#2f8f6a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6'>
              🇰🇿 Благотворительность в Казахстане
            </div>
            <h1 className='text-5xl font-bold text-gray-900 leading-tight mb-6'>
              Помогайте тем,<br />
              кто нуждается<br />
              <span style={{ background: 'linear-gradient(135deg, #1e6b4e, #5ec49a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                в вашей поддержке
              </span>
            </h1>
            <p className='text-lg text-gray-500 leading-relaxed mb-8'>
              Шаңырақ объединяет проверенные фонды и подопечных со всего Казахстана. Помогайте удобно — через Kaspi или бонусами Kaspi Gold.
            </p>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate('/feed')}
                className='bg-[#2f8f6a] text-white font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity text-base'
              >
                Начать помогать
              </button>
              <a href={APP_STORE_URL} target='_blank' rel='noopener noreferrer'
                className='text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1.5'>
                <img src={`${SUPABASE_IMG}/app%20store%20.png`} alt='App Store' className='h-9 object-contain' />
              </a>
              <a href={GOOGLE_PLAY_URL} target='_blank' rel='noopener noreferrer'>
                <img src={`${SUPABASE_IMG}/Google%20.png`} alt='Google Play' className='h-9 object-contain' />
              </a>
            </div>
          </div>
          <div className='flex-1 flex justify-center'>
            <img
              src={`${SUPABASE_IMG}/iPhone%20Mockup%2014.png`}
              alt='Приложение Шаңырақ'
              className='object-contain drop-shadow-2xl'
              style={{ height: '520px' }}
            />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 50%, #5ec49a 100%)' }}>
        <div className='max-w-7xl mx-auto px-8 py-16'>
          <div className='grid grid-cols-4 gap-8'>
            <StatCard value={totalBeneficiaries} suffix='+' label='Подопечных' />
            <StatCard value={Math.round(totalRaised / 1000)} suffix=' тыс ₸' label='Собрано в общей сложности' />
            <StatCard value={totalPercent} suffix='%' label='От общей цели' />
            <StatCard value={funds.length} suffix='' label='Фондов-партнёров' />
          </div>
        </div>
      </section>

      {/* ── КАТЕГОРИИ ПОДОПЕЧНЫХ ── */}
      <section className='max-w-7xl mx-auto px-8 py-20'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Кому мы помогаем</h2>
          <p className='text-gray-500 max-w-xl mx-auto'>
            В одном месте — подопечные с разными потребностями из всех регионов Казахстана
          </p>
        </div>
        <div className='grid grid-cols-5 gap-4'>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              onClick={() => navigate(`/feed?category=${cat.key}`)}
              className='group cursor-pointer rounded-2xl overflow-hidden relative'
              style={{
                background: cat.green
                  ? 'linear-gradient(135deg, #1e6b4e, #2f8f6a)'
                  : 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '160px',
              }}
            >
              <div className='absolute inset-0 flex flex-col justify-between p-4'>
                <span className={`text-sm font-semibold ${cat.green ? 'text-white' : 'text-gray-800'}`}>
                  {cat.label}
                </span>
                <span className={`text-xs ${cat.green ? 'text-white/70' : 'text-gray-400'}`}>
                  {categoryCounts[cat.key] || 0} подопечных
                </span>
              </div>
              <img
                src={cat.image}
                alt={cat.label}
                className='absolute bottom-0 left-2 h-24 object-contain group-hover:scale-105 transition-transform duration-300'
              />
              <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity'
                style={{ background: cat.green ? 'rgba(0,0,0,0.1)' : 'rgba(47,143,106,0.05)' }} />
            </div>
          ))}
        </div>
        <div className='text-center mt-8'>
          <button
            onClick={() => navigate('/feed')}
            className='border border-[#2f8f6a] text-[#2f8f6a] font-semibold px-6 py-2.5 rounded-full hover:bg-[#2f8f6a] hover:text-white transition-colors'
          >
            Смотреть всех подопечных →
          </button>
        </div>
      </section>

      {/* ── ФОНДЫ-ПАРТНЁРЫ ── */}
      {funds.length > 0 && (
        <section className='bg-gray-50 py-20'>
          <div className='max-w-7xl mx-auto px-8'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Фонды-партнёры</h2>
              <p className='text-gray-500 max-w-xl mx-auto'>
                Мы работаем только с официально зарегистрированными фондами — каждый подопечный верифицирован
              </p>
            </div>
            <div className='relative overflow-hidden'>
              <div className='absolute left-0 top-0 bottom-0 z-10 pointer-events-none w-20'
                style={{ background: 'linear-gradient(to right, #f9fafb, transparent)' }} />
              <div className='absolute right-0 top-0 bottom-0 z-10 pointer-events-none w-20'
                style={{ background: 'linear-gradient(to left, #f9fafb, transparent)' }} />
              <div
                ref={carouselRef}
                className='funds-carousel flex gap-6'
                style={{ width: 'max-content' }}
              >
                {[...funds, ...funds].map((fund, i) => (
                  <div
                    key={fund.id + '-' + i}
                    onClick={() => navigate(`/fund/${encodeURIComponent(fund.name)}`)}
                    className='bg-white rounded-2xl cursor-pointer flex-shrink-0 hover:shadow-md transition-shadow'
                    style={{ width: '160px', padding: '16px' }}
                  >
                    <div className='w-full h-16 flex items-center justify-center mb-3'>
                      <img src={fund.logo_url} alt={fund.name} className='max-w-full max-h-full object-contain' />
                    </div>
                    <p className='text-xs font-semibold text-gray-800 leading-tight text-center'>{fund.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='text-center mt-8'>
              <button
                onClick={() => navigate('/partner-funds')}
                className='border border-[#2f8f6a] text-[#2f8f6a] font-semibold px-6 py-2.5 rounded-full hover:bg-[#2f8f6a] hover:text-white transition-colors'
              >
                Все фонды-партнёры →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── БАННЕРЫ АКЦИЙ ── */}
      <section className='max-w-7xl mx-auto px-8 py-20'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Специальные возможности</h2>
          <p className='text-gray-500'>Помогайте удобным для вас способом</p>
        </div>
        <div className='grid grid-cols-2 gap-8'>
          {/* Kaspi бонусы */}
          <div className='rounded-3xl overflow-hidden relative group cursor-pointer'
            onClick={() => navigate('/feed')}
            style={{ background: 'linear-gradient(135deg, #e8f8f2, #c8f0e0)', minHeight: '220px' }}>
            <div className='p-8'>
              <div className='text-3xl mb-3'>🎁</div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Помогайте бонусами Kaspi</h3>
              <p className='text-gray-600 text-sm mb-4'>
                Тратьте накопленные бонусы Kaspi Gold на помощь подопечным — это просто и быстро
              </p>
              <button
                className='bg-[#2f8f6a] text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity'
                onClick={(e) => { e.stopPropagation(); navigate('/?action=kaspi-bonus'); }}
              >
                Помочь бонусами
              </button>
            </div>
            <img
              src={`${SUPABASE_IMG}/image.png`}
              alt='Kaspi бонусы'
              className='absolute right-0 bottom-0 h-40 object-contain opacity-80 group-hover:opacity-100 transition-opacity'
            />
          </div>

          {/* Ветераны */}
          <div className='rounded-3xl overflow-hidden relative group cursor-pointer'
            onClick={() => navigate('/feed')}
            style={{ background: 'linear-gradient(135deg, #1e6b4e, #2f8f6a)', minHeight: '220px' }}>
            <div className='p-8'>
              <div className='text-3xl mb-3'>🎖️</div>
              <h3 className='text-xl font-bold text-white mb-2'>Помочь ветеранам</h3>
              <p className='text-white/70 text-sm mb-4'>
                Поддержите ветеранов — людей, которые отдали лучшие годы жизни на службу стране
              </p>
              <button
                className='bg-white text-[#2f8f6a] text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity'
              >
                Помочь ветеранам
              </button>
            </div>
            <img
              src={`${SUPABASE_IMG}/9%20may.png`}
              alt='Ветераны'
              className='absolute right-0 bottom-0 h-40 object-contain opacity-80 group-hover:opacity-100 transition-opacity'
            />
          </div>

          {/* Регулярная помощь */}
          <div className='rounded-3xl col-span-2 relative overflow-hidden'
            style={{ background: 'linear-gradient(135deg, #0f3d2a, #1e6b4e)', minHeight: '160px' }}>
            <div className='p-10 flex items-center justify-between'>
              <div>
                <h3 className='text-2xl font-bold text-white mb-2'>Регулярная поддержка</h3>
                <p className='text-white/70 max-w-lg'>
                  Оформите ежемесячную подписку — небольшая сумма каждый месяц делает жизнь подопечных стабильнее
                </p>
              </div>
              <button
                onClick={() => navigate('/feed')}
                className='bg-white text-[#1e6b4e] font-semibold px-7 py-3 rounded-full hover:opacity-90 transition-opacity flex-shrink-0 ml-8'
              >
                Подписаться на помощь
              </button>
            </div>
            <div className='absolute right-16 top-1/2 -translate-y-1/2 text-8xl opacity-10'>♻️</div>
          </div>
        </div>
      </section>

      {/* ── ФУНКЦИОНАЛЬНОСТЬ ── */}
      <section className='bg-gray-50 py-20'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Всё для удобной помощи</h2>
            <p className='text-gray-500 max-w-xl mx-auto'>
              Платформа создана так, чтобы помогать было легко, быстро и прозрачно
            </p>
          </div>
          <div className='grid grid-cols-3 gap-6'>
            {FEATURES.map((f, i) => (
              <div key={i} className='bg-white rounded-2xl p-6 hover:shadow-md transition-shadow'>
                <div className='text-3xl mb-4'>{f.icon}</div>
                <h3 className='text-base font-bold text-gray-900 mb-2'>{f.title}</h3>
                <p className='text-sm text-gray-500 leading-relaxed'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПРИЛОЖЕНИЕ ── */}
      <section className='max-w-7xl mx-auto px-8 py-20'>
        <div className='flex items-center gap-16'>
          <div className='flex-1'>
            <div className='inline-flex items-center gap-2 bg-[#e8f8f2] text-[#2f8f6a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6'>
              📱 Мобильное приложение
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Скачайте приложение<br />и помогайте на ходу
            </h2>
            <p className='text-gray-500 mb-6 leading-relaxed'>
              Полный функционал в кармане: просматривайте подопечных, делитесь реферальными ссылками и отслеживайте свой вклад в любое время
            </p>
            <ul className='space-y-3 mb-8'>
              {[
                'Уведомления о новых подопечных',
                'История всех ваших пожертвований',
                'Реферальная статистика',
                'Быстрая оплата через Kaspi',
              ].map((item) => (
                <li key={item} className='flex items-center gap-3 text-sm text-gray-700'>
                  <span className='w-5 h-5 bg-[#e8f8f2] rounded-full flex items-center justify-center flex-shrink-0'>
                    <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                      <path d='M2 5l2 2 4-4' stroke='#2f8f6a' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className='flex gap-3'>
              <a href={APP_STORE_URL} target='_blank' rel='noopener noreferrer'>
                <img src={`${SUPABASE_IMG}/app%20store%20.png`} alt='App Store' className='h-12 object-contain' />
              </a>
              <a href={GOOGLE_PLAY_URL} target='_blank' rel='noopener noreferrer'>
                <img src={`${SUPABASE_IMG}/Google%20.png`} alt='Google Play' className='h-12 object-contain' />
              </a>
            </div>
          </div>
          <div className='flex-1 flex justify-center'>
            <img
              src={`${SUPABASE_IMG}/iPhone%20Mockup%2014.png`}
              alt='Приложение Шаңырақ'
              className='object-contain'
              style={{ height: '460px' }}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ФИНАЛЬНЫЙ ── */}
      <section style={{ background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 50%, #5ec49a 100%)' }}>
        <div className='max-w-7xl mx-auto px-8 py-20 text-center'>
          <h2 className='text-3xl font-bold text-white mb-4'>
            Начните помогать прямо сейчас
          </h2>
          <p className='text-white/70 mb-8 max-w-md mx-auto'>
            Каждое пожертвование меняет чью-то жизнь. Выберите подопечного и сделайте первый шаг.
          </p>
          <button
            onClick={() => navigate('/feed')}
            className='bg-white text-[#1e6b4e] font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity text-base'
          >
            Выбрать подопечного
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className='bg-gray-900 text-gray-400 py-10'>
        <div className='max-w-7xl mx-auto px-8 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-8 h-8 object-contain opacity-80' />
            <span className='text-white font-semibold'>Шаңырақ</span>
          </div>
          <div className='flex gap-8 text-sm'>
            <button onClick={() => navigate('/documents')} className='hover:text-white transition-colors'>Документы</button>
            <button onClick={() => navigate('/policy')} className='hover:text-white transition-colors'>Политика</button>
            <button onClick={() => navigate('/contacts')} className='hover:text-white transition-colors'>Контакты</button>
          </div>
          <p className='text-xs'>© 2025 Шаңырақ. Все права защищены.</p>
        </div>
      </footer>

      <style>{`
        .funds-carousel {
          animation: scroll-left 30s linear infinite;
        }
        .funds-carousel:hover {
          animation-play-state: paused;
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
