import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

function AboutFundPage() {
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
          <h1 className='text-xl font-bold'>О фонде "Шанырак"</h1>
        </div>
      </header>

      <div className='p-4 pb-20'>
        <div className='card mb-4'>
          <div className='text-center mb-6'>
            <img 
              src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/14.png' 
              alt='Шанырак логотип'
              className='w-20 h-20 object-contain mx-auto mb-4'
            />
            <h2 className='text-2xl font-bold mb-2'>Благотворительный фонд "Шанырак"</h2>
            <p className='text-[var(--text-secondary)]'>Помогаем тем, кто в этом нуждается</p>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='card'>
            <h3 className='text-lg font-semibold mb-3'>Наша миссия</h3>
            <p className='text-[var(--text-secondary)] leading-relaxed'>
              Благотворительный фонд "Шанырак" создан для оказания помощи детям, животным и людям, 
              оказавшимся в трудной жизненной ситуации. Мы объединяем усилия неравнодушных людей 
              и организаций для решения социальных проблем.
            </p>
          </div>

          <div className='card'>
            <h3 className='text-lg font-semibold mb-3'>Что мы делаем</h3>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <Icon name="heart" size={20} className="text-[var(--primary-color)]" />
                <span>Помощь детям в сложных жизненных ситуациях</span>
              </div>
              <div className='flex items-center space-x-3'>
                <Icon name="activity" size={20} className="text-[var(--primary-color)]" />
                <span>Сбор средств на медицинские операции</span>
              </div>
              <div className='flex items-center space-x-3'>
                <Icon name="zap" size={20} className="text-[var(--primary-color)]" />
                <span>Экстренная помощь в чрезвычайных ситуациях</span>
              </div>
              <div className='flex items-center space-x-3'>
                <Icon name="heart" size={20} className="text-[var(--primary-color)]" />
                <span>Поддержка приютов для животных</span>
              </div>
            </div>
          </div>

          <div className='card'>
            <h3 className='text-lg font-semibold mb-3'>Контактная информация</h3>
            <div className='space-y-2'>
              <p><strong>Email:</strong> info@shanyraq.ru</p>
              <p><strong>Телефон:</strong> +7 747 150 45 45</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutFundPage;