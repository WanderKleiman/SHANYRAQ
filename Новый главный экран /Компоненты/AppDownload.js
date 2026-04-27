function AppDownload() {
  try {
    return (
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 py-6 mt-6" data-name="app-download" data-file="components/AppDownload.js">
        <h2 className="text-[18px] md:text-[22px] font-semibold text-[var(--text-primary)] mb-4">
          Скачать приложение
        </h2>
        <div className="flex gap-3 md:gap-4 md:max-w-md">
          <button className="flex-1 bg-[#E8E8E8] rounded-[16px] h-[52px] md:h-[56px] flex items-center justify-center gap-2 active:scale-97 transition-transform">
            <div className="icon-play text-[20px] md:text-[22px] text-[var(--text-primary)]"></div>
            <span className="text-[14px] md:text-[16px] font-medium text-[var(--text-primary)]">Google Play</span>
          </button>
          <button className="flex-1 bg-[#E8E8E8] rounded-[16px] h-[52px] md:h-[56px] flex items-center justify-center gap-2 active:scale-97 transition-transform">
            <div className="icon-apple text-[20px] md:text-[22px] text-[var(--text-primary)]"></div>
            <span className="text-[14px] md:text-[16px] font-medium text-[var(--text-primary)]">App Store</span>
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AppDownload component error:', error);
    return null;
  }
}
