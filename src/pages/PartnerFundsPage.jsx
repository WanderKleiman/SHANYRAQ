import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCachedData, setCachedData } from '../utils/dataCache';

function PartnerFundsPage() {
  const navigate = useNavigate();
  const [funds, setFunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFunds();
  }, []);

  const loadFunds = async () => {
    try {
      const cached = getCachedData('partner_funds');
      if (cached) {
        setFunds(cached);
        setIsLoading(false);
        return;
      }

      const result = await window.trickleListObjects('partner_fund', 50, true);
      const fundsData = result.items.map(item => ({
        id: item.objectId,
        name: item.objectData.name,
        description: item.objectData.description,
        logo: item.objectData.logo_url,
        verified: item.objectData.is_verified
      }));
      
      setCachedData('partner_funds', fundsData);
      setFunds(fundsData);
    } catch (error) {
      console.error('Error loading funds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundClick = (fundName) => {
    navigate(`/fund/${encodeURIComponent(fundName)}`);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <div className='text-center'>
          <div className='icon-loader text-2xl text-[var(--primary-color)] animate-spin mx-auto mb-2' />
          <p>Загрузка фондов...</p>
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
            <div className='icon-arrow-left text-lg' />
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

        <div className='space-y-4'>
          {funds.map(fund => (
            <div key={fund.id} className='card cursor-pointer' onClick={() => handleFundClick(fund.name)}>
              <div className='flex items-center space-x-4'>
                <div className='relative'>
                  <img 
                    src={fund.logo}
                    alt={fund.name}
                    className='w-16 h-16 object-cover rounded-xl'
                  />
                  {fund.verified && (
                    <div className='absolute -top-1 -right-1 w-6 h-6 bg-[var(--success-color)] rounded-full flex items-center justify-center'>
                      <div className='icon-check text-xs text-white' />
                    </div>
                  )}
                </div>
                
                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-1'>
                    <h3 className='font-semibold text-lg'>{fund.name}</h3>
                  </div>
                  <p className='text-[var(--text-secondary)] text-sm leading-relaxed'>
                    {fund.description}
                  </p>
                </div>
                
                <div className='icon-chevron-right text-lg text-[var(--text-secondary)]' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PartnerFundsPage;