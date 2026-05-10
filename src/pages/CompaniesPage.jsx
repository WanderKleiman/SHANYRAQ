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

function ContactForm() {
  const [form, setForm] = useState({ company: '', name: '', contact: '', format: 'salary' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className='text-center py-10'>
        <div className='text-4xl mb-4'>✅</div>
        <h3 className='text-lg font-bold text-gray-900 mb-2'>Заявка отправлена</h3>
        <p className='text-gray-500 text-sm'>Свяжемся с вами в течение 24 часов.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
          placeholder='Название компании'
          className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2f8f6a] focus:border-transparent transition' />
      </div>
      <div>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder='Ваше имя и должность'
          className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2f8f6a] focus:border-transparent transition' />
      </div>
      <div>
        <input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
          placeholder='Телефон или email'
          className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2f8f6a] focus:border-transparent transition' />
      </div>
      <div className='space-y-2'>
        <p className='text-xs text-gray-500 font-medium'>Формат участия</p>
        {[
          { value: 'salary', label: 'Добровольные отчисления с зарплаты + удвоение от компании' },
          { value: 'budget', label: 'Корпоративный благотворительный бюджет для сотрудников' },
          { value: 'both', label: 'Оба формата — обсудим на встрече' },
        ].map((opt) => (
          <label key={opt.value}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer text-sm transition-all ${
              form.format === opt.value
                ? 'border-[#2f8f6a] bg-[#f0faf6] text-[#1e6b4e] font-medium'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            <input type='radio' name='format' value={opt.value} checked={form.format === opt.value}
              onChange={() => setForm({ ...form, format: opt.value })} className='hidden' />
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              form.format === opt.value ? 'border-[#2f8f6a]' : 'border-gray-300'
            }`}>
              {form.format === opt.value && <div className='w-2 h-2 rounded-full bg-[#2f8f6a]' />}
            </div>
            {opt.label}
          </label>
        ))}
      </div>
      <button type='submit'
        className='w-full py-3.5 rounded-2xl text-white font-semibold text-sm hover:opacity-90 transition-opacity'
        style={{ background: 'linear-gradient(135deg, #1e6b4e, #2f8f6a)' }}>
        Обсудить сотрудничество →
      </button>
      <p className='text-xs text-gray-400 text-center'>Бесплатно. Без обязательств. Ответим за 24 часа.</p>
    </form>
  );
}

export default function CompaniesPage() {
  const navigate = useNavigate();

  return (
    <div className='bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden' style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* HEADER */}
      <header className='sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80'>
        <div className='max-w-6xl mx-auto px-8 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
            <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-8 h-8 object-contain' />
            <span className='font-semibold text-gray-900'>Шаңырақ</span>
          </div>
          <nav className='flex items-center gap-7'>
            {MENU_ITEMS.map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)}
                className={`text-sm transition-colors ${
                  item.highlight
                    ? 'text-[#2f8f6a] font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}>
                {item.label}
              </button>
            ))}
          </nav>
          <a href='#contact'
            className='text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-opacity hover:opacity-90'
            style={{ background: 'linear-gradient(135deg, #1e6b4e, #2f8f6a)' }}>
            Оставить заявку
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className='relative overflow-hidden pt-24 pb-28'>
        <div className='absolute inset-0 pointer-events-none'
          style={{ background: 'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(126,241,208,0.25) 0%, transparent 70%)' }} />
        <div className='max-w-6xl mx-auto px-8 relative z-10'>
          <div className='max-w-2xl'>
            <p className='text-sm font-medium text-[#2f8f6a] mb-5 tracking-wide uppercase'>
              Корпоративная благотворительность
            </p>
            <h1 className='text-6xl font-bold text-gray-900 leading-none tracking-tight mb-6'>
              Забота о людях —<br />
              <span style={{ background: 'linear-gradient(135deg, #1e6b4e 0%, #5ec49a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                вместе с командой.
              </span>
            </h1>
            <p className='text-xl text-gray-500 leading-relaxed mb-10'>
              Шаңырақ помогает компаниям выстраивать живую культуру благотворительности. Сотрудники сами выбирают кому помочь. Компания удваивает их вклад. Платформа считает и отчитывается.
            </p>
            <div className='flex items-center gap-4'>
              <a href='#contact'
                className='px-7 py-3.5 rounded-full text-white font-semibold text-base transition-opacity hover:opacity-90'
                style={{ background: 'linear-gradient(135deg, #1e6b4e, #2f8f6a)' }}>
                Подключить компанию
              </a>
              <a href='#how' className='text-sm text-gray-400 hover:text-gray-600 transition-colors'>
                Как это работает ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* СТАТИСТИКА */}
      <section className='border-y border-gray-100 py-12 bg-gray-50/50'>
        <div className='max-w-6xl mx-auto px-8'>
          <div className='grid grid-cols-4 gap-8'>
            {[
              { value: '10+', label: 'фондов-партнёров', sub: 'официально зарегистрированных' },
              { value: '×2', label: 'удвоение вклада', sub: 'компания добавляет столько же' },
              { value: '100%', label: 'прозрачность', sub: 'все фонды верифицированы' },
              { value: '30 дн.', label: 'до первого отчёта', sub: 'о реальном импакте' },
            ].map((s) => (
              <div key={s.label} className='text-center'>
                <div className='text-3xl font-bold text-[#1e6b4e] mb-1'>{s.value}</div>
                <div className='text-sm font-medium text-gray-800'>{s.label}</div>
                <div className='text-xs text-gray-400 mt-0.5'>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ */}
      <section id='how' className='max-w-6xl mx-auto px-8 py-24'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 tracking-tight mb-4'>Два формата участия</h2>
          <p className='text-gray-400 text-lg max-w-lg mx-auto'>Выберите подходящий — или совместите оба</p>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          {/* Формат 1 */}
          <div className='rounded-3xl p-10 relative overflow-hidden'
            style={{ background: 'linear-gradient(145deg, #0f3d2a, #1e6b4e, #2f8f6a)' }}>
            <div className='absolute top-0 right-0 w-48 h-48 rounded-full opacity-10'
              style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className='relative z-10'>
              <div className='w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-6 text-2xl'>💳</div>
              <h3 className='text-2xl font-bold text-white mb-3'>Отчисления с зарплаты</h3>
              <p className='text-white/70 text-sm leading-relaxed mb-6'>
                Сотрудник добровольно выбирает направлять часть зарплаты — например, 2 000–5 000 ₸ в месяц — выбранному фонду или подопечному. Компания удваивает каждый тенге сверху.
              </p>
              <div className='bg-white/10 rounded-2xl p-4 space-y-2.5'>
                {['Сотрудник выбирает фонд в приложении', 'Автоматическое ежемесячное списание', 'Компания добавляет 100% сверху', 'Личная история помощи в профиле'].map((t) => (
                  <div key={t} className='flex items-center gap-2.5 text-sm text-white/80'>
                    <div className='w-1.5 h-1.5 rounded-full bg-[#7EF1D0] flex-shrink-0' />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Формат 2 */}
          <div className='rounded-3xl p-10 bg-gray-50 border border-gray-100'>
            <div className='w-12 h-12 bg-[#e8f8f2] rounded-2xl flex items-center justify-center mb-6 text-2xl'>🎁</div>
            <h3 className='text-2xl font-bold text-gray-900 mb-3'>Корпоративный бюджет</h3>
            <p className='text-gray-500 text-sm leading-relaxed mb-6'>
              Компания выделяет благотворительный бюджет — например, 2 000 ₸ на каждого сотрудника. Команда заходит на платформу и сама распределяет средства между зарегистрированными фондами.
            </p>
            <div className='bg-white rounded-2xl p-4 border border-gray-100 space-y-2.5'>
              {['Простой старт — решение за 1–2 недели', 'Сотрудники вовлечены в выбор фонда', 'Компания видит весь импакт в отчёте', 'Подходит для подарка к корпоративной дате'].map((t) => (
                <div key={t} className='flex items-center gap-2.5 text-sm text-gray-600'>
                  <div className='w-1.5 h-1.5 rounded-full bg-[#2f8f6a] flex-shrink-0' />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Комбо */}
        <div className='mt-6 rounded-3xl p-7 flex items-center gap-6 border border-[#c8f0e0]'
          style={{ background: 'linear-gradient(135deg, #f0faf6, #e8f8f2)' }}>
          <div className='w-10 h-10 bg-[#2f8f6a] rounded-xl flex items-center justify-center flex-shrink-0 text-white text-lg'>⚡</div>
          <div>
            <p className='font-semibold text-gray-900 mb-1'>Лучший результат — оба формата вместе</p>
            <p className='text-sm text-gray-500'>Начните с корпоративного бюджета — сотрудники познакомятся с платформой. Затем предложите перейти на ежемесячные личные отчисления. Компания удваивает. Культура благотворительности формируется органично.</p>
          </div>
        </div>
      </section>

      {/* ФОНДЫ */}
      <section className='py-20 border-y border-gray-100 bg-gray-50/30'>
        <div className='max-w-6xl mx-auto px-8'>
          <div className='grid grid-cols-2 gap-16 items-center'>
            <div>
              <h2 className='text-4xl font-bold text-gray-900 tracking-tight mb-5'>
                Только проверенные фонды
              </h2>
              <p className='text-gray-500 text-lg leading-relaxed mb-8'>
                Шаңырақ работает исключительно с официально зарегистрированными благотворительными и общественными фондами Казахстана. Каждый фонд проходит верификацию перед появлением на платформе.
              </p>
              <div className='space-y-4'>
                {[
                  { icon: '📋', title: 'Официальная регистрация', desc: 'Все фонды зарегистрированы как юридические лица в РК' },
                  { icon: '🔍', title: 'Проверка документов', desc: 'Устав, свидетельство о регистрации, реквизиты — в открытом доступе' },
                  { icon: '📊', title: 'Публичная отчётность', desc: 'Фонды публикуют отчёты об использовании средств' },
                ].map((item) => (
                  <div key={item.title} className='flex items-start gap-4'>
                    <span className='text-xl mt-0.5'>{item.icon}</span>
                    <div>
                      <p className='font-medium text-gray-900 text-sm'>{item.title}</p>
                      <p className='text-sm text-gray-400'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              {[
                { label: 'Дети и сироты', icon: '👶' },
                { label: 'Онкология', icon: '🎗' },
                { label: 'Пожилые люди', icon: '🤝' },
                { label: 'Люди с инвалидностью', icon: '♿' },
                { label: 'Многодетные семьи', icon: '👨‍👩‍👧‍👦' },
                { label: 'Реабилитация', icon: '💚' },
              ].map((cat) => (
                <div key={cat.label}
                  className='bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-3 hover:border-[#c8f0e0] hover:bg-[#f8fffc] transition-all'>
                  <span className='text-2xl'>{cat.icon}</span>
                  <span className='text-sm font-medium text-gray-700'>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ЧТО ПОЛУЧАЕТ КОМПАНИЯ */}
      <section className='max-w-6xl mx-auto px-8 py-24'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 tracking-tight mb-4'>Что это даёт компании</h2>
          <p className='text-gray-400 text-lg'>Измеримые результаты для HR, PR и руководства</p>
        </div>
        <div className='grid grid-cols-3 gap-5'>
          {[
            {
              icon: '📈',
              title: 'ESG-отчётность без усилий',
              desc: 'Ежеквартальный отчёт: сколько собрано, кому помогли, какой импакт. Готовые данные для GR, инвесторов и совета директоров.',
            },
            {
              icon: '🧲',
              title: 'HR-бренд и привлечение',
              desc: 'Специалисты выбирают компании с ценностями. Участие в благотворительности — конкретный аргумент при найме, а не абстрактная декларация.',
            },
            {
              icon: '💡',
              title: 'Вовлечённость команды',
              desc: 'Сотрудники сами выбирают подопечного, следят за сбором, видят результат. Это живая инициатива, а не корпоративная галочка.',
            },
            {
              icon: '🔒',
              title: 'Полная прозрачность',
              desc: 'Деньги идут напрямую в зарегистрированные фонды. Каждый перевод отображается в личном кабинете сотрудника.',
            },
            {
              icon: '⚙️',
              title: 'Готовая инфраструктура',
              desc: 'Мобильное приложение, веб-платформа, отчёты — всё уже работает. Никакой разработки на стороне компании.',
            },
            {
              icon: '📱',
              title: 'Приложение для каждого',
              desc: 'Сотрудник видит своих подопечных, историю помощи и прогресс сборов прямо в телефоне. Доступно на iOS и Android.',
            },
          ].map((item) => (
            <div key={item.title} className='rounded-2xl p-7 border border-gray-100 hover:border-[#c8f0e0] hover:shadow-sm transition-all group'>
              <span className='text-3xl mb-4 block'>{item.icon}</span>
              <h3 className='font-semibold text-gray-900 mb-2 text-base group-hover:text-[#1e6b4e] transition-colors'>{item.title}</h3>
              <p className='text-sm text-gray-500 leading-relaxed'>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ЧТО ЧУВСТВУЕТ СОТРУДНИК */}
      <section style={{ background: 'linear-gradient(180deg, #f8fffc 0%, white 100%)' }} className='py-20 border-y border-[#e0f5ec]'>
        <div className='max-w-6xl mx-auto px-8'>
          <div className='text-center mb-14'>
            <h2 className='text-4xl font-bold text-gray-900 tracking-tight mb-4'>Опыт сотрудника</h2>
            <p className='text-gray-400 text-lg'>Что видит и чувствует человек внутри программы</p>
          </div>
          <div className='grid grid-cols-4 gap-4'>
            {[
              { step: '01', title: 'Выбирает подопечного', desc: 'Заходит в приложение и выбирает фонд или конкретного подопечного, которому хочет помочь', icon: '🔍' },
              { step: '02', title: 'Устанавливает сумму', desc: 'Сам решает: 1 000, 3 000 или 5 000 ₸ в месяц. Может изменить или отменить в любое время', icon: '✏️' },
              { step: '03', title: 'Видит удвоение', desc: 'Компания добавляет столько же. Его 3 000 ₸ превращаются в 6 000 ₸ — это видно прямо в приложении', icon: '✨' },
              { step: '04', title: 'Следит за результатом', desc: 'Видит прогресс сбора, читает обновления от фонда, знает что его помощь дошла до адресата', icon: '💚' },
            ].map((s) => (
              <div key={s.step} className='text-center p-6 rounded-3xl bg-white border border-gray-100 hover:border-[#c8f0e0] transition-all'>
                <div className='text-3xl mb-4'>{s.icon}</div>
                <div className='text-xs font-bold text-[#2f8f6a] mb-2 tracking-widest'>{s.step}</div>
                <h4 className='font-semibold text-gray-900 mb-2 text-sm'>{s.title}</h4>
                <p className='text-xs text-gray-400 leading-relaxed'>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ФОРМА */}
      <section id='contact' className='max-w-6xl mx-auto px-8 py-24'>
        <div className='grid grid-cols-2 gap-20 items-start'>
          <div>
            <h2 className='text-4xl font-bold text-gray-900 tracking-tight mb-4'>
              Начнём вместе
            </h2>
            <p className='text-gray-500 text-lg leading-relaxed mb-8'>
              Расскажите о вашей компании — предложим формат, который подойдёт вашей команде, и запустим в течение двух недель.
            </p>
            <div className='space-y-5'>
              {[
                { icon: '🤝', title: 'Первый шаг — за нами', desc: 'Приедем, покажем платформу, ответим на все вопросы' },
                { icon: '⚡', title: 'Старт за 2 недели', desc: 'Договор, доступ, первый запуск — без долгих согласований' },
                { icon: '📊', title: 'Отчёт уже через 30 дней', desc: 'Покажем реальные цифры: сколько собрали и кому помогли' },
              ].map((item) => (
                <div key={item.title} className='flex items-start gap-4'>
                  <span className='text-2xl'>{item.icon}</span>
                  <div>
                    <p className='font-semibold text-gray-900 text-sm'>{item.title}</p>
                    <p className='text-sm text-gray-400'>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='bg-white rounded-3xl p-8 border border-gray-100 shadow-sm'>
            <h3 className='font-bold text-gray-900 mb-6 text-lg'>Оставьте заявку</h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='border-t border-gray-100 py-10'>
        <div className='max-w-6xl mx-auto px-8 flex items-center justify-between'>
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
            <img src={`${SUPABASE_IMG}/14.png`} alt='Шаңырақ' className='w-7 h-7 object-contain opacity-70' />
            <span className='text-sm font-medium text-gray-400'>Шаңырақ</span>
          </div>
          <div className='flex gap-6 text-sm'>
            {MENU_ITEMS.filter(m => !m.highlight).map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)}
                className='text-gray-400 hover:text-gray-600 transition-colors'>
                {item.label}
              </button>
            ))}
          </div>
          <p className='text-xs text-gray-300'>© 2025 Шаңырақ</p>
        </div>
      </footer>
    </div>
  );
}
