import React, { useState, useEffect, useRef } from 'react';

function CharityModal({ data, onClose }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const scrollContainerRef = useRef(null);
  
  const progressPercentage = (data.raised / data.target) * 100;
  const remainingAmount = data.target - data.raised;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const media = [];
  media.push({ type: 'image', url: data.image });
  if (data.images && data.images.length > 0) {
    data.images.forEach(image => {
      if (image !== data.image) {
        media.push({ type: 'image', url: image });
      }
    });
  }
  if (data.videos && data.videos.length > 0) {
    data.videos.forEach(video => media.push({ type: 'video', url: video }));
  }

  const handleHelp = () => {
    window.location.href = `payment.html?id=${data.id}`;
  };

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

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentX);
    setTouchEndY(currentY);
    
    if (isDragging && scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      const offsetY = currentY - touchStartY;
      const offsetX = Math.abs(currentX - touchStart);
      
      if (scrollTop === 0 && offsetY > 0 && offsetY > offsetX) {
        e.preventDefault();
        setDragOffset(offsetY);
      } else if (scrollTop > 0 || offsetY < 0) {
        setDragOffset(0);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (touchStartY && touchEndY && scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      const distanceY = touchEndY - touchStartY;
      
      if (scrollTop === 0 && distanceY > 100) {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
        }, 200);
        return;
      }
    }
    
    setDragOffset(0);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && media.length > 1) {
      nextMedia();
    }
    if (isRightSwipe && media.length > 1) {
      prevMedia();
    }
  };

  const getVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end md:items-center md:justify-center p-0 md:p-4' onClick={onClose}>
      <div 
        className='absolute inset-0 bg-black transition-opacity'
        style={{ 
          opacity: isClosing ? 0 : Math.max(0.5 - (dragOffset / 1000), 0),
          transition: isClosing || isDragging ? 'none' : 'opacity 0.2s ease-out'
        }}
      />
      
      <div 
        className='bg-[var(--bg-primary)] w-full md:w-auto md:max-w-[600px] rounded-t-3xl md:rounded-2xl max-h-[85vh] md:max-h-[90vh] relative z-10'
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translateY(${isClosing ? '100%' : dragOffset + 'px'})`,
          transition: isClosing ? 'transform 0.2s ease-out' : isDragging && dragOffset > 0 ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        <button 
          onClick={onClose}
          className='absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center z-30 hover:bg-opacity-100 shadow-lg'
        >
          <div className='icon-x text-sm' />
        </button>

        <div 
          ref={scrollContainerRef}
          className='overflow-y-auto max-h-[85vh] md:max-h-[90vh] pb-20'
        >
          <div className='relative h-64 md:h-96'>
            {media[currentMediaIndex]?.type === 'image' ? (
              <img 
                src={media[currentMediaIndex].url} 
                alt={data.title}
                loading='lazy'
                className='w-full h-64 md:h-96 object-cover rounded-t-3xl md:rounded-t-2xl'
              />
            ) : media[currentMediaIndex]?.type === 'video' ? (
              <div className='w-full h-64 md:h-96 bg-black flex items-center justify-center'>
                {getVideoId(media[currentMediaIndex].url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getVideoId(media[currentMediaIndex].url)}`}
                    className='w-full h-full'
                    frameBorder='0'
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={media[currentMediaIndex].url}
                    className='w-full h-full object-cover'
                    controls
                  />
                )}
              </div>
            ) : null}
            
            <div className='absolute top-3 left-3 z-10'>
              <span className='bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-sm font-medium'>
                {data.categoryName}
              </span>
            </div>
            
            {media.length > 1 && (
              <>
                <button 
                  onClick={prevMedia}
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all z-10'
                >
                  <div className='icon-chevron-left text-lg' />
                </button>
                <button 
                  onClick={nextMedia}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all z-10'
                >
                  <div className='icon-chevron-right text-lg' />
                </button>
                <div className='absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10'>
                  {media.map((_, index) => (
                    <div 
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentMediaIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className='p-6 pb-6'>
            <div className='space-y-4'>
              <h3 className='text-xl font-bold text-[var(--text-primary)]'>{data.title}</h3>

              {data.documentsLink && (
                <a
                  href={data.documentsLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center space-x-2 text-sm bg-green-50 text-green-700 p-3 rounded-xl hover:bg-green-100 transition-colors'
                >
                  <div className='icon-file-text text-lg text-green-600' />
                  <span className='flex-1'>Документы, подтверждающие сбор</span>
                  <div className='icon-external-link text-sm' />
                </a>
              )}
              
              <p className='text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap'>{data.description}</p>
              
              <div className='flex items-center space-x-2 text-sm'>
                <div className='icon-shield-check text-lg text-[var(--primary-color)]' />
                <a 
                  href={`fund.html?name=${encodeURIComponent(data.partnerFund)}`}
                  className='text-[var(--primary-color)] hover:underline'
                >
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
                
                <div className='progress-bar'>
                  <div 
                    className='progress-fill'
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                
                <div className='flex justify-between items-center text-sm text-[var(--text-secondary)]'>
                  <span>Осталось собрать: {remainingAmount.toLocaleString()} ₸</span>
                  {data.helpersCount && (
                    <span>Помогли: {data.helpersCount} человек</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className='absolute bottom-4 left-4 right-4 flex space-x-3 z-20'>
          <button 
            onClick={handleHelp}
            className='btn-primary flex-1 shadow-lg'
          >
            Помочь
          </button>
          <button 
            onClick={handleShare}
            className='btn-secondary w-12 h-12 flex items-center justify-center p-0 shadow-lg'
          >
            <div className='icon-share-2 text-lg' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharityModal;