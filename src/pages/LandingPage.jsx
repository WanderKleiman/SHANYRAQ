import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMainPageData } from '../hooks/useMainPageData';
import { usePartnerFunds } from '../hooks/usePartnerFunds';

const SUPABASE_IMG = 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images';

const APP_STORE_URL = 'https://apps.apple.com/kz/app/%D1%88%D0%B0%D0%BD%D1%8B%D1%80%D0%B0%D0%BA/id6766084376';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=world.shanyrak.app&pcampaignid=web_share';

const G = 'linear-gradient(135deg, #1e6b4e, #5ec49a)';

const CATEGORIES = [
  { key: 'children',   label: 'Дети',               image: `${SUPABASE_IMG}/111-1.png`,    green: true  },
  { key: 'animals',    label: 'Питомцы',             image: `${SUPABASE_IMG}/pet.png`,      green: false },
  { key: 'urgent',     label: 'Взрослые',            image: `${SUPABASE_IMG}/people.png`,   green: false },
  { key: 'operations', label: 'Пожилые',             image: `${SUPABASE_IMG}/grandma2.png`, green: true  },
  { key: 'social',     label: 'Социальные проекты',  image: `${SUPABASE_IMG}/social.png`,   green: false },
];

const DOCS = [
  { label: 'Устав фонда',                 path: '/documents' },
  { label: 'Политика конфиденциальности', path: '/policy'    },
  { label: 'Договор оферты',              path: '/oferta'    },
  { label: 'Отчёты и документы',          path: '/documents' },
];

const NAV_CATS = ['Дети', 'Пожилые', 'Взрослые', 'Питомцы', 'Социальные проекты'];

const CAT_LABELS = {
  children: 'Дети', animals: 'Питомцы', urgent: 'Взрослые',
  operations: 'Пожилые', social: 'Соц. проект',
};

// ── helpers ──────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

function useInView(threshold = 0.3) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Stats block ───────────────────────────────────────────────────────────────
function StatItem({ value, suffix, label, icon }) {
  const [ref, visible] = useInView(0.2);
  const count = useCountUp(visible ? value : 0);
  return (
    <div ref={ref} className='flex flex-col items-center text-center'>
      <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3'
        style={{ background: 'rgba(255,255,255,0.15)' }}>
        {icon}
      </div>
      <div className='text-4xl font-extrabold text-white tracking-tight mb-1 max-md:text-3xl'>
        {count.toLocaleString('ru-RU')}{suffix}
      </div>
      <div className='text-sm text-white/70 font-medium'>{label}</div>
    </div>
  );
}

