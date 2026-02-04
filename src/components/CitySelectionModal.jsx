import React from 'react';

function CitySelectionModal({ onCitySelect }) {
  const cities = [
    'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Караганда', 'Тараз',
    'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау', 'Кызылорда',
    'Актау', 'Костанай', 'Уральск', 'Туркестан', 'Петропавловск',
    'Кокшетау', 'Темиртау', 'Талдыкорган', 'Экибастуз'
  ];

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-[var(--bg-primary)] rounded-[var(--card-radius)] p-6 w-full max-w-md max-h-[80vh] flex flex-col relative'>
        <button 
          onClick={() => window.location.reload()}
          className='absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200'
        >
          <div className='icon-x text-sm' />
        </button>
        
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-[var(--primary-color)] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4'>
            <div className='icon-map text-2xl text-[var(--primary-color)]' />
          </div>
          <h2 className='text-xl font-bold mb-2'>Помогайте тем, кто рядом</h2>
          <p className='text-sm text-[var(--text-secondary)]'>
            Выберите город
          </p>
        </div>
        
        <div className='overflow-y-auto space-y-2 flex-1'>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => onCitySelect(city)}
              className='w-full text-left p-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--primary-color)] hover:text-white transition-colors'
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CitySelectionModal;
