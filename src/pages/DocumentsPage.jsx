import React from 'react';
import { useNavigate } from 'react-router-dom';

function DocumentsPage() {
  const navigate = useNavigate();

  const documents = [
    {
      id: 1,
      name: "Справка о государственной регистрации",
      icon: "file-badge",
      url: "https://drive.google.com/file/d/1Yjmb3JT3hedfmooYP9mgJkXITljzrkeh/view?usp=sharing"
    },
    {
      id: 2,
      name: "Устав фонда",
      icon: "scroll-text",
      url: "https://drive.google.com/file/d/1SMoij-2LdXEo95coR9x1Dpd0fXIt3gZT/view?usp=sharing"
    },
    {
      id: 3,
      name: "Политика конфиденциальности",
      icon: "shield-check",
      url: "https://doc.shanyrak.world/policy"
    },
    {
      id: 4,
      name: "Публичная оферта",
      icon: "file-check",
      url: "https://doc.shanyrak.world/soglashenie"
    },
    {
      id: 5,
      name: "Пользовательское соглашение",
      icon: "file-text",
      url: "https://doc.shanyrak.world/soglashenie"
    },
    {
      id: 6,
      name: "Политика обработки персональных данных",
      icon: "database",
      url: "https://doc.shanyrak.world/obrabotka"
    }
  ];

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
          <h1 className='text-xl font-bold'>Документы</h1>
        </div>
      </header>

      <div className='p-4 pb-20'>
        <div className='mb-6'>
          <p className='text-[var(--text-secondary)] leading-relaxed'>
            Официальные документы и отчетность благотворительного фонда "Шанырак"
          </p>
        </div>

        <div className='space-y-4'>
          {documents.map(doc => (
            <a 
              key={doc.id} 
              href={doc.url}
              target='_blank'
              rel='noopener noreferrer'
              className='card cursor-pointer hover:bg-gray-50 block no-underline'
            >
              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center'>
                  <div className={`icon-${doc.icon} text-xl text-[var(--primary-color)]`} />
                </div>
                
                <div className='flex-1'>
                  <h3 className='font-semibold text-lg mb-1 text-[var(--text-primary)]'>{doc.name}</h3>
                  <div className='text-sm text-[var(--text-secondary)]'>
                    Открыть в новой вкладке
                  </div>
                </div>
                
                <div className='icon-external-link text-lg text-[var(--text-secondary)]' />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;