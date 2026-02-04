import React from 'react';

function Header() {
  return (
    <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)]' data-name='header' data-file='src/components/Header.jsx'>
      <div className='px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-full flex items-center justify-center'>
              <img
                src='https://app.trickle.so/storage/public/images/usr_140a45f300000001/86eeabeb-ea74-4381-9f41-405f827fda21.png'
                alt='Шанырак логотип'
                className='w-10 h-10 object-contain'
              />
            </div>
            <div>
              <h1 className='text-xl font-bold text-[var(--text-primary)]'>Шанырак</h1>
              <p className='text-sm text-[var(--text-secondary)]'>Благотворительная платформа</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;