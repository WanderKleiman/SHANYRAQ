import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

function ContactsPage() {
  const navigate = useNavigate();

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
          <h1 className='text-xl font-bold'>Контакты</h1>
        </div>
      </header>

      <div className='p-4 pb-20'>
        <div className='space-y-4'>
          <div className='card'>
            <h3 className='text-lg font-bold mb-2'>Если вам нужна помощь</h3>
            <p className='text-sm italic text-[var(--text-secondary)] mb-3'>
              Для подопечных, семей в трудной ситуации или тех, кто ищет поддержку
            </p>
            <a 
              href='https://forms.gle/NeCsKxrgffVim3SM9'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center space-x-2 bg-[var(--primary-color)] text-white px-6 py-3 rounded-[var(--button-radius)] font-medium transition-all duration-200 hover:opacity-90 active:scale-95 no-underline'
            >
              <Icon name="file-edit" size={20} />
              <span>Заполните форму</span>
            </a>
          </div>

          <div className='card'>
            <h3 className='text-lg font-bold mb-2'>Для волонтёров</h3>
            <p className='text-sm text-[var(--text-secondary)] mb-3'>
              Хотите присоединиться к нашей команде и помогать большому делу?
            </p>
            <a 
              href='https://wa.me/77471504545'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center space-x-2 bg-[var(--primary-color)] text-white px-6 py-3 rounded-[var(--button-radius)] font-medium transition-all duration-200 hover:opacity-90 active:scale-95 no-underline'
            >
              <Icon name="users" size={20} />
              <span>Волонтерам</span>
            </a>
          </div>

          <div className='card'>
            <h3 className='text-lg font-bold mb-2'>Для партнёров и других фондов</h3>
            <p className='text-sm text-[var(--text-secondary)] mb-3'>
              Создаем вместе благие дела и совместные проекты
            </p>
            <div className='space-y-2'>
              <a 
                href='https://wa.me/77471504545'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center space-x-2 text-[var(--primary-color)] hover:underline'
              >
                <Icon name="message-circle" size={20} />
                <span>Связаться в WhatsApp</span>
                <Icon name="external-link" size={16} />
              </a>
              <a 
                href='mailto:info@shanyraq.ru'
                className='flex items-center space-x-2 text-[var(--primary-color)] hover:underline'
              >
                <Icon name="mail" size={20} />
                <span>Написать на почту info@shanyraq.ru</span>
              </a>
            </div>
          </div>

          <div className='card'>
            <h3 className='text-lg font-bold mb-4'>Общая информация</h3>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <Icon name="mail" size={20} className="text-[var(--primary-color)]" />
                <a href='mailto:info@shanyraq.ru' className='text-[var(--primary-color)] hover:underline'>
                  info@shanyraq.ru
                </a>
              </div>
              <div className='flex items-center space-x-3'>
                <Icon name="instagram" size={20} className="text-[var(--primary-color)]" />
                <span className='text-[var(--text-secondary)]'>Скоро появится</span>
              </div>
            </div>
          </div>

          <div className='card'>
            <h3 className='text-lg font-bold mb-3'>Реквизиты организации</h3>
            <div className='space-y-2 text-sm'>
              <p className='font-medium'>Частный благотворительный фонд "Шанырак комек"</p>
              <p className='text-[var(--text-secondary)]'>БИК: 230440020759</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactsPage;