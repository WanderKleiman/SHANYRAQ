import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';

function BottomNavigation({ selectedCity, onCityChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
    
  const cities = [
    'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Караганда', 'Тараз',
    'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау', 'Кызылорда',
    'Актау', 'Костанай', 'Уральск', 'Туркестан', 'Петропавловск',
    'Кокшетау', 'Темиртау', 'Талдыкорган', 'Экибастуз'
  ];

  const isActive = (path) => location.pathname === path;

  const handleCitySelect = (city) => {
    localStorage.setItem('selectedCity', city);
    onCityChange(city);
    setShowCitySelector(false);
  };

  return (
    <>
      <nav className='fixed bottom-0 left-0 right-0 bg-white bg-opacity-90 border-t border-[var(--border-color)] backdrop-blur-md' data-name='bottom-navigation' data-file='src/components/BottomNavigation.jsx'>
        <div className='flex items-center justify-around py-1'>
          <button 
            onClick={() => navigate('/')}
            className={`flex flex-col items-center space-y-1 py-2 px-4 ${
              isActive('/') ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <img 
              src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/14.webp' 
              alt='Главное'
              className='w-5 h-5 object-contain'
            />
            <span className='text-xs'>Главное</span>
          </button>
          
          <button 
            onClick={() => setShowCitySelector(true)}
            className='flex flex-col items-center space-y-1 py-2 px-4 text-[var(--text-secondary)]'
          >
            <Icon name="map-pin" size={20} />
            <span className='text-xs'>{selectedCity}</span>
          </button>
          
          <button 
            onClick={() => navigate('/reports')}
            className={`flex flex-col items-center space-y-1 py-2 px-4 ${
              isActive('/reports') ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Icon name="file-text" size={20} />
            <span className='text-xs'>Отчеты</span>
          </button>
          
          <button 
            onClick={() => setShowMoreMenu(true)}
            className='flex flex-col items-center space-y-1 py-2 px-4 text-[var(--text-secondary)]'
          >
            <Icon name="menu" size={20} />
            <span className='text-xs'>Еще</span>
          </button>
        </div>
      </nav>

      {showCitySelector && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50' onClick={() => setShowCitySelector(false)}>
          <div 
            className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-4 max-h-[50vh] flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-4 flex-shrink-0'>
              <h3 className='text-lg font-semibold'>Выберите город</h3>
              <button 
                onClick={() => setShowCitySelector(false)}
                className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            
            <div className='overflow-y-auto space-y-2'>
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    city === selectedCity 
                      ? 'bg-[var(--primary-color)] text-white' 
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showMoreMenu && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end z-50'>
          <div className='bg-[var(--bg-primary)] w-full rounded-t-3xl p-4 space-y-2'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Дополнительно</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            
            <button
              onClick={() => {navigate('/about'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="info" size={20} className="text-[var(--primary-color)]" />
              <span>О фонде "Шанырак"</span>
            </button>

            <button
              onClick={() => {navigate('/partner-funds'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="users" size={20} className="text-[var(--primary-color)]" />
              <span>Фонды партнеры</span>
            </button>

            <button
              onClick={() => {navigate('/documents'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="file-text" size={20} className="text-[var(--primary-color)]" />
              <span>Документы</span>
            </button>

            <button
              onClick={() => {navigate('/contacts'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="phone" size={20} className="text-[var(--primary-color)]" />
              <span>Контакты</span>
            </button>

            {/* Спонсоры — скрыто до появления данных
            <button
              onClick={() => window.location.href = 'companies.html'}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="building" size={20} className="text-[var(--primary-color)]" />
              <span>Спонсоры</span>
            </button>
            */}

            <button
              onClick={() => {navigate('/admin-access'); setShowMoreMenu(false);}}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 flex items-center space-x-3'
            >
              <Icon name="shield" size={20} className="text-[var(--primary-color)]" />
              <span>Админ</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default BottomNavigation;