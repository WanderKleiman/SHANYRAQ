import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';

function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('collection_status', 'reported')
        .order('completion_date', { ascending: false });
      
      if (error) throw error;

      const formatted = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.report_description,
        amount: item.raised_amount,
        completedDate: item.completion_date,
        image: item.report_photos?.[0] || item.image_url,
        category: getCategoryName(item.category),
        categoryName: getCategoryName(item.category),
        reportPhotos: item.report_photos || [item.image_url],
        reportVideos: item.report_videos || [],
        partnerFund: item.partner_fund
      }));
      
      setReports(formatted);
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
            <Icon name="arrow-left" size={20} />
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
            <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin mx-auto mb-2" />
            <p className='text-[var(--text-secondary)]'>Загрузка отчетов...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className='text-center py-8'>
            <Icon name="file-text" size={32} className="text-gray-400 mx-auto mb-4" />
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
                          {report.amount?.toLocaleString()} ₸
                        </span>
                      </div>
                      {report.completedDate && (
                        <span className='text-xs text-[var(--text-secondary)]'>
                          {new Date(report.completedDate).toLocaleDateString('ru-RU')}
                        </span>
                      )}
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
