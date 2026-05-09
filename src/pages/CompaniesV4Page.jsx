import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const IMG = 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images';
const G  = 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 60%, #5ec49a 100%)';
const GD = 'linear-gradient(150deg, #071e12 0%, #0f3324 45%, #1e6b4e 100%)';
const GL = 'linear-gradient(135deg, #edfaf4 0%, #d8f3e6 100%)';

const MENU = [
  { label: 'Подопечные', path: '/feed' },
  { label: 'Фонды-партнёры', path: '/partner-funds' },
  { label: 'Документы', path: '/documents' },
  { label: 'Контакты', path: '/contacts' },
  { label: 'Компаниям', path: '/companies-v4', highlight: true },
];

const Ic = ({ n, s = 24, c = 'currentColor' }) => {
  const d = {
    wallet:   <><rect x="2" y="7" width="20" height="14" rx="2.5" stroke={c} strokeWidth="1.7" fill="none"/><path d="M2 11h20" stroke={c} strokeWidth="1.7"/><circle cx="16.5" cy="15" r="1.5" fill={c}/><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke={c} strokeWidth="1.7" fill="none"/></>,
    phone:    <><rect x="5" y="2" width="14" height="20" rx="3" stroke={c} strokeWidth="1.7" fill="none"/><path d="M9 18h6" stroke={c} strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="6" r="1" fill={c}/></>,
    heart:    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/>,
    users:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={c} strokeWidth="1.7" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none"/></>,
    report:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={c} strokeWidth="1.7" fill="none"/><polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="1.7" fill="none"/><line x1="8" y1="13" x2="16" y2="13" stroke={c} strokeWidth="1.7" strokeLinecap="round"/><polyline points="8 17 10 16 12 18 14 16 16 17" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    choice:   <><circle cx="5" cy="12" r="2.5" stroke={c} strokeWidth="1.7" fill="none"/><circle cx="19" cy="5" r="2.5" stroke={c} strokeWidth="1.7" fill="none"/><circle cx="19" cy="19" r="2.5" stroke={c} strokeWidth="1.7" fill="none"/><path d="M7.5 12h3l3-4.5M13.5 12l3 4.5" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none"/></>,
    star:     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/>,
    gamepad:  <><rect x="2" y="7" width="20" height="10" rx="5" stroke={c} strokeWidth="1.7" fill="none"/><path d="M7 12h4M9 10v4" stroke={c} strokeWidth="1.7" strokeLinecap="round"/><circle cx="15.5" cy="11.5" r="1" fill={c}/><circle cx="17.5" cy="13.5" r="1" fill={c}/></>,
    leaf:     <path d="M17 8C8 10 5.9 16.17 3.82 19.67L2 21l2.06-.86C6 18.93 8.5 18 12 18c4 0 7-2 9-8 1-3 .5-7-1-9C18 3 14 5 10 7c-4 2-7 7-7 7" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round"/>,
    eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth="1.7" fill="none"/><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.7" fill="none"/></>,
    award:    <><circle cx="12" cy="8" r="6" stroke={c} strokeWidth="1.7" fill="none"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/></>,
    layers:   <><polygon points="12 2 2 7 12 12 22 7 12 2" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/><polyline points="2 17 12 22 22 17" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round"/><polyline points="2 12 12 17 22 12" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round"/></>,
    shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/><polyline points="9 12 11 14 15 10" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none"/></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
    building: <><rect x="3" y="4" width="13" height="18" rx="1" stroke={c} strokeWidth="1.7" fill="none"/><rect x="16" y="9" width="6" height="13" rx="1" stroke={c} strokeWidth="1.7" fill="none"/><path d="M7 8h5M7 12h5M7 16h5" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></>,
    doublearr:<><path d="M13 5l7 7-7 7" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M4 5l7 7-7 7" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    check:    <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    zap:      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/>,
    coins:    <><circle cx="8" cy="10" r="5.5" stroke={c} strokeWidth="1.7" fill="none"/><path d="M14.5 4.5A5.5 5.5 0 0 1 16 15.5" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round"/><path d="M17.5 7A5.5 5.5 0 0 1 19 18" stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round"/></>,
    arrowr:   <><line x1="5" y1="12" x2="19" y2="12" stroke={c} strokeWidth="1.7" strokeLinecap="round"/><polyline points="12 5 19 12 12 19" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    checkcircle:<><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.7" fill="none"/><polyline points="9 12 11 14 15 10" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none"/></>,
    magnify:  <><circle cx="11" cy="11" r="8" stroke={c} strokeWidth="1.7" fill="none"/><path d="M21 21l-4.35-4.35" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></>,
    doc:      <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={c} strokeWidth="1.7" fill="none"/><polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="1.7" fill="none"/></>,
    chevl:    <polyline points="15 18 9 12 15 6" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    chevr:    <polyline points="9 18 15 12 9 6" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    applico:  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill={c}/>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none">{d[n]}</svg>;
};

function ContactForm() {
  const [form, setForm] = useState({ company: '', name: '', phone: '' });
  const [sent, setSent] = useState(false);
  if (sent) return (
    <div className='text-center py-14'>
      <div className='w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center' style={{ background: G }}>
        <Ic n='check' s={28} c='white' />
      </div>
      <h3 className='text-xl font-bold text-gray-900 mb-2'>Заявка отправлена!</h3>
      <p className='text-gray-500 text-sm'>Свяжемся с вами в течение 24 часов.</p>
    </div>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className='space-y-3.5'>
      <input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
        placeholder='Название компании'
        className='w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition' />
      <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
        placeholder='Ваше имя'
        className='w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition' />
      <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
        placeholder='Телефон: +7 700 000 00 00'
        className='w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition' />
      <button type='submit'
        className='w-full py-4 rounded-2xl text-[#0f3324] font-bold text-sm hover:opacity-90 transition-all mt-2'
        style={{ background: 'linear-gradient(135deg, #7EF1D0, #5ec49a)', boxShadow: '0 8px 24px rgba(126,241,208,0.3)' }}>
        Начать инвестировать в ценности →
      </button>
      <p className='text-xs text-white/30 text-center pt-1'>Без обязательств. Ответим за 24 часа.</p>
    </form>
  );
}

export default function CompaniesV4Page() {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);

  const CAROUSEL = [
    {
      icon: 'users', title: 'HR и вовлечённость', sub: 'Employee Engagement',
      accent: '#1e6b4e',
      items: [
        { icon: 'choice', title: 'Свобода выбора', desc: 'Сотрудник сам решает, кому помочь. Это в 4 раза ценнее, чем если компания просто переведёт деньги в один фонд «сверху».' },
        { icon: 'star', title: 'Удержание талантов', desc: 'Современным специалистам (Gen Z и Миллениалы) важно работать в компании со смыслом.' },
        { icon: 'gamepad', title: 'Геймификация', desc: 'Начисление бонусов в приложении превращает добрые дела в увлекательный и позитивный опыт.' },
      ],
    },
    {
      icon: 'leaf', title: 'ESG и устойчивое развитие', sub: 'Sustainability',
      accent: '#0f3324',
      items: [
        { icon: 'report', title: 'Готовая отчётность', desc: 'Вы получаете автоматические данные по вкладу в ЦУР ООН (Цели устойчивого развития).' },
        { icon: 'eye', title: 'Прозрачность', desc: 'Работайте только с верифицированными фондами. Все переводы официальны и отслеживаемы.' },
        { icon: 'award', title: 'Репутация', desc: 'Позиционируйте себя как лидер в сфере социальной ответственности на рынке Казахстана.' },
      ],
    },
    {
      icon: 'coins', title: 'Налоговая и финансовая оптимизация', sub: 'Financial',
      accent: '#257a58',
      items: [
        { icon: 'layers', title: 'Единое окно', desc: 'Один договор с платформой вместо десятков контрактов с разными фондами.' },
        { icon: 'shield', title: 'Чистота операций', desc: 'Все отчёты о целевом использовании средств доступны в вашем личном кабинете.' },
      ],
    },
  ];

  const scrollCarousel = (idx) => {
    setActiveCard(idx);
    if (carouselRef.current) {
      const card = carouselRef.current.children[idx];
      if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  const STEPS = [
    { num: '01', icon: 'wallet', title: 'Личный баланс', desc: 'Компания начисляет сотруднику «Благотворительные бонусы» — например, 2 000 ₸ ежемесячно.' },
    { num: '02', icon: 'phone',  title: 'Удобное приложение', desc: 'Сотрудник авторизуется через Google / Apple и сразу видит свой баланс.' },
    { num: '03', icon: 'heart',  title: 'Личный вклад', desc: 'В ленте проверенных фондов он выбирает тот, который ему откликается согласно ESG.' },
    { num: '04', icon: 'users',  title: 'Сопричастность', desc: 'Человек чувствует, что он — часть чего-то большего, и это заслуга его работодателя.' },
    { num: '05', icon: 'report', title: 'Отчёт компании', desc: 'Компания получает отчёт о целевых расходах в фонды для PR, ESG и социальной отчётности.' },
  ];

  const COMPANY_GETS = [
    { icon: 'trending', title: 'ESG-отчётность без усилий', desc: 'Ежеквартальный отчёт: сколько собрано, кому помогли, какой импакт. Готовые данные для GR и инвесторов.' },
    { icon: 'star', title: 'HR-бренд и привлечение', desc: 'Специалисты выбирают компании с ценностями. Участие в благотворительности — конкретный аргумент при найме.' },
    { icon: 'zap', title: 'Вовлечённость команды', desc: 'Сотрудники сами выбирают подопечного, следят за сбором, видят результат. Живая инициатива, а не галочка.' },
    { icon: 'shield', title: 'Полная прозрачность', desc: 'Деньги идут напрямую в зарегистрированные фонды. Каждый перевод отображается в личном кабинете.' },
    { icon: 'layers', title: 'Готовая инфраструктура', desc: 'Мобильное приложение, веб-платформа, отчёты — всё уже работает. Никакой разработки на вашей стороне.' },
    { icon: 'phone', title: 'Приложение для каждого', desc: 'Сотрудник видит подопечных, историю помощи и прогресс сборов прямо в телефоне. iOS и Android.' },
  ];

  return (
    <div className='bg-white min-h-screen overflow-x-hidden' style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif', color: '#1a2e25' }}>

      {/* ── HEADER ── */}
      <header className='sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/60'>
        <div className='max-w-7xl mx-auto px-8 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
            <img src={`${IMG}/14.png`} alt='Шаңырақ' className='w-8 h-8 object-contain' />
            <span className='font-bold text-gray-900'>Шаңырақ</span>
          </div>
          <nav className='hidden md:flex items-center gap-7'>
            {MENU.map(m => (
              <button key={m.label} onClick={() => navigate(m.path)}
                className={`text-sm font-medium transition-colors ${m.highlight ? 'text-[#2f8f6a] font-semibold' : 'text-gray-400 hover:text-gray-700'}`}>
                {m.label}
              </button>
            ))}
          </nav>
          <a href='#contact'
            className='text-sm font-semibold px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-opacity shadow-md'
            style={{ background: G, boxShadow: '0 4px 16px rgba(47,143,106,0.35)' }}>
            Оставить заявку
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className='relative overflow-hidden pt-28 pb-36' style={{ background: GD }}>
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-15'
            style={{ background: 'radial-gradient(circle, #5ec49a, transparent)', transform: 'translate(25%,-35%)' }} />
          <div className='absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10'
            style={{ background: 'radial-gradient(circle, #7EF1D0, transparent)', transform: 'translate(-35%,35%)' }} />
          <div className='absolute inset-0' style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className='max-w-7xl mx-auto px-8 relative z-10'>
          <div className='max-w-3xl'>
            <div className='flex gap-2.5 mb-8'>
              {['ESG', 'HR-бренд', 'PR'].map(tag => (
                <span key={tag} className='text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/15 text-white/60 bg-white/8 backdrop-blur-sm tracking-wider' style={{ background: 'rgba(255,255,255,0.07)' }}>
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className='text-[64px] font-extrabold text-white leading-[1.02] tracking-tight mb-6'>
              Превратите социальную<br />ответственность в{' '}
              <span style={{ background: 'linear-gradient(135deg, #7EF1D0 0%, #5ec49a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                реальный импакт
              </span>
            </h1>
            <p className='text-xl text-white/55 leading-relaxed mb-12 max-w-2xl'>
              Шаңырақ — CSR платформа для вовлечения сотрудников в социальную ответственность вашей компании
            </p>
            <div className='flex items-center gap-5'>
              <a href='#contact'
                className='inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-base text-[#071e12] hover:opacity-90 transition-all'
                style={{ background: 'linear-gradient(135deg, #7EF1D0, #5ec49a)', boxShadow: '0 12px 36px rgba(126,241,208,0.35)' }}>
                Подключить компанию
                <Ic n='arrowr' s={18} c='#071e12' />
              </a>
              <a href='#how' className='text-white/40 text-sm hover:text-white/70 transition-colors'>
                Как это работает ↓
              </a>
            </div>
          </div>
          <div className='mt-16 grid grid-cols-3 gap-4 max-w-xl'>
            {[{ v: '×2', l: 'матчинг компании' }, { v: '10+', l: 'фондов-партнёров' }, { v: '100%', l: 'прозрачность' }].map(m => (
              <div key={m.l} className='rounded-2xl px-5 py-4 text-center border border-white/10' style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className='text-2xl font-extrabold mb-0.5' style={{ background: 'linear-gradient(135deg, #7EF1D0, #5ec49a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{m.v}</div>
                <div className='text-xs text-white/45'>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── КАК РАБОТАЕТ ── */}
      <section id='how' className='py-24' style={{ background: '#fafdfb' }}>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-16'>
            <p className='text-xs font-bold text-[#2f8f6a] uppercase tracking-widest mb-3'>Процесс</p>
            <h2 className='text-4xl font-extrabold text-[#0f1f17] tracking-tight mb-4'>Как работает</h2>
            <p className='text-[#4a6358] text-lg max-w-xl mx-auto'>От начисления бонусов до ESG-отчёта — пять шагов</p>
          </div>
          <div className='relative'>
            <div className='hidden lg:block absolute top-12 left-0 right-0 h-px mx-32' style={{ background: 'linear-gradient(90deg, transparent, #c8f0e0 20%, #c8f0e0 80%, transparent)' }} />
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4'>
              {STEPS.map((step, i) => (
                <div key={step.num} className='relative flex flex-col items-center text-center'>
                  <div className='relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center mb-5 shadow-lg'
                    style={{ background: i === 4 ? G : i === 0 ? 'linear-gradient(135deg, #0f3324, #1e6b4e)' : 'white', border: i === 4 || i === 0 ? 'none' : '1.5px solid #d4f0e4' }}>
                    <Ic n={step.icon} s={30} c={i === 0 || i === 4 ? 'white' : '#2f8f6a'} />
                  </div>
                  <div className='text-xs font-black text-[#c8f0e0] mb-1 tracking-widest'>{step.num}</div>
                  <h3 className='font-bold text-[#0f1f17] mb-2 text-sm leading-tight px-2'>{step.title}</h3>
                  <p className='text-xs text-[#6b8c7a] leading-relaxed px-1'>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── КАРУСЕЛЬ ── */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-14'>
            <p className='text-xs font-bold text-[#2f8f6a] uppercase tracking-widest mb-3'>Ценность</p>
            <h2 className='text-4xl font-extrabold text-[#0f1f17] tracking-tight mb-4'>Три направления импакта</h2>
            <p className='text-[#4a6358] text-lg'>Измеримые результаты по каждому направлению</p>
          </div>
          <div ref={carouselRef}
            className='flex gap-5 overflow-x-auto pb-4'
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={e => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / (el.scrollWidth / CAROUSEL.length));
              setActiveCard(idx);
            }}>
            {CAROUSEL.map((card, ci) => (
              <div key={ci} className='flex-shrink-0 rounded-3xl overflow-hidden'
                style={{ width: 'calc(33.33% - 14px)', minWidth: '340px', scrollSnapAlign: 'start', background: GD }}>
                <div className='p-8'>
                  <div className='flex items-center gap-4 mb-8'>
                    <div className='w-12 h-12 rounded-2xl flex items-center justify-center' style={{ background: 'rgba(126,241,208,0.15)' }}>
                      <Ic n={card.icon} s={22} c='#7EF1D0' />
                    </div>
                    <div>
                      <div className='text-white font-bold text-base leading-tight'>{card.title}</div>
                      <div className='text-white/40 text-xs mt-0.5'>{card.sub}</div>
                    </div>
                  </div>
                  <div className='space-y-5'>
                    {card.items.map((item, ii) => (
                      <div key={ii} className='flex gap-3.5'>
                        <div className='w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5' style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <Ic n={item.icon} s={16} c='#7EF1D0' />
                        </div>
                        <div>
                          <div className='text-white text-sm font-semibold mb-1'>{item.title}</div>
                          <div className='text-white/45 text-xs leading-relaxed'>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='flex items-center justify-center gap-2.5 mt-6'>
            {CAROUSEL.map((_, i) => (
              <button key={i} onClick={() => scrollCarousel(i)}
                className='rounded-full transition-all'
                style={{ width: activeCard === i ? 24 : 8, height: 8, background: activeCard === i ? '#2f8f6a' : '#d4f0e4' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ТОЛЬКО ПРОВЕРЕННЫЕ ФОНДЫ ── */}
      <section className='py-24' style={{ background: '#fafdfb' }}>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='grid grid-cols-2 gap-20 items-center'>
            <div>
              <p className='text-xs font-bold text-[#2f8f6a] uppercase tracking-widest mb-3'>Безопасность</p>
              <h2 className='text-4xl font-extrabold text-[#0f1f17] tracking-tight mb-5'>
                Только проверенные фонды
              </h2>
              <p className='text-[#4a6358] text-lg leading-relaxed mb-9'>
                Шаңырақ работает исключительно с официально зарегистрированными благотворительными фондами Казахстана. Каждый фонд проходит верификацию перед появлением на платформе.
              </p>
              <div className='space-y-5'>
                {[
                  { icon: 'doc', title: 'Официальная регистрация', desc: 'Все фонды зарегистрированы как юридические лица в РК' },
                  { icon: 'magnify', title: 'Проверка документов', desc: 'Устав, свидетельство о регистрации, реквизиты — в открытом доступе' },
                  { icon: 'trending', title: 'Публичная отчётность', desc: 'Фонды публикуют отчёты об использовании средств' },
                ].map(item => (
                  <div key={item.title} className='flex items-start gap-4'>
                    <div className='w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0' style={{ background: 'linear-gradient(135deg, #e4f7ee, #c8f0e0)' }}>
                      <Ic n={item.icon} s={18} c='#1e6b4e' />
                    </div>
                    <div>
                      <p className='font-semibold text-[#0f1f17] text-sm mb-0.5'>{item.title}</p>
                      <p className='text-sm text-[#6b8c7a]'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              {[
                { label: 'Дети и сироты', icon: 'heart' },
                { label: 'Онкология', icon: 'shield' },
                { label: 'Пожилые люди', icon: 'users' },
                { label: 'Люди с инвалидностью', icon: 'checkcircle' },
                { label: 'Многодетные семьи', icon: 'users' },
                { label: 'Реабилитация', icon: 'zap' },
              ].map(cat => (
                <div key={cat.label}
                  className='bg-white rounded-2xl p-5 border border-[#e4f0ea] flex items-center gap-3 hover:border-[#a8e6cc] hover:shadow-md transition-all group'>
                  <div className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: 'linear-gradient(135deg, #e4f7ee, #c8f0e0)' }}>
                    <Ic n={cat.icon} s={17} c='#1e6b4e' />
                  </div>
                  <span className='text-sm font-medium text-[#1a2e25] group-hover:text-[#1e6b4e] transition-colors'>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ФОРМАТЫ РАБОТЫ ── */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-14'>
            <p className='text-xs font-bold text-[#2f8f6a] uppercase tracking-widest mb-3'>Модели</p>
            <h2 className='text-4xl font-extrabold text-[#0f1f17] tracking-tight mb-4'>Форматы работы</h2>
            <p className='text-[#4a6358] text-lg'>Выберите подходящий — или совместите оба</p>
          </div>
          <div className='grid grid-cols-2 gap-6'>
            <div className='rounded-3xl p-10 relative overflow-hidden' style={{ background: GD }}>
              <div className='absolute top-0 right-0 w-64 h-64 rounded-full opacity-10' style={{ background: 'radial-gradient(circle, #7EF1D0, transparent)', transform: 'translate(30%,-30%)' }} />
              <div className='relative z-10'>
                <div className='w-14 h-14 rounded-2xl flex items-center justify-center mb-7' style={{ background: 'rgba(126,241,208,0.15)' }}>
                  <Ic n='building' s={26} c='#7EF1D0' />
                </div>
                <h3 className='text-2xl font-bold text-white mb-3'>Корпоративный бюджет</h3>
                <p className='text-white/55 text-sm leading-relaxed mb-7'>
                  Компания начисляет сотрудникам «Благотворительные бонусы». Сотрудники выбирают, куда направить средства, прямо в приложении. Вы получаете полный отчёт о реализованных средствах в благотворительные фонды.
                </p>
                <div className='space-y-2.5'>
                  {['Быстрый старт — решение за 1–2 недели', 'Сотрудники сами выбирают направление', 'Автоматический отчёт о целевых расходах'].map(t => (
                    <div key={t} className='flex items-center gap-2.5 text-sm text-white/65'>
                      <div className='w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0' style={{ background: 'rgba(126,241,208,0.2)' }}>
                        <Ic n='checkcircle' s={12} c='#7EF1D0' />
                      </div>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='rounded-3xl p-10 border border-[#d4f0e4] relative overflow-hidden' style={{ background: GL }}>
              <div className='absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-30' style={{ background: 'radial-gradient(circle, #c8f0e0, transparent)', transform: 'translate(20%,20%)' }} />
              <div className='relative z-10'>
                <div className='w-14 h-14 rounded-2xl flex items-center justify-center mb-7' style={{ background: 'white' }}>
                  <Ic n='doublearr' s={26} c='#1e6b4e' />
                </div>
                <h3 className='text-2xl font-bold text-[#0f1f17] mb-3'>Матчинг от компании</h3>
                <p className='text-[#4a6358] text-sm leading-relaxed mb-7'>
                  Компания увеличивает добровольный вклад каждого сотрудника — например, в 2 раза. Сотрудник помог на 1 000 ₸ — компания добавляет ещё 1 000 ₸. Итого фонд получает 2 000 ₸.
                </p>
                <div className='bg-white rounded-2xl p-5 border border-[#c8f0e0] mb-4'>
                  <div className='flex items-center justify-between text-sm mb-3'>
                    <span className='text-[#4a6358]'>Сотрудник вносит</span>
                    <span className='font-bold text-[#0f1f17]'>1 000 ₸</span>
                  </div>
                  <div className='flex items-center justify-between text-sm mb-3'>
                    <span className='text-[#4a6358]'>Компания добавляет</span>
                    <span className='font-bold text-[#1e6b4e]'>+ 1 000 ₸</span>
                  </div>
                  <div className='h-px bg-[#d4f0e4] my-3' />
                  <div className='flex items-center justify-between text-sm'>
                    <span className='font-semibold text-[#0f1f17]'>Итого для фонда</span>
                    <span className='font-extrabold text-[#1e6b4e] text-base'>2 000 ₸</span>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-xs text-[#2f8f6a] font-semibold'>
                  <Ic n='zap' s={14} c='#2f8f6a' />
                  Skin in the game — сотрудник по-настоящему вовлечён
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ЧТО ПОЛУЧАЮТ СТОРОНЫ ── */}
      <section className='py-24' style={{ background: '#fafdfb' }}>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-14'>
            <p className='text-xs font-bold text-[#2f8f6a] uppercase tracking-widest mb-3'>Win-Win</p>
            <h2 className='text-4xl font-extrabold text-[#0f1f17] tracking-tight mb-4'>Что получают стороны</h2>
          </div>
          <div className='grid grid-cols-2 gap-6'>
            <div className='rounded-3xl p-9 bg-white border border-[#e4f0ea] shadow-sm'>
              <div className='flex items-center gap-3.5 mb-7'>
                <div className='w-12 h-12 rounded-2xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg, #e4f7ee, #c8f0e0)' }}>
                  <Ic n='building' s={22} c='#1e6b4e' />
                </div>
                <h3 className='text-lg font-bold text-[#0f1f17]'>Компания</h3>
              </div>
              <ul className='space-y-3.5'>
                {['Готовый инструмент CSR с автоматическим reporting', 'Квартальный отчёт: сколько собрано, кому помогли, какой импакт', 'HR-бенефит «work with purpose» для найма и удержания', 'Измеримый ESG-результат для GR и инвесторов', 'Потенциальный налоговый вычет по законодательству РК', 'Готовая платформа — никакой разработки на вашей стороне'].map(b => (
                  <li key={b} className='flex items-start gap-3 text-sm text-[#2e4a3c]'>
                    <div className='w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5' style={{ background: 'linear-gradient(135deg, #e4f7ee, #c8f0e0)' }}>
                      <svg width='10' height='10' viewBox='0 0 10 10' fill='none'><path d='M2 5l2 2 4-4' stroke='#1e6b4e' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className='rounded-3xl p-9 relative overflow-hidden' style={{ background: 'linear-gradient(150deg, #0f3324, #1e6b4e)' }}>
              <div className='absolute top-0 right-0 w-48 h-48 rounded-full opacity-10' style={{ background: 'radial-gradient(circle, #7EF1D0, transparent)', transform: 'translate(25%,-25%)' }} />
              <div className='relative z-10'>
                <div className='flex items-center gap-3.5 mb-7'>
                  <div className='w-12 h-12 rounded-2xl flex items-center justify-center' style={{ background: 'rgba(126,241,208,0.15)' }}>
                    <Ic n='users' s={22} c='#7EF1D0' />
                  </div>
                  <h3 className='text-lg font-bold text-white'>Сотрудники</h3>
                </div>
                <ul className='space-y-3.5'>
                  {['Автоматический бонус — не нужно помнить каждый месяц', 'Личная история помощи в мобильном приложении', 'Матчинг компании удваивает вклад', 'Выбор конкретного подопечного — не абстрактный фонд', 'Чувство «моя компания и я делаем что-то реальное»', 'Реферальная ссылка — привлекай друзей и отслеживай импакт'].map(b => (
                    <li key={b} className='flex items-start gap-3 text-sm text-white/70'>
                      <div className='w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5' style={{ background: 'rgba(126,241,208,0.2)' }}>
                        <svg width='10' height='10' viewBox='0 0 10 10' fill='none'><path d='M2 5l2 2 4-4' stroke='#7EF1D0' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ЧТО ДАЁТ КОМПАНИИ ── */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-16'>
            <p className='text-xs font-bold text-[#2f8f6a] uppercase tracking-widest mb-3'>Результаты</p>
            <h2 className='text-4xl font-extrabold text-[#0f1f17] tracking-tight mb-4'>Что это даёт компании</h2>
            <p className='text-[#4a6358] text-lg'>Измеримые результаты для HR, PR и руководства</p>
          </div>
          <div className='grid grid-cols-3 gap-5'>
            {COMPANY_GETS.map((item, i) => (
              <div key={item.title} className='rounded-2xl p-7 border border-[#e8f5ee] hover:border-[#a8e6cc] hover:shadow-lg transition-all group cursor-default'>
                <div className='w-12 h-12 rounded-2xl flex items-center justify-center mb-5'
                  style={{ background: i % 3 === 0 ? 'linear-gradient(135deg, #e4f7ee, #c8f0e0)' : i % 3 === 1 ? 'linear-gradient(135deg, #0f3324, #1e6b4e)' : 'linear-gradient(135deg, #e4f7ee, #c8f0e0)' }}>
                  <Ic n={item.icon} s={22} c={i % 3 === 1 ? '#7EF1D0' : '#1e6b4e'} />
                </div>
                <h3 className='font-bold text-[#0f1f17] mb-2.5 text-base group-hover:text-[#1e6b4e] transition-colors'>{item.title}</h3>
                <p className='text-sm text-[#6b8c7a] leading-relaxed'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ФОРМА ── */}
      <section id='contact' className='py-28 relative overflow-hidden' style={{ background: GD }}>
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-10' style={{ background: 'radial-gradient(circle, #7EF1D0, transparent)', transform: 'translate(-30%,-30%)' }} />
          <div className='absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-8' style={{ background: 'radial-gradient(circle, #5ec49a, transparent)', transform: 'translate(30%,30%)' }} />
        </div>
        <div className='max-w-7xl mx-auto px-8 relative z-10'>
          <div className='grid grid-cols-2 gap-20 items-start'>
            <div>
              <p className='text-xs font-bold uppercase tracking-widest mb-4' style={{ color: '#7EF1D0' }}>Начало</p>
              <h2 className='text-4xl font-extrabold text-white leading-tight mb-4'>
                Начните инвестировать в ценности
              </h2>
              <p className='text-white/50 text-lg leading-relaxed mb-10'>
                Помогите своим сотрудникам стать меценатами, а компании — лидером социального импакта.
              </p>
              <div className='space-y-5'>
                {[
                  { icon: 'zap', title: 'Старт за 2 недели', desc: 'Договор, доступ, первый запуск — без долгих согласований' },
                  { icon: 'report', title: 'Отчёт через 30 дней', desc: 'Покажем реальные цифры: сколько собрали и кому помогли' },
                  { icon: 'shield', title: '100% прозрачность', desc: 'Каждый тенге отслеживается и отображается в отчёте' },
                ].map(item => (
                  <div key={item.title} className='flex items-start gap-4'>
                    <div className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: 'rgba(126,241,208,0.15)' }}>
                      <Ic n={item.icon} s={18} c='#7EF1D0' />
                    </div>
                    <div>
                      <p className='font-semibold text-white text-sm mb-0.5'>{item.title}</p>
                      <p className='text-white/40 text-sm'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='rounded-3xl p-9 border border-white/10' style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
              <h3 className='font-bold text-white mb-2 text-lg'>Оставьте заявку</h3>
              <p className='text-white/35 text-sm mb-7'>Ответим в течение 24 часов</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className='bg-white border-t border-[#e8f5ee] pt-14 pb-8'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='grid grid-cols-5 gap-8 mb-12'>
            <div className='col-span-2'>
              <div className='flex items-center gap-2.5 mb-4 cursor-pointer' onClick={() => navigate('/')}>
                <img src={`${IMG}/14.png`} alt='' className='w-8 h-8 object-contain' />
                <span className='font-bold text-[#0f1f17]'>Шаңырақ</span>
              </div>
              <p className='text-sm text-[#6b8c7a] leading-relaxed mb-5'>Платформа корпоративной благотворительности Казахстана</p>
              <div className='flex gap-3'>
                <a href='https://apps.apple.com/kz/app/%D1%88%D0%B0%D0%BD%D1%8B%D1%80%D0%B0%D0%BA/id6766084376'
                  target='_blank' rel='noopener noreferrer'
                  className='flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#d4f0e4] hover:border-[#a8e6cc] hover:bg-[#f5fbf7] transition-all'>
                  <Ic n='applico' s={16} c='#1a2e25' />
                  <span className='text-xs font-semibold text-[#1a2e25]'>App Store</span>
                </a>
                <a href='https://play.google.com/store/apps/details?id=world.shanyrak.app'
                  target='_blank' rel='noopener noreferrer'
                  className='flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#d4f0e4] hover:border-[#a8e6cc] hover:bg-[#f5fbf7] transition-all'>
                  <svg width='16' height='16' viewBox='0 0 24 24'><path d='M3.18 23.82a1.5 1.5 0 0 0 .82.18 2 2 0 0 0 1-.28l13-7.5-2.82-2.82z' fill='#EA4335'/><path d='M20.82 9.72A2 2 0 0 0 22 11.5a2 2 0 0 0-1.18 1.78l-2.64 1.52L15.36 12l2.82-2.82z' fill='#FBBC05'/><path d='M3 .28A2 2 0 0 0 2 2v20a2 2 0 0 0 1 1.72L15.36 12z' fill='#4285F4'/><path d='M18.18 10.5l-2.82-2.82L4 .46A2 2 0 0 0 3 .28L15.36 12z' fill='#34A853'/></svg>
                  <span className='text-xs font-semibold text-[#1a2e25]'>Google Play</span>
                </a>
              </div>
            </div>
            <div>
              <p className='text-xs font-bold text-[#a8c4b8] uppercase tracking-wider mb-5'>Платформа</p>
              <div className='space-y-3'>
                {[{ l: 'Подопечные', p: '/feed' }, { l: 'Фонды-партнёры', p: '/partner-funds' }, { l: 'Документы', p: '/documents' }].map(l => (
                  <button key={l.l} onClick={() => navigate(l.p)} className='block text-sm text-[#6b8c7a] hover:text-[#1e6b4e] transition-colors text-left'>{l.l}</button>
                ))}
              </div>
            </div>
            <div>
              <p className='text-xs font-bold text-[#a8c4b8] uppercase tracking-wider mb-5'>Компания</p>
              <div className='space-y-3'>
                {[{ l: 'Компаниям', p: '/companies-v4' }, { l: 'Контакты', p: '/contacts' }, { l: 'О фонде', p: '/about' }].map(l => (
                  <button key={l.l} onClick={() => navigate(l.p)} className='block text-sm text-[#6b8c7a] hover:text-[#1e6b4e] transition-colors text-left'>{l.l}</button>
                ))}
              </div>
            </div>
            <div>
              <p className='text-xs font-bold text-[#a8c4b8] uppercase tracking-wider mb-5'>Документы</p>
              <div className='space-y-3'>
                {[{ l: 'Политика конфиденциальности', p: '/policy' }, { l: 'Оферта', p: '/oferta' }].map(l => (
                  <button key={l.l} onClick={() => navigate(l.p)} className='block text-sm text-[#6b8c7a] hover:text-[#1e6b4e] transition-colors text-left'>{l.l}</button>
                ))}
              </div>
            </div>
          </div>
          <div className='border-t border-[#e8f5ee] pt-6 flex items-center justify-between'>
            <p className='text-xs text-[#a8c4b8]'>© 2025 Шаңырақ. Все права защищены.</p>
            <div className='flex items-center gap-2'>
              <div className='w-5 h-5 rounded-full flex items-center justify-center' style={{ background: G }}>
                <Ic n='leaf' s={11} c='white' />
              </div>
              <span className='text-xs text-[#a8c4b8]'>Социальная ответственность в действии</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