// ── Beneficiary card ──────────────────────────────────────────────────────────
function BenCard({ b, onClick }) {
  const raised = b.raised_amount || 0;
  const target = b.target_amount || 1;
  const pct = Math.min(Math.round((raised / target) * 100), 100);
  const img = b.image_url || (b.images && b.images[0]);

  return (
    <div
      onClick={onClick}
      className='flex-shrink-0 cursor-pointer rounded-3xl overflow-hidden bg-white group transition-transform hover:-translate-y-1 hover:shadow-xl'
      style={{ width: '240px', boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}
    >
      {/* фото */}
      <div className='relative w-full overflow-hidden' style={{ height: '200px' }}>
        {img ? (
          <img src={img} alt={b.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-5xl'
            style={{ background: 'linear-gradient(135deg,#e8f8f2,#c8f0e0)' }}>🤲</div>
        )}
        {/* категория */}
        <div className='absolute top-3 left-3'>
          <span className='text-xs font-semibold text-white px-2.5 py-1 rounded-full'
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
            {CAT_LABELS[b.category] || b.category}
          </span>
        </div>
        {b.is_urgent && (
          <div className='absolute top-3 right-3'>
            <span className='text-xs font-bold text-white px-2 py-1 rounded-full'
              style={{ background: '#ef4444' }}>срочно</span>
          </div>
        )}
      </div>

      {/* контент */}
      <div className='p-4'>
        <p className='font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2'>{b.title}</p>
        {b.city && <p className='text-xs text-gray-500 mb-3'>📍 {b.city}</p>}
        <div className='inline-flex items-center gap-1 text-xs font-semibold text-[#2f8f6a] bg-[#e8f8f2] px-2.5 py-1 rounded-full'>
          💚 {raised.toLocaleString('ru-RU')} ₸ собрано
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { categoryCounts, totalRaised, totalTarget, beneficiaries } = useMainPageData();
  const { funds } = usePartnerFunds();
  const fundsCarouselRef = useRef(null);
  const benCarouselRef   = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const totalPercent = totalTarget > 0 ? Math.min(Math.round((totalRaised / totalTarget) * 100), 100) : 0;
  const totalBeneficiaries = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  // shuffle and pick first 12 for carousel
  const carouselBens = beneficiaries.slice(0, 12);

  const menuItems = [
    { label: 'Подопечные', path: '/feed' },
    { label: 'Фонды',      path: '/partner-funds' },
    { label: 'Документы',  path: '/documents' },
    { label: 'Контакты',   path: '/contacts' },
    { label: 'Компаниям',  path: '/b2b', highlight: true },
  ];

  const mainCats  = CATEGORIES.filter(c => c.key !== 'social');
  const socialCat = CATEGORIES.find(c => c.key === 'social');

  // beneficiary carousel scroll
  const scrollBen = (dir) => {
    if (!benCarouselRef.current) return;
    benCarouselRef.current.scrollBy({ left: dir * 520, behavior: 'smooth' });
  };

  return (
    <div className='bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden'>

      {/* ── HEADER ── */}
      <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-8 h-16 flex items-center justify-between max-md:px-5'>
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
            <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-9 h-9 object-contain' />
            <span className='font-bold text-lg text-gray-900'>Шаңырақ</span>
          </div>
          <nav className='flex items-center gap-7 max-md:hidden'>
            {menuItems.map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors ${item.highlight
                  ? 'text-[#2f8f6a] border border-[#2f8f6a] rounded-full px-4 py-1.5 hover:bg-[#2f8f6a] hover:text-white'
                  : 'text-gray-700 hover:text-gray-900'}`}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className='flex items-center gap-3'>
            <button onClick={() => navigate('/feed')}
              className='text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity max-md:px-4 max-md:text-xs'
              style={{ background: G }}>
              Помочь сейчас
            </button>
            <button className='hidden max-md:flex flex-col gap-1.5 p-1' onClick={() => setMenuOpen(!menuOpen)}>
              <span className='w-5 h-0.5 bg-gray-900 block'/>
              <span className='w-5 h-0.5 bg-gray-900 block'/>
              <span className='w-5 h-0.5 bg-gray-900 block'/>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className='hidden max-md:block bg-white border-t border-gray-100 px-5 py-4 space-y-3'>
            {menuItems.map((item) => (
              <button key={item.label} onClick={() => { navigate(item.path); setMenuOpen(false); }}
                className='block w-full text-left text-sm font-medium text-gray-900 py-2'>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className='relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-2/3 h-full pointer-events-none'
          style={{ background: 'radial-gradient(ellipse at 80% 20%, #7EF1D0 0%, transparent 60%)', opacity: 0.5 }} />
        <div className='max-w-7xl mx-auto px-8 py-20 flex items-center gap-16 relative z-10 max-md:px-5 max-md:py-12 max-md:flex-col max-md:gap-8'>
          <div className='flex-1 max-w-xl max-md:max-w-full'>
            <div className='inline-flex items-center gap-2 bg-[#e8f8f2] text-[#2f8f6a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6'>
              🇰🇿 Благотворительный фонд «Шаңырақ»
            </div>
            <h1 className='text-5xl font-bold text-gray-900 leading-tight mb-5 max-md:text-3xl'>
              Помогайте тем,<br />кто нуждается<br />
              <span style={{ background: G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                в вашей поддержке
              </span>
            </h1>
            <p className='text-base text-gray-800 leading-relaxed mb-8 max-md:text-sm'>
              Мы объединяем усилия партнёров, попечителей и технологий, чтобы поддерживать тех, кто в этом нуждается.
            </p>
            <div className='flex items-center gap-4 flex-wrap'>
              <button onClick={() => navigate('/feed')}
                className='text-white font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity text-base max-md:px-6 max-md:py-3 max-md:text-sm'
                style={{ background: G }}>
                Начать помогать
              </button>
              <a href={APP_STORE_URL} target='_blank' rel='noopener noreferrer'>
                <img src={`${SUPABASE_IMG}/app%20store%20.png`} alt='App Store' className='h-9 object-contain' />
              </a>
              <a href={GOOGLE_PLAY_URL} target='_blank' rel='noopener noreferrer'>
                <img src={`${SUPABASE_IMG}/Google%20.png`} alt='Google Play' className='h-9 object-contain' />
              </a>
            </div>
          </div>
          <div className='flex-1 flex justify-center max-md:hidden'>
            <img src={`${SUPABASE_IMG}/iPhone%20Mockup%2014.png`} alt='Приложение Шаңырақ'
              className='object-contain drop-shadow-2xl' style={{ height: '520px' }} />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 60%, #5ec49a 100%)' }}>
        <div className='max-w-7xl mx-auto px-8 py-16 max-md:px-5 max-md:py-12'>
          <div className='grid grid-cols-4 gap-8 max-md:grid-cols-2 max-md:gap-8'>
            <StatItem value={totalBeneficiaries} suffix='+' label='Подопечных на платформе' icon='🤲' />
            <StatItem value={Math.floor(totalRaised / 1_000_000)} suffix=' млн+ ₸' label='Поддержано подопечных' icon='💚' />
            <StatItem value={totalPercent} suffix='%' label='От общей цели сборов' icon='🎯' />
            <StatItem value={funds.length} suffix='' label='Фондов-партнёров' icon='🏛️' />
          </div>
        </div>
      </section>

      {/* ── КОМУ МЫ ПОМОГАЕМ ── */}
      <section className='max-w-7xl mx-auto px-8 py-20 max-md:px-5 max-md:py-14'>
        <div className='text-center mb-12 max-md:mb-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-3 max-md:text-2xl'>Кому мы помогаем</h2>
          <p className='text-gray-700 max-w-xl mx-auto max-md:text-sm'>
            В одном месте — подопечные с разными потребностями из всех регионов Казахстана
          </p>
        </div>

        {/* 4 карточки в ряд */}
        <div className='grid grid-cols-4 gap-4 mb-4 max-md:grid-cols-2 max-md:gap-3'>
          {mainCats.map((cat) => (
            <div key={cat.key} onClick={() => navigate(`/feed?category=${cat.key}`)}
              className='group cursor-pointer rounded-2xl overflow-hidden relative'
              style={{
                background: cat.green ? '#2f8f6a' : 'white',
                boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)',
                height: '160px',
              }}>
              {/* inner shadow overlay */}
              <div className='absolute inset-0 pointer-events-none rounded-2xl'
                style={{ boxShadow: 'inset 0px 4px 4px 0px rgba(0,0,0,0.18)', zIndex: 20 }} />
              <div className='absolute inset-0 flex flex-col justify-between p-4 z-10'>
                <span className={`text-sm font-semibold ${cat.green ? 'text-white' : 'text-gray-900'}`}>
                  {cat.label}
                </span>
                <span className={`text-xs ${cat.green ? 'text-white/80' : 'text-gray-500'}`}>
                  {categoryCounts[cat.key] || 0} подопечных
                </span>
              </div>
              <img src={cat.image} alt={cat.label}
                className='absolute bottom-0 left-2 h-24 object-contain group-hover:scale-105 transition-transform duration-300 z-10' />
              <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity z-30'
                style={{ background: cat.green ? 'rgba(0,0,0,0.08)' : 'rgba(47,143,106,0.05)' }} />
            </div>
          ))}
        </div>

        {/* Социальные проекты — широкая карточка снизу */}
        {socialCat && (
          <div onClick={() => navigate(`/feed?category=${socialCat.key}`)}
            className='group cursor-pointer rounded-2xl overflow-hidden relative w-full'
            style={{
              background: 'white',
              boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)',
              height: '110px',
            }}>
            <div className='absolute inset-0 pointer-events-none rounded-2xl'
              style={{ boxShadow: 'inset 0px 4px 4px 0px rgba(0,0,0,0.18)', zIndex: 20 }} />
            <div className='absolute inset-0 flex items-center justify-between px-6 z-10'>
              <div>
                <span className='text-sm font-semibold text-gray-900 block mb-1'>{socialCat.label}</span>
                <span className='text-xs text-gray-500'>{categoryCounts[socialCat.key] || 0} подопечных</span>
              </div>
              <img src={socialCat.image} alt={socialCat.label}
                className='h-20 object-contain group-hover:scale-105 transition-transform duration-300' />
            </div>
            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl z-30'
              style={{ background: 'rgba(47,143,106,0.04)' }} />
          </div>
        )}

        <div className='text-center mt-8'>
          <button onClick={() => navigate('/feed')}
            className='text-white font-semibold px-7 py-3 rounded-full hover:opacity-90 transition-opacity'
            style={{ background: G }}>
            Смотреть всех подопечных →
          </button>
        </div>
      </section>

      {/* ── КАРУСЕЛЬ ПОДОПЕЧНЫХ ── */}
      {carouselBens.length > 0 && (
        <section className='py-20 max-md:py-14' style={{ background: '#f7f9f8' }}>
          <div className='max-w-7xl mx-auto px-8 max-md:px-5'>
            <div className='flex items-end justify-between mb-10 max-md:mb-6'>
              <div>
                <h2 className='text-3xl font-bold text-gray-900 mb-2 max-md:text-2xl'>Реальные люди ждут помощи</h2>
                <p className='text-gray-700 max-md:text-sm'>Каждая карточка — это живой человек со своей историей</p>
              </div>
              <div className='flex gap-2 max-md:hidden'>
                <button onClick={() => scrollBen(-1)}
                  className='w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#2f8f6a] hover:text-[#2f8f6a] transition-colors text-gray-600'>
                  ←
                </button>
                <button onClick={() => scrollBen(1)}
                  className='w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#2f8f6a] hover:text-[#2f8f6a] transition-colors text-gray-600'>
                  →
                </button>
              </div>
            </div>

            {/* карточки */}
            <div ref={benCarouselRef}
              className='flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory'
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {carouselBens.map((b) => (
                <div key={b.id} className='snap-start'>
                  <BenCard b={b} onClick={() => navigate('/feed')} />
                </div>
              ))}
              {/* последняя карточка — CTA */}
              <div className='snap-start flex-shrink-0 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer'
                style={{ width: '240px', background: G, minHeight: '350px' }}
                onClick={() => navigate('/feed')}>
                <div className='text-4xl'>🤲</div>
                <p className='text-white font-bold text-center px-6 leading-snug'>Смотреть всех подопечных</p>
                <div className='bg-white/20 text-white text-sm font-semibold px-5 py-2 rounded-full border border-white/40'>
                  Открыть →
                </div>
              </div>
            </div>

            <div className='text-center mt-8'>
              <button onClick={() => navigate('/feed')}
                className='border border-[#2f8f6a] text-[#2f8f6a] font-semibold px-6 py-2.5 rounded-full hover:bg-[#2f8f6a] hover:text-white transition-colors'>
                Все подопечные →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── ФОНДЫ-ПАРТНЁРЫ ── */}
      {funds.length > 0 && (
        <section className='bg-white py-20 max-md:py-14'>
          <div className='max-w-7xl mx-auto px-8 max-md:px-5'>
            <div className='text-center mb-12 max-md:mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-3 max-md:text-2xl'>Фонды-партнёры</h2>
              <p className='text-gray-700 max-w-xl mx-auto max-md:text-sm'>
                Только официально зарегистрированные фонды — каждый подопечный верифицирован
              </p>
            </div>
            <div className='relative overflow-hidden'>
              <div className='absolute left-0 top-0 bottom-0 z-10 pointer-events-none w-20'
                style={{ background: 'linear-gradient(to right, white, transparent)' }} />
              <div className='absolute right-0 top-0 bottom-0 z-10 pointer-events-none w-20'
                style={{ background: 'linear-gradient(to left, white, transparent)' }} />
              <div className='funds-carousel flex gap-6' style={{ width: 'max-content' }}>
                {[...funds, ...funds, ...funds, ...funds].map((fund, i) => (
                  <div key={fund.id + '-' + i} onClick={() => navigate(`/fund/${encodeURIComponent(fund.name)}`)}
                    className='bg-white rounded-2xl cursor-pointer flex-shrink-0 hover:shadow-md transition-shadow border border-gray-100'
                    style={{ width: '160px', padding: '16px' }}>
                    <div className='w-full h-16 flex items-center justify-center mb-3'>
                      <img src={fund.logo_url} alt={fund.name} className='max-w-full max-h-full object-contain' />
                    </div>
                    <p className='text-xs font-semibold text-gray-900 leading-tight text-center'>{fund.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='text-center mt-8'>
              <button onClick={() => navigate('/partner-funds')}
                className='border border-[#2f8f6a] text-[#2f8f6a] font-semibold px-6 py-2.5 rounded-full hover:bg-[#2f8f6a] hover:text-white transition-colors'>
                Все фонды-партнёры →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── KASPI + РЕГУЛЯРНАЯ ПОДДЕРЖКА ── */}
      <section className='py-20 max-md:py-14' style={{ background: '#f7f9f8' }}>
        <div className='max-w-7xl mx-auto px-8 max-md:px-5'>
          <div className='text-center mb-12 max-md:mb-8'>
            <h2 className='text-3xl font-bold text-gray-900 mb-3 max-md:text-2xl'>Специальные возможности</h2>
            <p className='text-gray-700'>Помогайте удобным для вас способом</p>
          </div>
          <div className='grid grid-cols-2 gap-8 max-md:grid-cols-1 max-md:gap-5'>
            {/* Kaspi */}
            <div className='rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow bg-white'
              onClick={() => navigate('/feed')}
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
              <img src={`${SUPABASE_IMG}/image.png`} alt='Kaspi бонусы'
                className='w-full object-cover' style={{ borderRadius: '24px 24px 0 0', maxHeight: '220px' }} />
              <div className='p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>Помогайте бонусами Kaspi</h3>
                <p className='text-gray-700 text-sm mb-4 leading-relaxed'>
                  Тратьте накопленные бонусы Kaspi Gold на помощь подопечным — это просто и быстро
                </p>
                <button className='text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity'
                  style={{ background: G }}
                  onClick={(e) => { e.stopPropagation(); navigate('/?action=kaspi-bonus'); }}>
                  Помочь бонусами
                </button>
              </div>
            </div>
            {/* Регулярная поддержка */}
            <div className='rounded-3xl p-8 flex flex-col justify-between max-md:p-6'
              style={{ background: 'linear-gradient(135deg, #ffffff 30%, #7EF1D0 100%)', minHeight: '320px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <div>
                <div className='w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl'
                  style={{ background: 'rgba(47,143,106,0.12)' }}>🔄</div>
                <h3 className='text-2xl font-bold text-gray-900 mb-3'>Регулярная поддержка</h3>
                <p className='text-gray-700 leading-relaxed mb-6 max-md:text-sm'>
                  Оформите ежемесячную подписку — небольшая сумма каждый месяц делает жизнь подопечных стабильнее
                </p>
              </div>
              <button onClick={() => navigate('/feed')}
                className='text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity self-start max-md:text-sm'
                style={{ background: G }}>
                Подписаться на помощь
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ПРИЛОЖЕНИЕ ── */}
      <section className='bg-white py-20 max-md:py-14'>
        <div className='max-w-7xl mx-auto px-8 max-md:px-5'>
          <div className='flex items-center gap-16 max-md:flex-col max-md:gap-8'>
            <div className='flex-1 max-md:order-2'>
              <div className='inline-flex items-center gap-2 bg-[#e8f8f2] text-[#2f8f6a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6'>
                📱 Мобильное приложение
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-4 max-md:text-2xl'>
                Скачайте приложение<br />и помогайте на ходу
              </h2>
              <p className='text-gray-700 mb-6 leading-relaxed max-md:text-sm'>
                Полный функционал в кармане: просматривайте подопечных, делитесь ссылками и отслеживайте вклад
              </p>
              <ul className='space-y-3 mb-8'>
                {['Уведомления о новых подопечных', 'История всех ваших пожертвований',
                  'Реферальная статистика', 'Быстрая оплата через Kaspi'].map((item) => (
                  <li key={item} className='flex items-center gap-3 text-sm text-gray-800'>
                    <span className='w-5 h-5 bg-[#e8f8f2] rounded-full flex items-center justify-center flex-shrink-0'>
                      <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                        <path d='M2 5l2 2 4-4' stroke='#2f8f6a' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className='flex gap-3 flex-wrap'>
                <a href={APP_STORE_URL} target='_blank' rel='noopener noreferrer'>
                  <img src={`${SUPABASE_IMG}/app%20store%20.png`} alt='App Store' className='h-12 object-contain' />
                </a>
                <a href={GOOGLE_PLAY_URL} target='_blank' rel='noopener noreferrer'>
                  <img src={`${SUPABASE_IMG}/Google%20.png`} alt='Google Play' className='h-12 object-contain' />
                </a>
              </div>
            </div>
            <div className='flex-1 flex justify-center max-md:order-1'>
              <img src={`${SUPABASE_IMG}/iPhone%20Mockup%2014.png`} alt='Приложение Шаңырақ'
                className='object-contain max-md:h-64' style={{ height: '460px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: G }}>
        <div className='max-w-7xl mx-auto px-8 py-20 text-center max-md:px-5 max-md:py-14'>
          <h2 className='text-3xl font-bold text-white mb-4 max-md:text-2xl'>Начните помогать прямо сейчас</h2>
          <p className='text-white/80 mb-8 max-w-md mx-auto max-md:text-sm'>
            Каждое пожертвование меняет чью-то жизнь. Выберите подопечного и сделайте первый шаг.
          </p>
          <button onClick={() => navigate('/feed')}
            className='bg-white text-[#1e6b4e] font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity'>
            Выбрать подопечного
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className='bg-white border-t border-gray-100'>
        <div className='max-w-7xl mx-auto px-8 py-14 max-md:px-5 max-md:py-10'>
          <div className='grid grid-cols-4 gap-10 mb-12 max-md:grid-cols-2 max-md:gap-8'>
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-8 h-8 object-contain' />
                <span className='font-bold text-gray-900 text-base'>Шаңырақ</span>
              </div>
              <p className='text-sm text-gray-700 leading-relaxed mb-3'>
                Благотворительный фонд Казахстана. Объединяем фонды, попечителей и технологии.
              </p>
              <p className='text-xs text-gray-500'>БИН: 240440030399</p>
              <p className='text-xs text-gray-500'>Зарегистрирован в РК</p>
              <div className='flex gap-3 mt-4'>
                <a href={APP_STORE_URL} target='_blank' rel='noopener noreferrer'>
                  <img src={`${SUPABASE_IMG}/app%20store%20.png`} alt='App Store' className='h-8 object-contain' />
                </a>
                <a href={GOOGLE_PLAY_URL} target='_blank' rel='noopener noreferrer'>
                  <img src={`${SUPABASE_IMG}/Google%20.png`} alt='Google Play' className='h-8 object-contain' />
                </a>
              </div>
            </div>
            <div>
              <h4 className='font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide'>Кому помогаем</h4>
              <ul className='space-y-2.5'>
                {NAV_CATS.map((c) => (
                  <li key={c}>
                    <button onClick={() => navigate('/feed')}
                      className='text-sm text-gray-700 hover:text-[#2f8f6a] transition-colors'>{c}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className='font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide'>Документы</h4>
              <ul className='space-y-2.5'>
                {DOCS.map((d) => (
                  <li key={d.label}>
                    <button onClick={() => navigate(d.path)}
                      className='text-sm text-gray-700 hover:text-[#2f8f6a] transition-colors text-left'>{d.label}</button>
                  </li>
                ))}
                <li>
                  <button onClick={() => navigate('/partner-funds')}
                    className='text-sm text-gray-700 hover:text-[#2f8f6a] transition-colors'>Фонды-партнёры</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide'>Контакты</h4>
              <ul className='space-y-2.5 text-sm text-gray-700'>
                <li><button onClick={() => navigate('/contacts')} className='hover:text-[#2f8f6a] transition-colors'>Страница контактов</button></li>
                <li><button onClick={() => navigate('/b2b')} className='hover:text-[#2f8f6a] transition-colors'>Для компаний (CSR/ESG)</button></li>
                <li className='pt-2'><span className='text-xs text-gray-500 block mb-1'>Сайт</span><span>shanyrak.world</span></li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-100 pt-6 flex items-center justify-between max-md:flex-col max-md:gap-3 max-md:text-center'>
            <p className='text-xs text-gray-500'>© 2025 Шаңырақ. Все права защищены.</p>
            <div className='flex gap-5'>
              <button onClick={() => navigate('/policy')} className='text-xs text-gray-500 hover:text-gray-800 transition-colors'>Политика конфиденциальности</button>
              <button onClick={() => navigate('/oferta')} className='text-xs text-gray-500 hover:text-gray-800 transition-colors'>Договор оферты</button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .funds-carousel { animation: funds-scroll 35s linear infinite; }
        .funds-carousel:hover { animation-play-state: paused; }
        @keyframes funds-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        /* hide scrollbar in beneficiary carousel */
        section div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
