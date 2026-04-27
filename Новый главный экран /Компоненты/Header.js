function Header() {
  try {
    return (
      <header className="bg-[var(--bg-light)] pt-3 pb-2 md:pt-6 md:pb-4" data-name="header" data-file="components/Header.js">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center text-center md:flex-row md:text-left md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 mb-1.5 md:mb-0">
              <img
                src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/14.webp"
                alt="Логотип фонда Шаңырақ"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-[13px] md:text-[18px] font-semibold text-[var(--text-primary)] leading-tight">
                Благотворительный фонд
              </h1>
              <p className="text-[13px] md:text-[18px] font-semibold text-[var(--text-primary)]">Шаңырақ</p>
            </div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}
