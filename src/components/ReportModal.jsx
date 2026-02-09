import React, { useState } from 'react';
import Icon from './Icon';

function ReportModal({ report, onClose }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const media = [];
  if (report.reportPhotos && report.reportPhotos.length > 0) {
    report.reportPhotos.forEach(photo => media.push({ type: 'image', url: photo }));
  }
  if (report.reportVideos && report.reportVideos.length > 0) {
    report.reportVideos.forEach(video => media.push({ type: 'video', url: video }));
  }

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const getVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center md:justify-center z-50 p-0 md:p-4' onClick={onClose}>
      <div 
        className='bg-[var(--bg-primary)] w-full md:w-auto md:max-w-[600px] rounded-t-3xl md:rounded-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto relative'
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className='absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center z-20 hover:bg-opacity-100 shadow-lg'
        >
          <Icon name="x" size={16} />
        </button>

        <div className='flex flex-col'>
          {media.length > 0 && (
            <div className='relative h-64 md:h-96'>
              {media[currentMediaIndex]?.type === 'image' ? (
                <img 
                  src={media[currentMediaIndex].url} 
                  alt="Отчетное фото"
                  className='w-full h-64 md:h-96 object-cover'
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
                  {report.categoryName}
                </span>
              </div>
              
              {media.length > 1 && (
                <>
                  <button 
                    onClick={prevMedia}
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all z-10'
                  >
                    <Icon name="chevron-left" size={20} />
                  </button>
                  <button 
                    onClick={nextMedia}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all z-10'
                  >
                    <Icon name="chevron-right" size={20} />
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
          )}

          <div className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-bold text-[var(--text-primary)]'>
                  {report.title}
                </h3>
                <div className='text-right'>
                  <div className='text-sm text-[var(--text-secondary)]'>Собрано</div>
                  <div className='text-lg font-bold text-[var(--primary-color)]'>
                    {report.amount?.toLocaleString()} ₸
                  </div>
                </div>
              </div>
              
              <div className='flex items-center space-x-2 text-sm'>
                <Icon name="shield-check" size={18} className="text-[var(--primary-color)]" />
                <span className='text-[var(--primary-color)]'>
                  Фонд "{report.partnerFund}"
                </span>
              </div>

              <div className='bg-[var(--bg-secondary)] p-4 rounded-xl'>
                <h4 className='font-semibold mb-2'>Отчет об оказанной помощи</h4>
                <p className='text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap'>
                  {report.description}
                </p>
              </div>

              {report.completedDate && (
                <div className='text-sm text-[var(--text-secondary)]'>
                  Отчет опубликован: {new Date(report.completedDate).toLocaleDateString('ru-RU')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
