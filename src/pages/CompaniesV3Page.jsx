import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SUPABASE_IMG = 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images';
const G = 'linear-gradient(135deg, #1e6b4e 0%, #2f8f6a 60%, #5ec49a 100%)';

const MENU_ITEMS = [
  { label: 'Подопечные', path: '/feed' },
  { label: 'Фонды-партнёры', path: '/partner-funds' },
  { label: 'Документы', path: '/documents' },
  { label: 'Контакты', path: '/contacts' },
  { label: 'Компаниям', path: '/companies-v3', highlight: true },
];

const PAIN_POINTS = [
  {
    icon: '📊',
    title: 'ESG-отчётность без реального импакта',
    desc: 'Красивые слайды про «социальную ответственность», но нет измеримых результатов и вовлечения сотрудников.',
  },
  {
    icon: '🧲',
    title: 'HR-бренд и удержание таланта',
    desc: 'IT-специалисты выбирают компании с ценностями. «Work with purpose» — один из топ-факторов retention.',
  },
  {
    icon: '😐',
    title: 'Низкая вовлечённость в CSR',
    desc: 'Корпоративная благотворительность воспринимается как галочка, а не как живая инициатива команды.',
  },
];

const WHY_PAYROLL = [
  { title: 'Личная причастность', text: 'Сотрудник вкладывает свои деньги — и реально вовлекается. Следит за подопечным, радуется сбору.', icon: '💡' },
  { title: 'Матчинг работает магически', text: '«Мои 2 000 ₸ превращаются в 4 000 ₸» — это сильнейший психологический мотив для участия.', icon: '✖️2' },
  { title: 'Привычка помогать', text: 'Уйдёт из компании — с высокой вероятностью продолжит донатить самостоятельно.', icon: '🔄' },
  { title: 'Чистая структура', text: 'Корпоративный донат — благотворительность компании. Личный — личный. Без серых зон.', icon: '✅' },
];

const BENEFITS_COMPANY = [
  'Готовый инструмент CSR с автоматическим reporting',
  'Квартальный отчёт: сколько собрано, кому помогли, какой импакт',
  'HR-бенефит «work with purpose» для найма и удержания',
  'Измеримый ESG-результат для GR и инвесторов',
  'Потенциальный налоговый вычет по законодательству РК',
  'Готовая платформа — никакой разработки на вашей стороне',
];

const BENEFITS_EMPLOYEE = [
  'Автоматический микро-донат — не нужно помнить каждый месяц',
  'Личная история помощи в мобильном приложении',
  'Матчинг компании удваивает ваш вклад',
  'Выбор конкретного подопечного — не абстрактный фонд',
  'Чувство «моя компания и я делаем что-то реальное»',
  'Реферальная ссылка — привлекай друзей и отслеживай импакт',
];

const TARGET_SEGMENTS = [
  { name: 'IT-компании', desc: 'Разработка, продукт, консалтинг', icon: '💻' },
  { name: 'Финтех и банки', desc: 'Kaspi, Halyk, Forte, Freedom', icon: '🏦' },
  { name: 'Телеком', desc: 'Beeline, Kcell, Tele2', icon: '📡' },
  { name: 'Astana Hub', desc: 'Резиденты с CSR-мандатом', icon: '🚀' },
  { name: 'Стартапы A–B', desc: 'Где CEO сам принимает решения', icon: '🌱' },
  { name: 'Ритейл и e-com', desc: 'Chocofamily и экосистемы', icon: '🛒' },
];

/* ── SVG иконки ── */
const Ico = ({ n, s = 22, c = 'currentColor' }) => {
  const icons = {
    wallet: <><rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.5" fill="none"/><path d="M16 14.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill={c}/><path d="M2 11h20" stroke={c} strokeWidth="1.5"/></>,
    phone:  <><rect x="5" y="2" width="14" height="20" rx="3" stroke={c} strokeWidth="1.5" fill="none"/><circle cx="12" cy="17" r="1" fill={c}/></>,
    heart:  <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={c} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></>,
    star:   <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={c} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></>,
    report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={c} strokeWidth="1.5" fill="none"/><polyline points="14 2 14 8 20 8" stroke={c} strokeWidth="1.5" fill="none"/><line x1="8" y1="13" x2="16" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="17" x2="12" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none">{icons[n]}</svg>;
};

function ContactForm() {
  const [form, setForm] = useState({ company: '', name: '', phone: '', format: 'payroll' });
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className='text-center py-12'>
        <div className='text-5xl mb-4'>🎉</div>
        <h3 className='text-xl font-bold text-gray-900 mb-2'>Заявка отправлена!</h3>
        <p className='text-gray-500'>Мы свяжемся с вами в течение 24 часов.</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Компания</label>
          <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder='Название компании'
            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2f8f6a]' />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Ваше имя</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder='Имя и фамилия'
            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2f8f6a]' />
        </div>
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Телефон или email</label>
        <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder='+7 700 000 00 00 или email@company.kz'
          className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2f8f6a]' />
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Интересный формат</label>
        <div className='grid grid-cols-2 gap-3'>
          {[
            { value: 'payroll', label: '💳 Отчисления с зарплаты + Матчинг' },
            { value: 'budget', label: '🎁 Корпоративный бюджет для сотрудников' },
            { value: 'both', label: '🔀 Оба формата' },
            { value: 'custom', label: '💬 Обсудить индивидуально' },
          ].map((opt) => (
            <label key={opt.value}
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm transition-colors ${
                form.format === opt.value ? 'border-[#2f8f6a] bg-[#e8f8f2] text-[#1e6b4e] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              <input type='radio' name='format' value={opt.value} checked={form.format === opt.value}
                onChange={() => setForm({ ...form, format: opt.value })} className='hidden' />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <button type='submit'
        className='w-full py-3.5 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity'
        style={{ background: G }}>
        Запустить пилот →
      </button>
      <p className='text-xs text-gray-400 text-center'>Ответим в течение 24 часов. Без обязательств.</p>
    </form>
  );
}

export default function CompaniesV3Page() {
  const navigate = useNavigate();

  const steps = [
    {
      num: '01', icon: 'wallet', bg: '#0f3d2a',
      title: 'Личный баланс',
      desc: 'Компания начисляет сотруднику «Благотворительные бонусы» — например, 2 000 ₸ ежемесячно.',
    },
    {
      num: '02', icon: 'phone', bg: '#1a5c3f',
      title: 'Удобное приложение',
      desc: 'Сотрудник авторизуется через Google / Apple и сразу видит свой баланс.',
    },
    {
      num: '03', icon: 'heart', bg: '#1e6b4e',
      title: 'Личный вклад',
      desc: 'В ленте проверенных фондов он выбирает тот, который ему откликается согласно ESG.',
    },
    {
      num: '04', icon: 'star', bg: '#257a58',
      title: 'Сопричастность',
      desc: 'Человек чувствует, что он — часть чего-то большего, и это заслуга его работодателя.',
    },
    {
      num: '05', icon: 'report', bg: '#2f8f6a',
      title: 'Отчёт компании',
      desc: 'Компания получает отчёт о целевых расходах в благотворительные фонды для PR, ESG и социальной отчётности.',
    },
  ];

  return (
    <div className='bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden'>

      {/* HEADER */}
      <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-8 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
            <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-9 h-9 object-contain' />
            <span className='font-bold text-lg text-gray-900'>Шаңырақ</span>
          </div>
          <nav className='flex items-center gap-8'>
            {MENU_ITEMS.map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors ${
                  item.highlight ? 'text-[#2f8f6a] border border-[#2f8f6a] rounded-full px-4 py-1.5 bg-[#e8f8f2]' : 'text-gray-500 hover:text-gray-900'
                }`}>
                {item.label}
              </button>
            ))}
          </nav>
          <a href='#contact' className='text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity'
            style={{ background: G }}>
            Запустить пилот
          </a>
        </div>
      </header>

      {/* HERO — изменён подзаголовок + хештеги */}
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 pointer-events-none'
          style={{ background: 'radial-gradient(ellipse at 70% 50%, #7EF1D0 0%, transparent 55%)', opacity: 0.35 }} />
        <div className='max-w-7xl mx-auto px-8 py-24 relative z-10'>
          <div className='max-w-3xl'>
            {/* Хештеги */}
            <div className='flex gap-2 mb-5'>
              {['ESG', 'HR-бренд', 'PR'].map((tag) => (
                <span key={tag} className='text-xs font-bold px-3 py-1.5 rounded-full border'
                  style={{ color: '#1e6b4e', borderColor: '#a8e6cc', background: '#f0faf6', letterSpacing: '0.02em' }}>
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className='text-5xl font-bold text-gray-900 leading-tight mb-6'>
              Превратите социальную<br />ответственность в{' '}
              <span style={{ background: G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                реальный импакт
              </span>
            </h1>

            {/* Изменённый подзаголовок */}
            <p className='text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl'>
              Шаңырақ — CSR платформа для вовлечения сотрудников в социальную ответственность вашей компании ESG
            </p>

            <div className='flex items-center gap-4'>
              <a href='#contact'
                className='text-white font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity text-base'
                style={{ background: G }}>
                Запустить пилот бесплатно →
              </a>
              <a href='#how' className='text-[#2f8f6a] font-medium text-sm hover:underline'>Как это работает ↓</a>
            </div>
          </div>
          <div className='absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4'>
            {[{ value: '×2', label: 'матчинг компании' }, { value: '30%', label: 'конверсия opt-in' }, { value: '80%', label: 'годовой retention' }].map((m) => (
              <div key={m.label} className='bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 text-center w-40'>
                <div className='text-2xl font-bold text-[#2f8f6a]'>{m.value}</div>
                <div className='text-xs text-gray-500 mt-0.5'>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* БОЛИ */}
      <section className='bg-gray-50 py-20'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Узнаёте себя?</h2>
            <p className='text-gray-500'>Типичные проблемы ESG/CSR в компаниях Казахстана</p>
          </div>
          <div className='grid grid-cols-3 gap-6'>
            {PAIN_POINTS.map((p) => (
              <div key={p.title} className='bg-white rounded-2xl p-7 border border-gray-100'>
                <div className='text-3xl mb-4'>{p.icon}</div>
                <h3 className='font-bold text-gray-900 mb-2'>{p.title}</h3>
                <p className='text-sm text-gray-500 leading-relaxed'>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* КАК РАБОТАЕТ — новый блок вместо "Трёхфазная воронка" */}
      <section id='how' className='max-w-7xl mx-auto px-8 py-20'>
        <div className='text-center mb-14'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Как работает</h2>
          <p className='text-gray-500 max-w-xl mx-auto'>От начисления бонусов до ESG-отчёта — пять простых шагов</p>
        </div>

        {/* Сетка 2 + 3 */}
        <div className='grid grid-cols-2 gap-4 mb-4'>
          {steps.slice(0, 2).map((step) => (
            <div key={step.num} className='rounded-3xl overflow-hidden flex min-h-[140px]'>
              <div className='w-20 flex flex-col items-center justify-start pt-7 pb-7 flex-shrink-0' style={{ background: step.bg }}>
                <span className='text-white/20 font-black text-2xl leading-none mb-3'>{step.num}</span>
                <div className='w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center'>
                  <Ico n={step.icon} s={17} c='white' />
                </div>
              </div>
              <div className='flex-1 bg-gray-50 border border-gray-100 rounded-r-3xl px-6 py-7 flex flex-col justify-center'>
                <h3 className='text-base font-bold text-gray-900 mb-1.5'>{step.title}</h3>
                <p className='text-sm text-gray-500 leading-relaxed'>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className='grid grid-cols-3 gap-4'>
          {steps.slice(2).map((step) => (
            <div key={step.num} className='rounded-3xl overflow-hidden'>
              <div className='px-6 pt-6 pb-5 flex items-center gap-3' style={{ background: step.bg }}>
                <div className='w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Ico n={step.icon} s={17} c='white' />
                </div>
                <div>
                  <span className='text-white/40 font-bold text-xs tracking-widest block'>{step.num}</span>
                  <h3 className='text-sm font-bold text-white leading-tight'>{step.title}</h3>
                </div>
              </div>
              <div className='bg-gray-50 border border-gray-100 border-t-0 rounded-b-3xl px-6 py-5'>
                <p className='text-sm text-gray-500 leading-relaxed'>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ПОЧЕМУ PAYROLL */}
      <section className='py-20' style={{ background: 'linear-gradient(135deg, #0f3d2a, #1e6b4e)' }}>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-white mb-4'>Почему это работает</h2>
            <p className='text-white/60 max-w-xl mx-auto'>Не просто раздать бюджет — а создать настоящих доноров внутри компании</p>
          </div>
          <div className='grid grid-cols-2 gap-6'>
            {WHY_PAYROLL.map((item) => (
              <div key={item.title} className='bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10'>
                <div className='text-2xl mb-3'>{item.icon}</div>
                <h3 className='font-bold text-white mb-2'>{item.title}</h3>
                <p className='text-sm text-white/65 leading-relaxed'>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className='max-w-7xl mx-auto px-8 py-20'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Что получают все стороны</h2>
        </div>
        <div className='grid grid-cols-2 gap-8'>
          <div className='rounded-3xl p-8 border border-gray-100 shadow-sm'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-[#e8f8f2] rounded-xl flex items-center justify-center text-lg'>🏢</div>
              <h3 className='text-lg font-bold text-gray-900'>Компании</h3>
            </div>
            <ul className='space-y-3'>
              {BENEFITS_COMPANY.map((b) => (
                <li key={b} className='flex items-start gap-3 text-sm text-gray-700'>
                  <span className='w-5 h-5 bg-[#e8f8f2] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <svg width='10' height='10' viewBox='0 0 10 10' fill='none'><path d='M2 5l2 2 4-4' stroke='#2f8f6a' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className='rounded-3xl p-8' style={{ background: 'linear-gradient(135deg, #e8f8f2, #c8f0e0)' }}>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg'>👤</div>
              <h3 className='text-lg font-bold text-gray-900'>Сотрудникам</h3>
            </div>
            <ul className='space-y-3'>
              {BENEFITS_EMPLOYEE.map((b) => (
                <li key={b} className='flex items-start gap-3 text-sm text-gray-700'>
                  <span className='w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <svg width='10' height='10' viewBox='0 0 10 10' fill='none'><path d='M2 5l2 2 4-4' stroke='#2f8f6a' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* СЕГМЕНТ */}
      <section className='bg-gray-50 py-20'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Кому подходит</h2>
            <p className='text-gray-500 max-w-lg mx-auto'>Фокус на IT-сегмент Алматы и Астаны</p>
          </div>
          <div className='grid grid-cols-3 gap-4'>
            {TARGET_SEGMENTS.map((seg) => (
              <div key={seg.name} className='bg-white rounded-2xl p-5 flex items-start gap-4 border border-gray-100'>
                <span className='text-2xl'>{seg.icon}</span>
                <div>
                  <div className='font-semibold text-gray-900'>{seg.name}</div>
                  <div className='text-sm text-gray-500 mt-0.5'>{seg.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ФОРМА */}
      <section id='contact' style={{ background: 'linear-gradient(135deg, #f0faf6, #e8f8f2)' }}>
        <div className='max-w-7xl mx-auto px-8 py-20'>
          <div className='grid grid-cols-2 gap-16 items-start'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Запустим пилот вместе</h2>
              <p className='text-gray-600 mb-8 leading-relaxed'>Расскажите о вашей компании — мы предложим оптимальный формат и запустим первый пилот без долгих согласований.</p>
              {[
                { icon: '📞', text: 'Ответим в течение 24 часов' },
                { icon: '🎯', text: 'Пилот бесплатно для первых компаний' },
                { icon: '📊', text: 'Готовый отчёт уже через 30 дней' },
              ].map((item) => (
                <div key={item.text} className='flex items-center gap-3 text-sm text-gray-700 mb-4'>
                  <span className='text-lg'>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
            <div className='bg-white rounded-3xl p-8 shadow-sm border border-gray-100'>
              <h3 className='font-bold text-gray-900 mb-6'>Оставьте заявку на пилот</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER — улучшенный с App Store + Google Play */}
      <footer className='border-t border-gray-100 bg-white pt-12 pb-8'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='grid grid-cols-4 gap-10 mb-10'>
            {/* Лого */}
            <div>
              <div className='flex items-center gap-2.5 mb-3 cursor-pointer' onClick={() => navigate('/')}>
                <img src={`${SUPABASE_IMG}/14.png`} alt='' className='w-8 h-8 object-contain' />
                <span className='font-bold text-gray-800'>Шаңырақ</span>
              </div>
              <p className='text-xs text-gray-400 leading-relaxed'>Платформа корпоративной благотворительности Казахстана</p>
            </div>

            {/* Платформа */}
            <div>
              <p className='text-xs font-bold text-gray-300 uppercase tracking-wider mb-4'>Платформа</p>
              <div className='space-y-2.5'>
                {[{ l: 'Подопечные', p: '/feed' }, { l: 'Фонды-партнёры', p: '/partner-funds' }, { l: 'Документы', p: '/documents' }].map((l) => (
                  <button key={l.l} onClick={() => navigate(l.p)} className='block text-sm text-gray-400 hover:text-gray-700 transition-colors text-left'>{l.l}</button>
                ))}
              </div>
            </div>

            {/* Компания */}
            <div>
              <p className='text-xs font-bold text-gray-300 uppercase tracking-wider mb-4'>Компания</p>
              <div className='space-y-2.5'>
                {[{ l: 'Компаниям', p: '/companies-v3' }, { l: 'Контакты', p: '/contacts' }].map((l) => (
                  <button key={l.l} onClick={() => navigate(l.p)} className='block text-sm text-gray-400 hover:text-gray-700 transition-colors text-left'>{l.l}</button>
                ))}
              </div>
            </div>

            {/* Приложения */}
            <div>
              <p className='text-xs font-bold text-gray-300 uppercase tracking-wider mb-4'>Приложение</p>
              <div className='space-y-2'>
                <a href='https://apps.apple.com/kz/app/%D1%88%D0%B0%D0%BD%D1%8B%D1%80%D0%B0%D0%BA/id6766084376'
                  target='_blank' rel='noopener noreferrer'
                  className='flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all w-full'>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#374151"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <span className='text-sm text-gray-500'>App Store</span>
                </a>
                <a href='https://play.google.com/store/apps/details?id=world.shanyrak.app'
                  target='_blank' rel='noopener noreferrer'
                  className='flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all w-full'>
                  <svg width="17" height="17" viewBox="0 0 24 24"><path d="M3.18 23.82a1.5 1.5 0 0 0 .82.18 2 2 0 0 0 1-.28l13-7.5-2.82-2.82z" fill="#EA4335"/><path d="M20.82 9.72A2 2 0 0 0 22 11.5a2 2 0 0 0-1.18 1.78l-2.64 1.52L15.36 12l2.82-2.82z" fill="#FBBC05"/><path d="M3 .28A2 2 0 0 0 2 2v20a2 2 0 0 0 1 1.72L15.36 12z" fill="#4285F4"/><path d="M18.18 10.5l-2.82-2.82L4 .46A2 2 0 0 0 3 .28L15.36 12z" fill="#34A853"/></svg>
                  <span className='text-sm text-gray-500'>Google Play</span>
                </a>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-100 pt-6 flex items-center justify-between'>
            <p className='text-xs text-gray-300'>© 2025 Шаңырақ. Все права защищены.</p>
            <div className='flex gap-5'>
              <button onClick={() => navigate('/policy')} className='text-xs text-gray-300 hover:text-gray-500 transition-colors'>Политика конфиденциальности</button>
              <button onClick={() => navigate('/oferta')} className='text-xs text-gray-300 hover:text-gray-500 transition-colors'>Оферта</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
