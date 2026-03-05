function CharityModal({ data, onClose, onHelpClick }) {
  const [currentMediaIndex, setCurrentMediaIndex] = React.useState(0);
  const progressPercentage = (data.raised / data.target) * 100;
  const remainingAmount = data.target - data.raised;

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const media = [{ type: 'image', url: data.image }];
  if (data.images && data.images.length > 0) {
    data.images.forEach(image => {
      if (image !== data.image) media.push({ type: 'image', url: image });
    });
  }
  if (data.videos && data.videos.length > 0) {
    data.videos.forEach(video => media.push({ type: 'video', url: video }));
  }

  return (
    <div className='fixed inset-0 z-50 flex items-end md:items-center md:justify-center p-0 md:p-4' onClick={onClose}>
      <div className='absolute inset-0 bg-black bg-opacity-50' />
      <div className='bg-[var(--bg-primary)] w-full md:w-auto md:max-w-[600px] rounded-t-3xl md:rounded-2xl max-h-[85vh] md:max-h-[90vh] relative z-10 overflow-y-auto' onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className='absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center z-30 hover:bg-opacity-100 shadow-lg'>
          <div className='icon-x text-sm' />
        </button>
        
        <div className='relative h-64 md:h-96'>
          <img src={media[currentMediaIndex].url} alt={data.title} className='w-full h-64 md:h-96 object-cover rounded-t-3xl md:rounded-t-2xl' />
          <div className='absolute top-3 left-3 z-10'>
            <span className='bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-sm font-medium'>
              {data.categoryName}
            </span>
          </div>
        </div>

        <div className='p-6 pb-24'>
          <div className='space-y-4'>
            <h3 className='text-xl font-bold text-[var(--text-primary)]'>{data.title}</h3>
            <p className='text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap'>{data.description}</p>
            <div className='flex items-center space-x-2 text-sm'>
              <div className='icon-shield-check text-lg text-[var(--primary-color)]' />
              <a href={`fund.html?name=${encodeURIComponent(data.partnerFund)}`} className='text-[var(--primary-color)] hover:underline'>
                Фонд "{data.partnerFund}"
              </a>
            </div>
            <div className='space-y-3 bg-[var(--bg-secondary)] p-4 rounded-xl'>
              <div className='flex justify-between text-sm'>
                <span className='text-[var(--text-secondary)]'>Собрано</span>
                <span className='font-semibold text-[var(--text-primary)]'>
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
          </div>
        </div>
        
        <div className='absolute bottom-4 left-4 right-4 flex space-x-3 z-20'>
          <button onClick={onHelpClick} className='btn-primary flex-1 shadow-lg'>Помочь</button>
        </div>
      </div>
    </div>
  );
}