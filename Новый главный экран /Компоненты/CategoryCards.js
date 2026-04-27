function CategoryCards() {
  try {
    const categories = [
      { id: 1, title: 'Дети', count: '12 подопечных', isGreen: true, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/111-1.png' },
      { id: 2, title: 'Питомцы', count: '8 подопечных', isGreen: false, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/pet.png' },
      { id: 3, title: 'Взрослые', count: '15 подопечных', isGreen: false, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/people.png', bottomAligned: true },
      { id: 4, title: 'Пожилые', count: '12 подопечных', isGreen: true, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/grandma2.png' },
      { id: 5, title: 'Социальные проекты', count: '5 проектов', isGreen: false, image: 'https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/social.png', bottomAligned: true },
    ];

    return (
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-2 md:px-4 mb-6" data-name="category-cards" data-file="components/CategoryCards.js">
        <style dangerouslySetInnerHTML={{ __html: `
          .cat-card { border-radius: 15px; box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25); }
          .cat-card-0 { width: calc(45% - 6px); }
          .cat-card-1 { width: calc(55% - 6px); }
          .cat-card-2 { width: calc(55% - 6px); }
          .cat-card-3 { width: calc(45% - 6px); }
          .cat-card-4 { width: 100%; }
          @media (min-width: 768px) {
            .cat-card-0, .cat-card-1, .cat-card-2, .cat-card-3, .cat-card-4 { width: auto; flex: 1; }
          }
        `}} />
        <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 justify-between">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`cat-card cat-card-${idx} ${cat.isGreen ? 'bg-[var(--primary-color)]' : 'bg-white'} h-[60px] md:h-[80px] flex items-end cursor-pointer transition-transform active:scale-97 overflow-hidden relative`}
            >
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.title}
                  className={cat.bottomAligned ? "h-[55px] md:h-[70px] object-contain" : "h-[50px] md:h-[65px] object-contain"}
                  style={{
                    marginLeft: cat.bottomAligned ? '16px' : '14px',
                    alignSelf: 'flex-end',
                  }}
                />
              )}
              <div className="flex-1 text-right flex flex-col justify-between h-full py-2 pr-3 relative z-10">
                <h3 className={`font-semibold text-[13px] md:text-[15px] leading-tight ${cat.isGreen ? 'text-white' : 'text-black'}`}>
                  {cat.title}
                </h3>
                <p className={`text-[10px] md:text-[12px] ${cat.isGreen ? 'text-white' : 'text-black'}`}>
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
      </div>
    );
  } catch (error) {
    console.error('CategoryCards component error:', error);
    return null;
  }
}
