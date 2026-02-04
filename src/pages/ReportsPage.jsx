import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCachedData, setCachedData } from '../utils/dataCache';

function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    localStorage.setItem('activeTab', 'reports');
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      
      const cached = getCachedData('reports');
      if (cached) {
        setReports(cached);
        setIsLoading(false);
        return;
      }

      const result = await window.trickleListObjects('charity_beneficiary', 50, true);
      const reportedBeneficiaries = result.items
        .filter(item => item.objectData.collection_status === 'reported')
        .map(item => ({
          id: item.objectId,
          title: item.objectData.title,
          description: item.objectData.report_description,
          amount: item.objectData.raised_amount,
          completedDate: item.objectData.completion_date,
          image: item.objectData.report_photos?.[0] || item.objectData.image_url,
          category: getCategoryName(item.objectData.category),
          categoryName: getCategoryName(item.objectData.category),
          reportPhotos: item.objectData.report_photos || [item.objectData.image_url],
          reportVideos: item.objectData.report_videos || [],
          partnerFund: item.objectData.partner_fund
        }));
      
      setCachedData('reports', reportedBeneficiaries);
      setReports(reportedBeneficiaries);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (category) => {
    const categories = {
      children: 'Дети',
      urgent: 'Срочные',
      operations: 'Операции',
      animals: 'Животные',
      social: 'Социальные программы',
      non_material: 'Не материальная помощь'
    };
    return categories[category] || category;
  };

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
        <div className='flex items-center space-x-3'>
          <button 
            onClick={() => navigate('/')}
            className='w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center'
          >
            <div className='icon-arrow-left text-lg' />
          </button>
          <h1 className='text-xl font-bold'>Отчеты</h1>
        </div>
      </header>

      <div className='p-4 pb-20'>
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-2'>Успешно завершенные проекты</h2>
          <p className='text-[var(--text-secondary)] text-sm'>
            Благодаря вашей поддержке мы смогли помочь многим людям
          </p>
        </div>

        {isLoading ? (
          <div className='text-center py-8'>
            <div className='icon-loader text-2xl text-[var(--primary-color)] animate-spin mx-auto mb-2' />
            <p className='text-[var(--text-secondary)]'>Загрузка отчетов...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className='text-center py-8'>
            <div className='icon-file-text text-3xl text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium mb-2'>Нет отчетов</h3>
            <p className='text-[var(--text-secondary)]'>Пока нет опубликованных отчетов</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {reports.map(report => (
              <div 
                key={report.id} 
                className='card cursor-pointer hover:scale-[1.02] transition-transform'
                onClick={() => setSelectedReport(report)}
              >
                <div className='flex space-x-4'>
                  <img 
                    src={report.image}
                    alt={report.title}
                    className='w-20 h-20 object-cover rounded-xl flex-shrink-0'
                  />
                  <div className='flex-1'>
                    <div className='flex items-start justify-between mb-2'>
                      <h3 className='font-semibold text-[var(--text-primary)] leading-tight'>
                        {report.title}
                      </h3>
                      <span className='bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs'>
                        {report.category}
                      </span>
                    </div>
                    
                    <p className='text-[var(--text-secondary)] text-sm mb-3 line-clamp-2'>
                      {report.description}
                    </p>
                    
                    <div className='flex justify-between items-center'>
                      <div className='text-sm'>
                        <span className='text-[var(--text-secondary)]'>Собрано: </span>
                        <span className='font-medium text-[var(--primary-color)]'>
                          {report.amount.toLocaleString()} ₸
                        </span>
                      </div>
                      <span className='text-xs text-[var(--text-secondary)]'>
                        {new Date(report.completedDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
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

export default ReportsPage;