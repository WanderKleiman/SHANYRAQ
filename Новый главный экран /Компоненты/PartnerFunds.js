function PartnerFunds() {
  try {
    const funds = [
      { id: 1, name: 'Фонд Милосердие', count: 7, logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop' },
      { id: 2, name: 'Детский фонд', count: 12, logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&h=100&fit=crop' },
      { id: 3, name: 'Забота о пожилых', count: 9, logo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=100&h=100&fit=crop' },
      { id: 4, name: 'Помощь животным', count: 15, logo: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=100&h=100&fit=crop' }
    ];

    const beneficiaries = [
      { id: 1, name: 'Алия Сапарова', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=300&fit=crop', goal: 500000, raised: 320000, imgH: 150 },
      { id: 2, name: 'Нурлан Жумабаев', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', goal: 1200000, raised: 890000, imgH: 110 },
      { id: 3, name: 'Айгерим Токтарова', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', goal: 750000, raised: 150000, imgH: 120 },
      { id: 4, name: 'Ерлан Касымов', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop', goal: 300000, raised: 275000, imgH: 160 },
      { id: 5, name: 'Дана Муратова', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=300&fit=crop', goal: 600000, raised: 410000, imgH: 140 },
      { id: 6, name: 'Асет Бекмуратов', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', goal: 900000, raised: 90000, imgH: 100 },
      { id: 7, name: 'Мадина Жексенбай', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=300&fit=crop', goal: 450000, raised: 380000, imgH: 130 },
    ];

    const formatSum = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' млн';
      if (num >= 1000) return Math.round(num / 1000) + ' тыс';
      return num.toString();
    };

    return (
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto mb-6" data-name="partner-funds" data-file="components/PartnerFunds.js">
        <div className="bg-[#f0f6ff] rounded-xl mx-1 md:mx-0 pt-4 pb-3 mb-8 md:p-6">
          <div className="flex items-center gap-2 mb-3 px-4 md:px-0 md:mb-4">
            <div className="icon-building-2 text-[18px] md:text-[22px] text-black"></div>
            <h2 className="text-[18px] md:text-[22px] font-semibold text-[var(--text-primary)]">
              Фонды-партнёры
            </h2>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            .funds-container { width: max-content; }
            .fund-card { width: 95px; flex-shrink: 0; }
            @media (min-width: 768px) {
              .funds-container { width: auto; }
              .fund-card { width: auto; flex: 1; flex-shrink: 1; }
            }
          `}} />
          <div className="overflow-x-auto md:overflow-visible scrollbar-hide px-4 md:px-0" style={{ marginRight: '-4px' }}>
            <div className="funds-container flex gap-3 md:gap-4">
              {funds.map((fund) => (
                <div
                  key={fund.id}
                  className="fund-card bg-white rounded-xl flex flex-col cursor-pointer"
                >
                  <div className="mx-[5px] mt-[5px] h-[58px] md:h-[80px] rounded-lg overflow-hidden">
                    <img src={fund.logo} alt={fund.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex-1 flex flex-col">
                    <p className="text-[13px] md:text-[14px] font-medium text-black leading-tight" style={{ minHeight: '32px', display: 'flex', alignItems: 'center' }}>
                      {fund.name}
                    </p>
                    <p className="text-[11px] md:text-[12px] text-[var(--text-secondary)] mt-1">
                      {fund.count} подопечных
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-[18px] md:text-[22px] font-semibold text-[var(--text-primary)] mb-4 md:mb-6 px-4 md:px-0">
          Подопечные
        </h2>
        <div className="px-3 md:px-0" style={{ columnGap: '16px' }}>
          <style dangerouslySetInnerHTML={{ __html: `
            .beneficiaries-grid { columns: 2; }
            @media (min-width: 768px) { .beneficiaries-grid { columns: 3; } }
            @media (min-width: 1024px) { .beneficiaries-grid { columns: 4; } }
          `}} />
          <div className="beneficiaries-grid" style={{ columnGap: '16px' }}>
            {beneficiaries.map((person) => (
              <div
                key={person.id}
                className="rounded-xl cursor-pointer mb-4"
                style={{ breakInside: 'avoid' }}
              >
                <div
                  className="w-full rounded-xl overflow-hidden relative"
                  style={{
                    height: person.imgH + 'px',
                    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{ boxShadow: 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
                  ></div>
                </div>
                <div className="px-1 pt-2">
                  <p className="text-[13px] md:text-[15px] font-semibold text-black leading-tight mb-2">
                    {person.name}
                  </p>
                  <div className="w-full h-[6px] bg-[#E8E8E8] rounded-full mb-1">
                    <div
                      className="h-full bg-[var(--primary-color)] rounded-full"
                      style={{ width: Math.round((person.raised / person.goal) * 100) + '%' }}
                    ></div>
                  </div>
                  <p className="text-[10px] md:text-[12px] text-[var(--text-secondary)] mb-2">
                    {formatSum(person.raised)} ₸ из {formatSum(person.goal)} ₸
                  </p>
                  <button className="w-full py-[6px] md:py-2 bg-[var(--primary-color)] text-white text-[12px] md:text-[13px] font-semibold rounded-lg active:scale-95 transition-transform">
                    Помочь
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('PartnerFunds component error:', error);
    return null;
  }
}
