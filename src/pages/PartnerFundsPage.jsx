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
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <div className='text-center'>
          <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin mx-auto mb-2" />
          <p>Загрузка фондов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <div className='text-center text-red-500'>
          <p>Ошибка загрузки: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => navigate(-1)}
            className='w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center'
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <h1 className='text-xl font-bold'>Фонды партнеры</h1>
        </div>
      </header>

      <div className='p-4 pb-20'>
        <div className='mb-6'>
          <p className='text-[var(--text-secondary)] leading-relaxed'>
            Мы работаем с проверенными благотворительными фондами, которые имеют многолетний опыт помощи людям.
          </p>
        </div>

        {funds.length === 0 ? (
          <div className='text-center py-8'>
            <Icon name="users" size={32} className="text-gray-400 mx-auto mb-4" />
            <p className='text-[var(--text-secondary)]'>Нет фондов-партнёров</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {funds.map(fund => (
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
                      className='w-16 h-16 object-cover rounded-xl'
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64?text=' + fund.name.charAt(0);
                      }}
                    />
                    {fund.is_verified && (
                      <div className='absolute -top-1 -right-1 w-6 h-6 bg-[var(--success-color)] rounded-full flex items-center justify-center'>
                        <Icon name="check" size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <h3 className='font-semibold text-lg'>{fund.name}</h3>
                    </div>
                    <p className='text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2'>
                      {fund.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PartnerFundsPage;
