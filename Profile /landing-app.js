function HeroSection() {
  return (
    <section className='hero-gradient min-h-screen flex items-center justify-center px-4 relative overflow-hidden'>
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl' />
        <div className='absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl' />
      </div>
      <div className='max-w-5xl mx-auto text-center relative z-10'>
        <div className='mb-8'>
          <img src='https://app.trickle.so/storage/public/images/usr_140a45f300000001/86eeabeb-ea74-4381-9f41-405f827fda21.png' alt='Шанырак' className='w-24 h-24 mx-auto mb-6' />
        </div>
        <h1 className='hero-title text-5xl md:text-7xl font-bold text-white mb-6 leading-tight'>Помощь стала проще</h1>
        <p className='text-xl md:text-2xl text-white text-opacity-90 mb-12 max-w-3xl mx-auto leading-relaxed'>
          Выбирайте категорию, проверяйте документы, помогайте в 2 клика. Современная платформа благотворительности с полной прозрачностью.
        </p>
        <div className='flex flex-col md:flex-row gap-4 justify-center'>
          <button onClick={() => window.location.href = 'index.html'} className='bg-white text-[var(--primary-color)] px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all'>
            Начать помогать
          </button>
          <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className='bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[var(--primary-color)] transition-all'>
            Узнать больше
          </button>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const categories = [
    { icon: 'baby', title: 'Дети', desc: 'Помощь детям и детским учреждениям', color: 'bg-blue-50 text-blue-600' },
    { icon: 'user', title: 'Взрослые', desc: 'Помощь взрослым в трудных жизненных ситуациях', color: 'bg-green-50 text-green-600' },
    { icon: 'user-round', title: 'Пожилые', desc: 'Поддержка пожилых людей и ветеранов', color: 'bg-purple-50 text-purple-600' },
    { icon: 'heart', title: 'Животные', desc: 'Помощь животным и приютам', color: 'bg-orange-50 text-orange-600' }
  ];

  return (
    <section id='features' className='py-24 px-4 bg-[var(--bg-light)]'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16 scroll-reveal'>
          <h2 className='text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4'>Выберите категорию помощи</h2>
          <p className='text-xl text-[var(--text-secondary)] max-w-2xl mx-auto'>Только реальные подопечные с проверенными документами</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {categories.map((cat, idx) => (
            <div key={idx} className='feature-card bg-white rounded-3xl p-8 scroll-reveal' style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center mb-6`}>
                <div className={`icon-${cat.icon} text-2xl`} />
              </div>
              <h3 className='text-xl font-semibold text-[var(--text-primary)] mb-3'>{cat.title}</h3>
              <p className='text-[var(--text-secondary)] leading-relaxed'>{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TransparencySection() {
  return (
    <section className='py-24 px-4 bg-white'>
      <div className='max-w-6xl mx-auto'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <div className='scroll-reveal'>
            <div className='bg-gradient-to-br from-[var(--primary-color)] to-green-600 rounded-3xl p-8 shadow-2xl'>
              <div className='bg-white bg-opacity-20 rounded-2xl p-6 mb-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='icon-file-text text-3xl text-white' />
                  <span className='bg-white bg-opacity-30 text-white text-xs px-3 py-1 rounded-full'>Проверено</span>
                </div>
                <h4 className='text-white text-lg font-semibold mb-2'>Документы подопечного</h4>
                <p className='text-white text-opacity-80 text-sm'>Медицинские справки, выписки, квитанции</p>
              </div>
            </div>
          </div>
          <div className='scroll-reveal'>
            <h2 className='text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6'>Полная прозрачность</h2>
            <p className='text-xl text-[var(--text-secondary)] mb-8 leading-relaxed'>
              Каждый подопечный имеет подтверждающие документы. Вы всегда можете проверить, кому и зачем нужна помощь.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  const [stats, setStats] = React.useState({ beneficiaries: 0, raised: 0, helpers: 0 });

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await window.trickleListObjects('charity_beneficiary', 100, true);
      const totalRaised = result.items.reduce((sum, item) => sum + (item.objectData.raised_amount || 0), 0);
      setStats({
        beneficiaries: result.items.length,
        raised: totalRaised,
        helpers: result.items.reduce((sum, item) => sum + (item.objectData.helpers_count || 0), 0)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      <HeroSection />
      <CategoriesSection />
      <TransparencySection />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LandingPage />);