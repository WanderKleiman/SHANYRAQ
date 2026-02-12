import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartnerFunds } from '../hooks/usePartnerFunds';
import Icon from '../components/Icon';
import { optimizeImage } from '../utils/imageUtils';

function PartnerFundsPage() {
  const navigate = useNavigate();
  const { funds, loading, error } = usePartnerFunds();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]'>
        <Icon name="loader" size={32} className="text-[var(--primary-color)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4'>
        <div className='text-center'>
          <Icon name="alert-circle" size={48} className="text-red-500 mx-auto mb-4" />
          <p className='text-[var(--text-secondary)]'>Ошибка загрузки фондов</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)] pb-20'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4 sticky top-0 z-10'>
        <div className='flex items-center space-x-3'>
          <button 
            onClick={() => navigate(-1)}
            className='w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center'
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <h1 className='text-xl font-bold'>Фонды-партнёры</h1>
        </div>
      </header>

      <div className='p-4'>
        <p className='text-[var(--text-secondary)] mb-4'>
          Наши партнёры - верифицированные благотворительные фонды Казахстана
        </p>

        <div className='space-y-3'>
          {funds.length === 0 ? (
            <div className='text-center py-12'>
              <Icon name="inbox" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className='text-[var(--text-secondary)]'>Пока нет партнёрских фондов</p>
            </div>
          ) : (
            funds.map(fund => (
              <div
                key={fund.id}
                className='card cursor-pointer'
                onClick={() => navigate(`/fund/${encodeURIComponent(fund.name)}`)}
              >
                <div className='flex items-center space-x-4'>
                  <div className='relative'>
                    <img
                      src={optimizeImage(fund.logo_url, { width: 80, quality: 75 })}
                      alt={fund.name}
                      className='w-16 h-16 object-contain rounded-lg'
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64?text=' + fund.name.charAt(0);
                      }}
                    />
                    {fund.is_verified && (
                      <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--success-color)] rounded-full flex items-center justify-center'>
                        <Icon name="check" size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold'>{fund.name}</h3>
                    <p className='text-sm text-[var(--text-secondary)] line-clamp-2'>{fund.description}</p>
                  </div>
                  <Icon name="chevron-right" size={20} className="text-[var(--text-secondary)]" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PartnerFundsPage;
