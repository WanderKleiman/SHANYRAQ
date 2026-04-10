import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { useMainPageData } from '../hooks/useMainPageData';
import { usePartnerFunds } from '../hooks/usePartnerFunds';
import { supabase } from '../supabaseClient';
import CharityModal from '../components/CharityModal';
import Icon from '../components/Icon';

const isNative = Capacitor.isNativePlatform();

const SUPABASE_IMG = 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images';

const CATEGORY_CARDS = [
  { key: 'children', label: 'Дети', image: `${SUPABASE_IMG}/111-1.png`, isGreen: true },
  { key: 'animals', label: 'Питомцы', image: `${SUPABASE_IMG}/pet.png`, isGreen: false },
  { key: 'urgent', label: 'Взрослые', image: `${SUPABASE_IMG}/people.png`, isGreen: false, bottomAligned: true },
  { key: 'operations', label: 'Пожилые', image: `${SUPABASE_IMG}/grandma2.png`, isGreen: true },
  { key: 'social', label: 'Социальные проекты', image: `${SUPABASE_IMG}/social.png`, isGreen: false, bottomAligned: true },
];

const CATEGORY_NAMES = {
  children: 'Дети',
  animals: 'Животные',
  operations: 'Пожилые',
  urgent: 'Взрослые',
  social: 'Социальные проекты',
  non_material: 'Нематериальная помощь',
};


function formatSum(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' млн';
  if (num >= 1000) return Math.round(num / 1000).toLocaleString('ru-RU') + ' тыс';
  return num.toLocaleString('ru-RU');
}

function MainPage() {
  const navigate = useNavigate();
  const { categoryCounts, totalRaised, totalTarget, beneficiaries, loading } = useMainPageData();
  const { funds } = usePartnerFunds();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDownloadSection, setShowDownloadSection] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const beneficiariesRef = React.useRef(null);

  // Subscription state
  const [mainSubAmount, setMainSubAmount] = useState(3000);
  const [mainCustomSub, setMainCustomSub] = useState('');
  const [showMainSubModal, setShowMainSubModal] = useState(false);
  const [mainSubPhone, setMainSubPhone] = useState('');
  const [mainSubStep, setMainSubStep] = useState('method');
  const MAIN_SUB_PRESETS = [1000, 3000, 5000, 10000];

  // Redirect old shared links /?beneficiary=X to /feed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const beneficiaryId = params.get('beneficiary');
    if (beneficiaryId) {
      navigate(`/feed?beneficiary=${beneficiaryId}`, { replace: true });
    }
  }, [navigate]);

  // Show download section when scrolling to beneficiaries
  useEffect(() => {
    const node = beneficiariesRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowDownloadSection(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loading]);

  // Count beneficiaries per fund
  const fundCounts = useMemo(() => {
    const counts = {};
    beneficiaries.forEach(b => {
      if (b.partner_fund) {
        counts[b.partner_fund] = (counts[b.partner_fund] || 0) + 1;
      }
    });
    return counts;
  }, [beneficiaries]);

  // Format beneficiary for CharityModal
  const formatBeneficiary = (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    categoryName: CATEGORY_NAMES[item.category] || item.category,
    partnerFund: item.partner_fund,
    image: item.image_url,
    images: item.images || [item.image_url],
    videos: item.videos || [],
    helpersCount: item.helpers_count,
    documentsLink: item.documents_link,
    raised: item.raised_amount || 0,
    target: item.target_amount || 0,
    isUrgent: item.is_urgent,
    collectionStatus: item.collection_status,
  });

  // Filter: for non_material keep only one (Алматы), hide rest
  const mainBeneficiaries = useMemo(() => {
    let keptOne = false;
    return beneficiaries.filter(b => {
      if (b.category === 'non_material') {
        if (!keptOne && b.city === 'Алматы') { keptOne = true; return true; }
        return false;
      }
      return true;
    });
  }, [beneficiaries]);

  // Search results for dropdown (search across ALL beneficiaries)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return beneficiaries.filter(b => b.title.toLowerCase().includes(q)).slice(0, 8);
  }, [beneficiaries, searchQuery]);

  // Filter for grid display
  const filteredBeneficiaries = useMemo(() => {
    if (!searchQuery.trim()) return mainBeneficiaries;
    const q = searchQuery.toLowerCase();
    return mainBeneficiaries.filter(b => b.title.toLowerCase().includes(q));
  }, [mainBeneficiaries, searchQuery]);

  const displayBeneficiaries = filteredBeneficiaries.slice(0, 10);
  const totalPercent = totalTarget > 0 ? Math.min(Math.round((totalRaised / totalTarget) * 100), 100) : 0;

  const menuItems = [
    { label: 'Подопечные', path: '/feed' },
    { label: 'Фонды-партнёры', path: '/partner-funds' },
    { label: 'Документы', path: '/documents' },
    { label: 'Контакты', path: '/contacts' },
  ];

  return (
    <>
    {/* === DESKTOP VERSION === */}
    <div className='hidden md:block h-screen overflow-hidden relative bg-white'>
      {/* Blur block */}
      <div
        className='absolute top-0 right-0 w-1/2 h-full'
        style={{ background: '#7EF1D0', borderRadius: '20%', filter: 'blur(200px)' }}
      />

      {/* Header */}
      <div className='flex items-center px-6 lg:px-12 pt-6 pb-4 relative z-10'>
        <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-12 h-12 lg:w-16 lg:h-16 object-contain' />
        <nav className='flex gap-6 lg:gap-8 ml-8'>
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className='text-sm lg:text-[15px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium'
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className='flex px-6 lg:px-12 gap-8 lg:gap-16 relative z-10' style={{ height: 'calc(100vh - 88px)' }}>
        {/* Left column */}
        <div className='w-[42%] flex-shrink-0 flex flex-col'>
          <h1 className='text-[2.4vw] font-bold text-[var(--text-primary)] leading-tight mb-[2vh] mt-[4vh]'>
            Благотворительный фонд «Шаңырақ» помогает делать жизнь людей в нашей стране лучше.
          </h1>
          <p className='text-[1.3vw] text-[var(--text-secondary)] leading-relaxed mb-[3vh]'>
            Мы объединяем усилия партнёров, попечителей и <span className='text-[var(--primary-color)] underline'>технологий</span>, чтобы поддерживать тех, кто в этом нуждается.
          </p>
          <div className='flex justify-center'>
            <img
              src={`${SUPABASE_IMG}/iPhone%20Mockup%2014.png`}
              alt='Мобильное приложение Шаңырақ'
              className='object-contain'
              style={{ height: '38vh' }}
            />
          </div>
          {!isNative && (
            <div className='mt-[1vh]'>
              <p className='text-[1.1vw] font-semibold text-[var(--text-primary)] mb-[1.5vh]'>Скачайте приложение</p>
              <div className='flex gap-3'>
                <a href='#' className='block'>
                  <img src={`${SUPABASE_IMG}/Google%20.png`} alt='Google Play' className='h-[5.5vh] object-contain' />
                </a>
                <a href='#' className='block'>
                  <img src={`${SUPABASE_IMG}/app%20store%20.png`} alt='App Store' className='h-[5.5vh] object-contain' />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className='flex-1 flex flex-col overflow-y-auto pl-[15%]'>
          <p className='text-[1.3vw] text-[var(--text-primary)] leading-relaxed text-center font-medium mb-[2vh] mt-[4vh]'>
            В одном месте мы собираем подопечных с разными потребностями: семьи, людей с инвалидностью, тех, кто оказался в трудной финансовой или жизненной ситуации, а также реализуем социальные проекты и инициативы
          </p>

          {/* Categories */}
          <div className='mb-[8vh]'>
            <div className='flex gap-[0.5vw]'>
              {CATEGORY_CARDS.slice(0, 4).map((cat) => (
                <div
                  key={cat.key}
                  onClick={() => navigate(`/feed?category=${cat.key}`)}
                  className={`${cat.isGreen ? 'bg-[#2f8f6a]' : 'bg-white'} h-[6.5vh] flex items-end cursor-pointer transition-transform active:scale-95 overflow-hidden relative flex-1`}
                  style={{ borderRadius: '15px', boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
                >
                  <img src={cat.image} alt={cat.label} className='object-contain' style={{ height: cat.bottomAligned ? '4vh' : '3.5vh', marginLeft: '0.3vw', alignSelf: 'flex-end' }} />
                  <div className='flex-1 text-right flex flex-col justify-between h-full relative z-10' style={{ padding: '0.8vh 0.6vw' }}>
                    <h3 className={`font-semibold leading-tight ${cat.isGreen ? 'text-white' : 'text-black'}`} style={{ fontSize: '0.95vw' }}>{cat.label}</h3>
                    <p className={cat.isGreen ? 'text-white' : 'text-black'} style={{ fontSize: '0.65vw' }}>{categoryCounts[cat.key] || 0} подопечных</p>
                  </div>
                  <div className='absolute inset-0 pointer-events-none' style={{ borderRadius: '15px', boxShadow: 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)', zIndex: 20 }} />
                </div>
              ))}
            </div>
            {/* Social projects - full width */}
            {(() => {
              const cat = CATEGORY_CARDS[4];
              return (
                <div
                  onClick={() => navigate(`/feed?category=${cat.key}`)}
                  className='bg-white h-[6.5vh] flex items-end cursor-pointer transition-transform active:scale-95 overflow-hidden relative mt-[1vw] w-full'
                  style={{ borderRadius: '15px', boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
                >
                  <img src={cat.image} alt={cat.label} className='object-contain' style={{ height: '5.5vh', marginLeft: '10px', alignSelf: 'flex-end' }} />
                  <div className='flex-1 text-right flex flex-col justify-between h-full relative z-10' style={{ padding: '0.8vh 0.6vw' }}>
                    <h3 className='font-semibold leading-tight text-black' style={{ fontSize: '0.95vw' }}>{cat.label}</h3>
                    <p className='text-black' style={{ fontSize: '0.65vw' }}>{categoryCounts[cat.key] || 0} подопечных</p>
                  </div>
                  <div className='absolute inset-0 pointer-events-none' style={{ borderRadius: '15px', boxShadow: 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)', zIndex: 20 }} />
                </div>
              );
            })()}
          </div>

          <p className='text-[1.3vw] text-[var(--text-primary)] leading-relaxed text-center font-medium mb-[2vh]'>
            Мы работаем с подопечными со всех регионов страны — в этом нам помогают фонды-партнёры.
          </p>

          {/* Partner funds carousel */}
          {funds.length > 0 && (
            <div className='mb-[3vh] overflow-hidden relative'>
              <div className='absolute left-0 top-0 bottom-0 z-10 pointer-events-none' style={{ width: '80px', background: 'linear-gradient(to right, #8df3d4, transparent)' }} />
              <div className='absolute right-0 top-0 bottom-0 z-10 pointer-events-none' style={{ width: '80px', background: 'linear-gradient(to left, #b4f6e2, transparent)' }} />
              <div className='funds-carousel flex gap-[1.5vw]' style={{ width: 'max-content' }}>
                {[...funds, ...funds].map((fund, i) => (
                  <div
                    key={fund.id + '-' + i}
                    onClick={() => navigate(`/fund/${encodeURIComponent(fund.name)}`)}
                    className='bg-white rounded-2xl cursor-pointer flex-shrink-0'
                    style={{ width: '11vw', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    <div className='mx-[0.3vw] mt-[0.3vw] rounded-xl overflow-hidden flex items-center justify-center' style={{ height: '8vh' }}>
                      <img src={fund.logo_url} alt={fund.name} className='max-w-full max-h-full object-contain' />
                    </div>
                    <div className='p-2'>
                      <p className='text-[0.9vw] font-medium text-black leading-tight'>{fund.name}</p>
                      <p className='text-[0.75vw] text-[var(--text-secondary)] mt-1'>{fundCounts[fund.name] || 0} подопечных</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='flex justify-center mt-[2vh] mb-[80px]'>
            <button
              onClick={() => navigate('/feed')}
              className='bg-[var(--primary-color)] text-white text-[1.2vw] font-semibold py-[1.5vh] px-[4vw] rounded-full hover:opacity-90 transition-opacity active:scale-95'
            >
              Продолжить на сайте
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* === MOBILE VERSION === */}
    <div className='md:hidden pt-4 pb-20 bg-white min-h-screen'>
      {/* Header + Menu button */}
      <div className='relative px-4 mb-4'>
        <button
          onClick={() => setShowMoreMenu(true)}
          className='absolute top-0 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center z-10'
        >
          <Icon name="menu" size={20} className="text-[var(--text-primary)]" />
        </button>
        <div className='flex flex-col items-center text-center'>
          <img
            src={`${SUPABASE_IMG}/14.webp`}
            alt='Шаңырақ'
            className='w-12 h-12 object-contain mb-1.5'
          />
          <h1 className='text-sm font-semibold text-[var(--text-primary)] leading-tight'>Благотворительный фонд</h1>
          <p className='text-sm font-semibold text-[var(--text-primary)]'>Шаңырақ</p>
        </div>
      </div>

      {/* Search */}
      <div className='px-4 mb-4'>
        <div className='relative'>
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <input
            type='text'
            inputMode='search'
            placeholder='Поиск подопечных'
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
            className='w-full h-8 pl-9 pr-8 bg-[#EAEAEA] rounded-3xl border-0 text-[var(--text-primary)] placeholder-gray-400 text-[16px] focus:outline-none relative z-10'
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              className='absolute right-3 top-1/2 -translate-y-1/2 z-10'
            >
              <Icon name="x" size={14} className="text-gray-400" />
            </button>
          )}

          {/* Search dropdown */}
          {searchOpen && searchQuery.trim() && (
            <>
              <div className='fixed inset-0 z-40' onClick={() => setSearchOpen(false)} />
              {searchResults.length > 0 ? (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-[60vh] overflow-y-auto'>
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedCharity(formatBeneficiary(item));
                        setSearchQuery('');
                        setSearchOpen(false);
                      }}
                      className='w-full flex items-center gap-3 p-3 active:bg-gray-100 transition-colors text-left border-b border-gray-50 last:border-0'
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className='w-11 h-11 rounded-xl object-cover flex-shrink-0'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-[13px] font-semibold text-[var(--text-primary)] leading-tight line-clamp-2'>{item.title}</p>
                        <p className='text-[11px] text-[var(--text-secondary)] mt-0.5'>
                          {CATEGORY_NAMES[item.category] || item.category} · {formatSum(item.raised_amount || 0)} ₸
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 p-4 text-center'>
                  <p className='text-sm text-[var(--text-secondary)]'>Ничего не найдено</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Category Cards */}
      <div className='px-2 mb-6'>
        <div className='flex flex-wrap gap-3 justify-between'>
          {CATEGORY_CARDS.map((cat, idx) => (
            <div
              key={cat.key}
              onClick={() => navigate(`/feed?category=${cat.key}`)}
              className={`rounded-2xl h-[60px] flex items-end cursor-pointer active:scale-[0.97] transition-transform overflow-hidden relative ${
                cat.isGreen ? 'bg-[#2f8f6a]' : 'bg-white'
              }`}
              style={{
                width: idx === 4 ? '100%' : (idx === 0 || idx === 3) ? 'calc(45% - 6px)' : 'calc(55% - 6px)',
                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
              }}
            >
              <img
                src={cat.image}
                alt={cat.label}
                className={`${cat.bottomAligned ? 'h-[55px]' : 'h-[50px]'} object-contain`}
                style={{ marginLeft: cat.bottomAligned ? '16px' : '14px', alignSelf: 'flex-end' }}
              />
              <div className='flex-1 text-right flex flex-col justify-between h-full py-2 pr-3 relative z-10'>
                <h3 className={`font-semibold text-[13px] leading-tight ${cat.isGreen ? 'text-white' : 'text-black'}`}>
                  {cat.label}
                </h3>
                <p className={`text-[10px] ${cat.isGreen ? 'text-white' : 'text-black'}`}>
                  {categoryCounts[cat.key] || 0} подопечных
                </p>
              </div>
              <div
                className='absolute inset-0 pointer-events-none'
                style={{ borderRadius: '16px', boxShadow: 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)', zIndex: 20 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Total Amount */}
      <div className='px-4 mb-6'>
        <div className='bg-white rounded-2xl p-5' style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <div className='flex items-center space-x-2 mb-3'>
              <div className='w-8 h-8 rounded-lg flex items-center justify-center' style={{ background: 'var(--primary-color)' }}>
                <Icon name="trending-up" size={16} className="text-white" />
              </div>
              <p className='text-[13px] font-semibold text-[var(--text-primary)]'>Общий сбор</p>
            </div>
            <div className='flex items-end justify-between mb-3'>
              <div>
                <p className='text-[11px] text-[var(--text-secondary)] mb-0.5'>Собрано</p>
                <p className='text-[22px] font-bold text-[var(--primary-color)] leading-none'>
                  {formatSum(totalRaised)} ₸
                </p>
              </div>
              <div className='text-right'>
                <p className='text-[11px] text-[var(--text-secondary)] mb-0.5'>Цель</p>
                <p className='text-[16px] font-semibold text-[var(--text-primary)] leading-none'>
                  {formatSum(totalTarget)} ₸
                </p>
              </div>
            </div>
            <div className='w-full h-2.5 bg-gray-100 rounded-full'>
              <div
                className='h-full rounded-full transition-all'
                style={{ width: `${totalPercent}%`, background: 'linear-gradient(90deg, #2f8f6a, #5ec49a)' }}
              />
            </div>
            <p className='text-[11px] text-[var(--text-secondary)] mt-1.5'>{totalPercent}% от цели</p>
        </div>
      </div>

      {/* Subscription card on main page */}
      <div className='px-3 mb-6'>
        <div className='rounded-2xl overflow-hidden relative' style={{ background: 'linear-gradient(135deg, #ffffff 30%, #7EF1D0 100%)' }}>
          <div className='p-5'>
            <div className='flex items-center space-x-2 mb-1'>
              <Icon name="heart-handshake" size={22} className="text-[#2f8f6a]" />
              <h3 className='text-[15px] font-bold text-[var(--text-primary)]'>Помогать ежемесячно</h3>
            </div>
            <p className='text-[13px] text-[var(--text-secondary)] mb-4'>Подпишитесь на регулярную помощь фонду</p>

            <div className='flex gap-2 mb-3'>
              {MAIN_SUB_PRESETS.map(amount => (
                <button
                  key={amount}
                  onClick={() => { setMainSubAmount(amount); setMainCustomSub(''); }}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                    mainSubAmount === amount && !mainCustomSub
                      ? 'bg-[#2f8f6a] text-white'
                      : 'bg-gray-100 text-[var(--text-primary)]'
                  }`}
                >
                  {amount >= 10000 ? `${amount / 1000}k` : amount.toLocaleString('ru-RU')} ₸
                </button>
              ))}
            </div>

            <div className='relative mb-4'>
              <input
                type='number'
                inputMode='numeric'
                placeholder='Своя сумма'
                value={mainCustomSub}
                onFocus={() => setMainSubAmount(0)}
                onChange={(e) => { setMainCustomSub(e.target.value); setMainSubAmount(0); }}
                className='w-full h-10 px-4 pr-8 rounded-xl bg-gray-100 text-[var(--text-primary)] placeholder-gray-400 text-[16px] font-medium focus:outline-none'
              />
              <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>₸</span>
            </div>

            <button
              onClick={() => {
                const finalAmount = mainCustomSub ? parseInt(mainCustomSub) : mainSubAmount;
                if (!finalAmount || finalAmount < 100) { toast.error('Минимальная сумма — 100 ₸'); return; }
                setMainSubAmount(finalAmount);
                setShowMainSubModal(true);
                setMainSubStep('method');
                setMainSubPhone('');
              }}
              className='w-full py-3 bg-[#2f8f6a] text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-transform flex items-center justify-center space-x-2'
            >
              <Icon name="heart" size={16} className="text-white" />
              <span>Помогать ежемесячно</span>
            </button>
          </div>
        </div>
      </div>

      {/* Partner Funds */}
      {funds.length > 0 && (
        <div className='mb-6'>
          <div className='bg-[#f0f6ff] rounded-xl mx-1 pt-4 pb-3'>
            <div className='flex items-center justify-between px-4 mb-3'>
              <div className='flex items-center gap-2'>
                <Icon name="building-2" size={18} className="text-black" />
                <h2 className='text-lg font-semibold text-[var(--text-primary)]'>Фонды-партнёры</h2>
              </div>
              <button onClick={() => navigate('/partner-funds')} className='text-sm text-[var(--primary-color)]'>
                Все
              </button>
            </div>
            <div className='overflow-x-auto scrollbar-hide px-4' style={{ marginRight: '-4px' }}>
              <div className='flex gap-3' style={{ width: 'max-content' }}>
                {funds.map((fund) => (
                  <div
                    key={fund.id}
                    onClick={() => navigate(`/fund/${encodeURIComponent(fund.name)}`)}
                    className='bg-white rounded-xl flex flex-col cursor-pointer flex-shrink-0'
                    style={{ width: '95px' }}
                  >
                    <div className='mx-[5px] mt-[5px] h-[58px] rounded-lg overflow-hidden flex items-center justify-center'>
                      <img src={fund.logo_url} alt={fund.name} className='max-w-full max-h-full object-contain' />
                    </div>
                    <div className='p-2 flex-1 flex flex-col'>
                      <p className='text-[11px] font-medium text-black leading-tight' style={{ minHeight: '28px', display: 'flex', alignItems: 'center' }}>
                        {fund.name}
                      </p>
                      <p className='text-[10px] text-[var(--text-secondary)] mt-1'>
                        {fundCounts[fund.name] || 0} подопечных
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiaries */}
      <div className='px-3' ref={beneficiariesRef}>
        <h2 className='text-lg font-semibold text-[var(--text-primary)] mb-4 px-1'>Подопечные</h2>
        {loading ? (
          <div className='text-center py-8'>
            <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin mx-auto mb-2" />
            <p className='text-[var(--text-secondary)]'>Загрузка...</p>
          </div>
        ) : (
          <>
            <div style={{ columns: 2, columnGap: '12px' }}>
              {displayBeneficiaries.map((item) => {
                const percent = item.target_amount > 0 ? Math.round(((item.raised_amount || 0) / item.target_amount) * 100) : 0;
                return (
                  <div
                    key={item.id}
                    className='rounded-xl cursor-pointer mb-3'
                    style={{ breakInside: 'avoid' }}
                    onClick={() => setSelectedCharity(formatBeneficiary(item))}
                  >
                    <div
                      className='w-full rounded-xl overflow-hidden relative'
                      style={{ boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className='w-full h-auto object-cover rounded-xl'
                        style={{ minHeight: '100px' }}
                      />
                      <div
                        className='absolute inset-0 pointer-events-none rounded-xl'
                        style={{ boxShadow: 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
                      />
                    </div>
                    <div className='px-1 pt-2'>
                      <p className='text-[13px] font-semibold text-black leading-tight mb-2 line-clamp-2'>
                        {item.title}
                      </p>
                      <div className='w-full h-[6px] bg-[#E8E8E8] rounded-full mb-1'>
                        <div
                          className='h-full bg-[var(--primary-color)] rounded-full'
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <p className='text-[10px] text-[var(--text-secondary)] mb-2'>
                        {formatSum(item.raised_amount || 0)} ₸ из {formatSum(item.target_amount || 0)} ₸
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCharity(formatBeneficiary(item));
                        }}
                        className='w-full py-[6px] bg-[var(--primary-color)] text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform'
                      >
                        Помочь
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredBeneficiaries.length > 10 && (
              <button
                onClick={() => navigate('/feed')}
                className='w-full mt-4 py-3 bg-gray-100 text-[var(--text-primary)] font-medium rounded-xl active:scale-[0.98] transition-transform'
              >
                Показать всех подопечных
              </button>
            )}
          </>
        )}
      </div>

      {/* Floating Download Buttons — only on web, not in native apps */}
      {!isNative && (
        <div
          className={`fixed bottom-16 left-3 right-3 z-40 transition-all duration-300 ${showDownloadSection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <p className='text-[13px] font-semibold text-[var(--text-primary)] text-center mb-2'>
            В приложении удобнее
          </p>
          <div className='flex gap-3 justify-center'>
            <a href='#' className='block flex-1'>
              <img src={`${SUPABASE_IMG}/Google%20.png`} alt='Google Play' className='h-[52px] w-full object-contain' />
            </a>
            <a href='#' className='block flex-1'>
              <img src={`${SUPABASE_IMG}/app%20store%20.png`} alt='App Store' className='h-[52px] w-full object-contain' />
            </a>
          </div>
        </div>
      )}

      {/* More Menu Modal */}
      {showMoreMenu && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50' onClick={() => setShowMoreMenu(false)}>
          <div className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-4 space-y-2' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Дополнительно</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <button
              onClick={() => {navigate('/profile/settings'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="settings" size={20} className="text-[var(--primary-color)]" />
              <span>Мой профиль</span>
            </button>

            <button
              onClick={() => {navigate('/about'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="info" size={20} className="text-[var(--primary-color)]" />
              <span>О фонде "Шанырак"</span>
            </button>

            <button
              onClick={() => {navigate('/partner-funds'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="users" size={20} className="text-[var(--primary-color)]" />
              <span>Фонды партнеры</span>
            </button>

            <button
              onClick={() => {navigate('/documents'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="file-text" size={20} className="text-[var(--primary-color)]" />
              <span>Документы</span>
            </button>

            <button
              onClick={() => {navigate('/contacts'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="phone" size={20} className="text-[var(--primary-color)]" />
              <span>Контакты</span>
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Charity Modal (shared for both views) */}
    {selectedCharity && (
      <CharityModal data={selectedCharity} onClose={() => setSelectedCharity(null)} />
    )}

    {/* Main page subscription modal */}
    {showMainSubModal && (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50' onClick={() => setShowMainSubModal(false)}>
        <div className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-5' onClick={e => e.stopPropagation()}>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-bold'>
              {mainSubStep === 'method' && 'Способ оплаты'}
              {mainSubStep === 'kaspi' && 'Оплата через Kaspi'}
              {mainSubStep === 'done' && 'Заявка отправлена'}
            </h3>
            <button onClick={() => setShowMainSubModal(false)} className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
              <Icon name="x" size={16} />
            </button>
          </div>

          <p className='text-sm text-[var(--text-secondary)] mb-1'>Ежемесячная помощь фонду «Шаңырақ»</p>
          <p className='text-xl font-bold text-[var(--text-primary)] mb-5'>{mainSubAmount.toLocaleString('ru-RU')} ₸ / мес</p>

          {mainSubStep === 'method' && (
            <div className='space-y-3'>
              <button
                onClick={() => setMainSubStep('kaspi')}
                className='w-full flex items-center space-x-4 p-4 rounded-2xl bg-[var(--bg-secondary)] active:bg-gray-100 transition-colors'
              >
                <div className='w-12 h-12 bg-[#FF0000] rounded-xl flex items-center justify-center flex-shrink-0'>
                  <span className='text-white font-bold text-lg'>K</span>
                </div>
                <div className='text-left flex-1'>
                  <p className='font-semibold'>Kaspi</p>
                  <p className='text-xs text-[var(--text-secondary)]'>Оплата через Kaspi</p>
                </div>
                <Icon name="chevron-right" size={20} className="text-[var(--text-secondary)]" />
              </button>
              <button disabled className='w-full flex items-center space-x-4 p-4 rounded-2xl bg-[var(--bg-secondary)] opacity-50'>
                <div className='w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Icon name="credit-card" size={22} className="text-gray-500" />
                </div>
                <div className='text-left flex-1'>
                  <p className='font-semibold text-[var(--text-secondary)]'>Банковская карта</p>
                  <p className='text-xs text-[var(--text-secondary)]'>Скоро</p>
                </div>
              </button>
            </div>
          )}

          {mainSubStep === 'kaspi' && (
            <div>
              <label className='block text-sm font-medium mb-2'>Номер телефона</label>
              <input
                type='tel'
                inputMode='numeric'
                placeholder='+7 ___ ___ __ __'
                value={mainSubPhone}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 11) val = val.slice(0, 11);
                  if (val && !val.startsWith('7')) val = '7' + val;
                  setMainSubPhone(val);
                }}
                className='w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[16px] mb-4'
              />
              <button
                onClick={async () => {
                  if (mainSubPhone.length !== 11) { toast.error('Введите номер телефона (11 цифр)'); return; }
                  const { error } = await supabase.from('fund_subscriptions').insert({
                    fund_name: 'Шаңырақ',
                    phone: mainSubPhone,
                    amount: mainSubAmount,
                    payment_method: 'kaspi',
                    visitor_id: localStorage.getItem('visitorId') || null,
                  });
                  if (error) { toast.error('Ошибка: ' + error.message); return; }
                  setMainSubStep('done');
                }}
                disabled={mainSubPhone.length !== 11}
                className='w-full py-3 bg-[var(--primary-color)] text-white font-bold rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform'
              >
                Отправить заявку
              </button>
            </div>
          )}

          {mainSubStep === 'done' && (
            <div className='text-center py-4'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Icon name="check" size={32} className="text-[var(--primary-color)]" />
              </div>
              <p className='text-[var(--text-primary)] font-semibold mb-2'>Заявка на подписку отправлена!</p>
              <p className='text-sm text-[var(--text-secondary)] mb-4'>Мы свяжемся с вами для подтверждения ежемесячного платежа.</p>
              <button onClick={() => setShowMainSubModal(false)} className='w-full py-3 bg-[var(--primary-color)] text-white font-bold rounded-xl text-sm'>
                Готово
              </button>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}

export default MainPage;
