import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SUPABASE_IMG = 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images';

const MENU_ITEMS = [
  { label: 'Подопечные', path: '/feed' },
  { label: 'Фонды-партнёры', path: '/partner-funds' },
  { label: 'Документы', path: '/documents' },
  { label: 'Контакты', path: '/contacts' },
  { label: 'Компаниям', path: '/companies', highlight: true },
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

const PHASES = [
  {
    num: '01',
    title: 'Старт: Gift Budget',
    timeline: 'Неделя 1–2',
    color: '#e8f8f2',
    textColor: '#1e6b4e',
    desc: 'Компания выделяет charity-бюджет — например, 200 000 ₸ на 100 сотрудников по 2 000 ₸ каждому. Сотрудники заходят на платформу и выбирают кому помочь. Быстрый старт, понятный результат, нулевой цикл сделки.',
    badge: 'Легко продать',
    badgeColor: '#2f8f6a',
  },
  {
    num: '02',
    title: 'Конверсия: Payroll Giving',
    timeline: 'Неделя 3–6',
    color: 'linear-gradient(135deg, #1e6b4e, #2f8f6a)',
    textColor: 'white',
    desc: 'Вовлечённые сотрудники (обычно 20–30%) подключают автосписание с зарплаты. Компания матчит каждый рубль сотрудника — 2 000 ₸ превращаются в 4 000 ₸. Skin in the game формирует настоящую привычку донора.',
    badge: 'Ключевой этап',
    badgeColor: '#7EF1D0',
    badgeText: '#1e6b4e',
  },
  {
    num: '03',
    title: 'Рекуррент + Сезонный Буст',
    timeline: 'Ongoing',
    color: '#f0faf6',
    textColor: '#1e6b4e',
    desc: 'Payroll giving работает как рекуррент на автопилоте. К Новому году, Наурызу или корпоративным датам — разовые boost-кампании с удвоенным матчингом. Квартальный отчёт с реальными цифрами импакта.',
    badge: 'Рекуррентный доход',
    badgeColor: '#2f8f6a',
  },
];

const WHY_PAYROLL = [
  { title: 'Skin in the game', text: 'Сотрудник вкладывает свои деньги — и реально вовлекается. Следит за подопечным, радуется сбору.', icon: '💡' },
  { title: 'Матчинг работает магически', text: '«Мои 2 000 ₸ превращаются в 4 000 ₸» — это сильнейший психологический мотив для участия.', icon: '✖️2' },
  { title: 'Donor habit на своих деньгах', text: 'Уйдёт из компании — с высокой вероятностью продолжит донатить самостоятельно.', icon: '🔄' },
  { title: 'Чистая налоговая структура', text: 'Корпоративный донат — благотворительность компании. Личный — личный. Без серых зон.', icon: '✅' },
];

const BENEFITS_COMPANY = [
  'Готовый инструмент CSR с автоматическим reporting',
  'Квартальный отчёт: сколько собрано, кому помогли, какой импакт',
  'HR-бенефит «work with purpose» для найма и удержания',
  'Измеримый ESG-результат для GR и инвесторов',
  'Потенциальный налоговый вычет по КЗ законодательству',
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

function ContactForm() {
  const [form, setForm] = useState({ company: '', name: '', phone: '', format: 'payroll' });
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className='text-center py-12'>
        <div className='text-5xl mb-4'>🎉</div>
        <h3 className='text-xl font-bold text-gray-900 mb-2'>Заявка отправлена!</h3>
        <p className='text-gray-500'>Мы свяжемся с вами в течение 24 часов для обсуждения пилота.</p>
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
            { value: 'payroll', label: '💳 Payroll Giving + Матчинг' },
            { value: 'budget', label: '🎁 Gift Budget для сотрудников' },
            { value: 'both', label: '🔀 Оба формата (воронка)' },
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
      <button type='submit' className='w-full py-3.5 bg-[#2f8f6a] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity'>
        Запустить пилот →
      </button>
      <p className='text-xs text-gray-400 text-center'>Ответим в течение 24 часов. Без обязательств.</p>
    </form>
  );
}

export default function CompaniesV1Page() {
  const navigate = useNavigate();

  return (
    <div className='bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden'>
      {/* Плашка "старая версия" */}
      <div className='bg-amber-400 text-amber-900 text-center text-sm font-semibold py-2'>
        ⚠️ Версия 1 (для сравнения) — <button onClick={() => navigate('/companies')} className='underline'>перейти к версии 2 →</button>
      </div>

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
          <a href='#contact' className='bg-[#2f8f6a] text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity'>
            Запустить пилот
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 pointer-events-none'
          style={{ background: 'radial-gradient(ellipse at 70% 50%, #7EF1D0 0%, transparent 55%)', opacity: 0.35 }} />
        <div className='max-w-7xl mx-auto px-8 py-24 relative z-10'>
          <div className='max-w-3xl'>
            <div className='inline-flex items-center gap-2 bg-[#e8f8f2] text-[#2f8f6a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6'>
              🏢 Для компаний — ESG & CSR платформа
            </div>
            <h1 className='text-5xl font-bold text-gray-900 leading-tight mb-6'>
              Превратите социальную<br />ответственность в{' '}
              <span style={{ background: 'linear-gradient(135deg, #1e6b4e, #5ec49a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                реальный импакт
              </span>
            </h1>
            <p className='text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl'>
              Шаңырақ — готовая платформа для вовлечения сотрудников в благотворительность. Payroll giving с матчингом, автоматическая ESG-отчётность и живая история помощи для каждого сотрудника.
            </p>
            <div className='flex items-center gap-4'>
              <a href='#contact' className='bg-[#2f8f6a] text-white font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity text-base'>
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
            <p className='text-gray-500'>Типичные проблемы ESG/CSR в IT-компаниях Казахстана</p>
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

      {/* ФАЗЫ */}
      <section id='how' className='max-w-7xl mx-auto px-8 py-20'>
        <div className='text-center mb-14'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Трёхфазная воронка</h2>
          <p className='text-gray-500 max-w-xl mx-auto'>Начинайте с простого — постепенно переходите к рекуррентному payroll giving</p>
        </div>
        <div className='space-y-6'>
          {PHASES.map((phase, i) => (
            <div key={i} className='rounded-3xl p-8 flex items-start gap-8' style={{ background: phase.color }}>
              <span className='text-5xl font-black opacity-20' style={{ color: phase.textColor === 'white' ? 'white' : '#1e6b4e' }}>{phase.num}</span>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-3'>
                  <h3 className='text-xl font-bold' style={{ color: phase.textColor }}>{phase.title}</h3>
                  <span className='text-xs font-semibold px-2.5 py-1 rounded-full'
                    style={{ background: phase.badgeColor, color: phase.badgeText || 'white' }}>{phase.badge}</span>
                  <span className='text-xs px-2.5 py-1 rounded-full'
                    style={{ background: phase.textColor === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(47,143,106,0.1)', color: phase.textColor === 'white' ? 'rgba(255,255,255,0.8)' : '#2f8f6a' }}>
                    {phase.timeline}
                  </span>
                </div>
                <p className='text-sm leading-relaxed max-w-2xl'
                  style={{ color: phase.textColor === 'white' ? 'rgba(255,255,255,0.8)' : '#4b5563' }}>{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ПОЧЕМУ PAYROLL */}
      <section className='py-20' style={{ background: 'linear-gradient(135deg, #0f3d2a, #1e6b4e)' }}>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl font-bold text-white mb-4'>Почему Payroll Giving — лучшее решение</h2>
            <p className='text-white/60 max-w-xl mx-auto'>Не просто раздать бюджет — а создать настоящих доноров внутри компании</p>
          </div>
          <div className='grid grid-cols-2 gap-6 mb-10'>
            {WHY_PAYROLL.map((item) => (
              <div key={item.title} className='bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10'>
                <div className='text-2xl mb-3'>{item.icon}</div>
                <h3 className='font-bold text-white mb-2'>{item.title}</h3>
                <p className='text-sm text-white/65 leading-relaxed'>{item.text}</p>
              </div>
            ))}
          </div>
          <div className='bg-white/5 rounded-3xl p-8 border border-white/10'>
            <h3 className='text-white font-bold text-center mb-6'>Сравнение моделей</h3>
            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div />
              <div className='text-center text-white font-semibold bg-white/10 rounded-xl py-2'>Gift Budget</div>
              <div className='text-center font-semibold rounded-xl py-2' style={{ background: '#2f8f6a', color: 'white' }}>Payroll Giving ✓</div>
              {[['Skin in the game','❌ Нет','✅ Да'],['Donor habit','❌ Разовый','✅ Рекуррент'],['LTV донора','❌ ~0','✅ Годы'],['Цикл продажи','✅ 1–2 нед','⚡ 3–6 нед'],['Налоги','⚠️ Серая зона','✅ Прозрачно'],['Retention без компании','❌ Нет','✅ Высокий']].map(([label, a, b]) => (
                <React.Fragment key={label}>
                  <div className='text-white/60 flex items-center py-2 border-t border-white/5'>{label}</div>
                  <div className='text-center text-white/70 flex items-center justify-center py-2 border-t border-white/5'>{a}</div>
                  <div className='text-center text-white flex items-center justify-center py-2 border-t border-white/5'>{b}</div>
                </React.Fragment>
              ))}
            </div>
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

      {/* ЮНИТ-ЭКОНОМИКА */}
      <section className='bg-gray-50 py-20'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Юнит-экономика для вас</h2>
            <p className='text-gray-500'>Один контракт с компанией на 100 человек</p>
          </div>
          <div className='bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-3xl mx-auto'>
            <div className='grid grid-cols-3 gap-6 mb-8'>
              {[{ value: '100', label: 'сотрудников в пилоте', sub: 'типичный первый контракт' }, { value: '3 000 ₸', label: 'средний донат/мес', sub: 'от сотрудника' }, { value: '80%', label: 'годовой retention', sub: 'при матчинге компании' }].map((s) => (
                <div key={s.label} className='text-center'>
                  <div className='text-3xl font-bold text-[#2f8f6a] mb-1'>{s.value}</div>
                  <div className='text-sm font-medium text-gray-800'>{s.label}</div>
                  <div className='text-xs text-gray-400 mt-0.5'>{s.sub}</div>
                </div>
              ))}
            </div>
            <div className='h-px bg-gray-100 mb-8' />
            {[{ label: 'Ежемесячный оборот через платформу', value: '300 000 ₸' }, { label: 'Годовой оборот (×12 × 80% retention)', value: '2 880 000 ₸' }, { label: 'С матчингом компании ×2 — реальный импакт', value: '5 760 000 ₸' }].map((row) => (
              <div key={row.label} className='flex items-center justify-between py-2'>
                <span className='text-sm text-gray-600'>{row.label}</span>
                <span className='font-bold text-gray-900'>{row.value}</span>
              </div>
            ))}
            <div className='flex items-center justify-between py-3 px-4 bg-[#e8f8f2] rounded-xl mt-2'>
              <span className='text-sm font-semibold text-[#1e6b4e]'>Один контракт = рекуррент на годы</span>
              <span className='font-bold text-[#1e6b4e]'>CAC размазан на весь LTV</span>
            </div>
          </div>
        </div>
      </section>

      {/* СЕГМЕНТ */}
      <section className='max-w-7xl mx-auto px-8 py-20'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Кому подходит</h2>
          <p className='text-gray-500 max-w-lg mx-auto'>Фокус на IT-сегмент Алматы и Астаны</p>
        </div>
        <div className='grid grid-cols-3 gap-4'>
          {TARGET_SEGMENTS.map((seg) => (
            <div key={seg.name} className='bg-gray-50 rounded-2xl p-5 flex items-start gap-4'>
              <span className='text-2xl'>{seg.icon}</span>
              <div>
                <div className='font-semibold text-gray-900'>{seg.name}</div>
                <div className='text-sm text-gray-500 mt-0.5'>{seg.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className='mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 max-w-2xl mx-auto'>
          <span className='text-xl'>💡</span>
          <p className='text-sm text-amber-800 leading-relaxed'>
            <strong>Совет на старте:</strong> идите через warm intro к CEO/HR-директору в IT-компании. Один якорный клиент на 50 сотрудников = пилот через 30–60 дней + реальный кейс для масштабирования.
          </p>
        </div>
      </section>

      {/* ФОРМА */}
      <section id='contact' style={{ background: 'linear-gradient(135deg, #f0faf6, #e8f8f2)' }}>
        <div className='max-w-7xl mx-auto px-8 py-20'>
          <div className='grid grid-cols-2 gap-16 items-start'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Запустим пилот вместе</h2>
              <p className='text-gray-600 mb-8 leading-relaxed'>Расскажите о вашей компании — мы предложим оптимальный формат и запустим первый пилот без долгих согласований.</p>
              {[{ icon: '📞', text: 'Ответим в течение 24 часов' }, { icon: '🎯', text: 'Пилот бесплатно для первых 5 компаний' }, { icon: '📊', text: 'Готовый отчёт уже через 30 дней' }].map((item) => (
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

      <footer className='bg-gray-900 text-gray-400 py-10'>
        <div className='max-w-7xl mx-auto px-8 flex items-center justify-between'>
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
            <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-8 h-8 object-contain opacity-80' />
            <span className='text-white font-semibold'>Шаңырақ</span>
          </div>
          <p className='text-xs'>© 2025 Шаңырақ</p>
        </div>
      </footer>
    </div>
  );
}
