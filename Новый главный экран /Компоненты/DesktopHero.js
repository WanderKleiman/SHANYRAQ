function DesktopHero() {
  try {
    const categories = [
      { id: 1, title: 'Дети', count: '12 подопечных', isGreen: true, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/111-1.png' },
      { id: 2, title: 'Питомцы', count: '8 подопечных', isGreen: false, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/pet.png' },
      { id: 3, title: 'Взрослые', count: '15 подопечных', isGreen: false, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/people.png', bottomAligned: true },
      { id: 4, title: 'Пожилые', count: '12 подопечных', isGreen: true, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/grandma2.png' },
      { id: 5, title: 'Социальные проекты', count: '5 проектов', isGreen: false, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/social.png', bottomAligned: true },
    ];

    const funds = [
      { id: 1, name: 'Фонд Милосердие', count: 7, logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop' },
      { id: 2, name: 'Детский фонд', count: 12, logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&h=100&fit=crop' },
      { id: 3, name: 'Забота о пожилых', count: 9, logo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=100&h=100&fit=crop' },
      { id: 4, name: 'Помощь животным', count: 15, logo: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=100&h=100&fit=crop' },
    ];

    const menuItems = ['Подопечные', 'Фонды-партнёры', 'Документы', 'Контакты'];

    return (
      <div
        className="hidden md:block h-screen overflow-hidden relative"
        style={{ background: '#FFFFFF' }}
        data-name="desktop-hero"
        data-file="components/DesktopHero.js"
      >
        {/* Блюр-блок справа */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full"
          style={{
            background: '#7EF1D0',
            borderRadius: '20%',
            filter: 'blur(200px)',
            WebkitFilter: 'blur(200px)',
          }}
        ></div>

        {/* Шапка с лого и меню */}
        <div className="flex items-center px-6 lg:px-12 pt-6 pb-4 relative z-10">
          <img
            src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/14.png"
            alt="Логотип Шаңырақ"
            className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
          />
          <nav className="flex gap-6 lg:gap-8 ml-8">
            {menuItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-[14px] lg:text-[15px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Основной контент — две колонки */}
        <div className="flex px-6 lg:px-12 gap-8 lg:gap-16 relative z-10" style={{ height: 'calc(100vh - 88px)' }}>

          {/* Левая колонка */}
          <div className="w-[42%] flex-shrink-0 flex flex-col">
            <h1 className="text-[2.4vw] font-bold text-[var(--text-primary)] leading-tight mb-[2vh] mt-[4vh]">
              Благотворительный фонд «Шаңырақ» помогает делать жизнь людей в нашей стране лучше.
            </h1>

            <p className="text-[1.3vw] text-[var(--text-secondary)] leading-relaxed mb-[3vh]">
              Мы объединяем усилия партнёров, попечителей и <span className="text-[var(--primary-color)] underline">технологий</span>, чтобы поддерживать тех, кто в этом нуждается.
            </p>

            <div className="flex justify-center">
              <img
                src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/iPhone%20Mockup%2014.png"
                alt="Мобильное приложение Шаңырақ"
                className="object-contain"
                style={{ height: '38vh' }}
              />
            </div>

            <div className="mt-[1vh]">
              <p className="text-[1.1vw] font-semibold text-[var(--text-primary)] mb-[1.5vh]">
                Скачайте приложение
              </p>
              <div className="flex gap-3">
                <a href="#" className="block">
                  <img
                    src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/Google%20.png"
                    alt="Google Store"
                    className="h-[5.5vh] object-contain"
                  />
                </a>
                <a href="#" className="block">
                  <img
                    src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/app%20store%20.png"
                    alt="App Store"
                    className="h-[5.5vh] object-contain"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div className="flex-1 flex flex-col overflow-hidden pl-[15%]">
            <p className="text-[1.3vw] text-[var(--text-primary)] leading-relaxed text-center font-medium mb-[2vh] mt-[4vh]">
              В одном месте мы собираем подопечных с разными потребностями: семьи, людей с инвалидностью, тех, кто оказался в трудной финансовой или жизненной ситуации, а также реализуем социальные проекты и инициативы
            </p>

            {/* Категории — первые 4 в ряд */}
            <div className="mb-[8vh]">
              <div className="flex gap-[0.5vw]">
                {categories.slice(0, 4).map((cat) => (
                  <div
                    key={cat.id}
                    className={`${cat.isGreen ? 'bg-[var(--primary-color)]' : 'bg-white'} h-[6.5vh] flex items-end cursor-pointer transition-transform active:scale-97 overflow-hidden relative flex-1`}
                    style={{
                      borderRadius: '15px',
                      boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="object-contain"
                        style={{
                          height: cat.bottomAligned ? '4vh' : '3.5vh',
                          marginLeft: '0.3vw',
                          alignSelf: 'flex-end',
                        }}
                      />
                    )}
                    <div className="flex-1 text-right flex flex-col justify-between h-full relative z-10" style={{ padding: '0.8vh 0.6vw' }}>
                      <h3 className={`font-semibold leading-tight ${cat.isGreen ? 'text-white' : 'text-black'}`} style={{ fontSize: '0.95vw' }}>
                        {cat.title}
                      </h3>
                      <p className={`${cat.isGreen ? 'text-white' : 'text-black'}`} style={{ fontSize: '0.65vw' }}>
                        {cat.count}
                      </p>
                    </div>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: '15px',
                        boxShadow: 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                        zIndex: 20,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              {/* Социальные проекты — отдельно снизу */}
              {(() => {
                const cat = categories[4];
                return (
                  <div
                    className={`${cat.isGreen ? 'bg-[var(--primary-color)]' : 'bg-white'} h-[6.5vh] flex items-end cursor-pointer transition-transform active:scale-97 overflow-hidden relative mt-[1vw]`}
                    style={{
                      borderRadius: '15px',
                      boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                      width: '100%',
                    }}
                  >
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="object-contain"
                        style={{
                          height: '5.5vh',
                          marginLeft: '10px',
                          alignSelf: 'flex-end',
                        }}
                      />
                    )}
                    <div className="flex-1 text-right flex flex-col justify-between h-full relative z-10" style={{ padding: '0.8vh 0.6vw' }}>
                      <h3 className="font-semibold leading-tight text-black" style={{ fontSize: '0.95vw' }}>
                        {cat.title}
                      </h3>
                      <p className="text-black" style={{ fontSize: '0.65vw' }}>
                        {cat.count}
                      </p>
                    </div>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: '15px',
                        boxShadow: 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                        zIndex: 20,
                      }}
                    ></div>
                  </div>
                );
              })()}
            </div>

            <p className="text-[1.3vw] text-[var(--text-primary)] leading-relaxed text-center font-medium mb-[2vh]">
              Мы работаем с подопечными со всех регионов страны — в этом нам помогают фонды-партнёры.
            </p>

            {/* Фонды-партнёры — карусель */}
            <div className="mb-[3vh] overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none" style={{ width: '80px', background: 'linear-gradient(to right, #8df3d4, transparent)' }}></div>
              <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none" style={{ width: '80px', background: 'linear-gradient(to left, #b4f6e2, transparent)' }}></div>
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scrollFunds {
                  0% { transform: translateX(0); }
                  45% { transform: translateX(calc(-50% - 0.75vw)); }
                  50% { transform: translateX(calc(-50% - 0.75vw)); }
                  95% { transform: translateX(0); }
                  100% { transform: translateX(0); }
                }
                .funds-carousel {
                  animation: scrollFunds 20s ease-in-out infinite;
                }
                .funds-carousel:hover {
                  animation-play-state: paused;
                }
              `}} />
              <div className="funds-carousel flex gap-[1.5vw]" style={{ width: 'max-content' }}>
                {[...funds, ...funds].map((fund, i) => (
                  <div
                    key={fund.id + '-' + i}
                    className="bg-white rounded-2xl cursor-pointer flex-shrink-0"
                    style={{ width: '11vw', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    <div className="mx-[0.3vw] mt-[0.3vw] rounded-xl overflow-hidden" style={{ height: '8vh' }}>
                      <img src={fund.logo} alt={fund.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2">
                      <p className="text-[0.9vw] font-medium text-black leading-tight">{fund.name}</p>
                      <p className="text-[0.75vw] text-[var(--text-secondary)] mt-1">{fund.count} подопечных</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопка */}
            <div className="flex justify-center mt-[3vh]">
              <button className="bg-[var(--primary-color)] text-white text-[1.2vw] font-semibold py-[1.5vh] px-[4vw] rounded-full hover:opacity-90 transition-opacity active:scale-95">
                Продолжить на сайте
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  } catch (error) {
    console.error('DesktopHero component error:', error);
    return null;
  }
}
