import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminAccessPage() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='card text-center'>
          <div className='w-20 h-20 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-6'>
            <div className='icon-shield text-3xl text-white' />
          </div>
          
          <h1 className='text-2xl font-bold text-[var(--text-primary)] mb-4'>
            Административный доступ
          </h1>
          
          <p className='text-[var(--text-secondary)] mb-8 leading-relaxed'>
            Эта страница предназначена для администраторов фонда "Шанырак". 
            Здесь вы можете управлять подопечными, редактировать информацию 
            о проектах и отслеживать прогресс сборов.
          </p>

          <div className='space-y-4'>
            <button
              onClick={() => navigate('/admin')}
              className='btn-primary w-full flex items-center justify-center space-x-2'
            >
              <div className='icon-settings text-lg' />
              <span>Перейти в админ-панель</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className='btn-secondary w-full flex items-center justify-center space-x-2'
            >
              <div className='icon-arrow-left text-lg' />
              <span>Вернуться на главную</span>
            </button>
          </div>

          <div className='mt-8 p-4 bg-[var(--bg-secondary)] rounded-xl'>
            <h3 className='font-semibold mb-2'>Доступ для администраторов</h3>
            <p className='text-sm text-[var(--text-secondary)]'>
              Если у вас есть права администратора, используйте свои учетные данные для входа в систему управления.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAccessPage;