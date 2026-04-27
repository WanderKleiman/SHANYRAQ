function TotalAmount() {
  try {
    const raised = 15800000;
    const goal = 25000000;
    const percent = Math.round((raised / goal) * 100);

    return (
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 mb-6 mt-6" data-name="total-amount" data-file="components/TotalAmount.js">
        <div className="bg-[#f5f4f2] rounded-2xl p-5 md:p-8">
          <div className="flex items-center gap-4 md:gap-6 mb-3">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--primary-color)] rounded-xl flex items-center justify-center flex-shrink-0">
              <div className="icon-trending-up text-white text-[24px] md:text-[32px]"></div>
            </div>
            <div>
              <p className="text-[12px] md:text-[14px] text-[var(--text-secondary)] mb-1">
                Сумма сбора на сегодня
              </p>
              <p className="text-[20px] md:text-[28px] font-bold text-[var(--text-primary)]">
                15 800 000 ₸
              </p>
            </div>
          </div>
          <div className="w-full h-[8px] md:h-[10px] bg-[#E0E0E0] rounded-full">
            <div
              className="h-full bg-[var(--primary-color)] rounded-full transition-all"
              style={{ width: percent + '%' }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-[10px] md:text-[12px] text-[var(--text-secondary)]">{percent}% собрано</p>
            <p className="text-[10px] md:text-[12px] text-[var(--text-secondary)]">Цель: 25 000 000 ₸</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('TotalAmount component error:', error);
    return null;
  }
}
