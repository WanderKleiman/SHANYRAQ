function CharityCard({ data, onCardClick, onHelpClick }) {
  const progressPercentage = (data.raised / data.target) * 100;
  const remainingAmount = data.target - data.raised;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?beneficiary=${data.id}`;
    if (navigator.share) {
      navigator.share({ url: shareUrl }).catch(() => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Ссылка скопирована в буфер обмена');
        });
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Ссылка скопирована в буфер обмена');
      });
    }
  };

  return (
    <div className='card cursor-pointer' data-name='charity-card' data-file='components/CharityCard.js' onClick={onCardClick}>
      <div className='relative mb-4'>
        <img src={data.image} alt={data.title} className='w-full h-48 object-cover rounded-xl' />
        <div className='absolute top-3 left-3'>
          <span className='bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs font-medium'>
            {data.categoryName}
          </span>
        </div>
      </div>
      <div className='space-y-3'>
        <h3 className='text-lg font-semibold text-[var(--text-primary)] leading-tight'>{data.title}</h3>
        <p className='text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-4'>{data.description}</p>
        <div className='flex items-center space-x-2 text-xs'>
          <div className='icon-shield-check text-sm text-[var(--primary-color)]' />
          <a href={`fund.html?name=${encodeURIComponent(data.partnerFund)}`} onClick={(e) => e.stopPropagation()} className='text-[var(--primary-color)] hover:underline'>
            Фонд "{data.partnerFund}"
          </a>
        </div>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-[var(--text-secondary)]'>Собрано</span>
            <span className='font-medium text-[var(--text-primary)]'>
              {data.raised.toLocaleString()} ₸ из {data.target.toLocaleString()} ₸
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
            <div className='h-full bg-[var(--primary-color)] transition-all duration-500 ease-out' style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>
            Осталось собрать: {remainingAmount.toLocaleString()} ₸
          </div>
        </div>
        <div className='flex space-x-3 pt-2'>
          <button onClick={(e) => { e.stopPropagation(); onHelpClick(); }} className='btn-primary flex-1'>
            Помочь
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className='btn-secondary w-12 h-12 flex items-center justify-center p-0'>
            <div className='icon-share-2 text-lg' />
          </button>
        </div>
      </div>
    </div>
  );
}