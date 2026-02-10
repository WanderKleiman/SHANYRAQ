import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CharityCard from '../components/CharityCard';
import CharityModal from '../components/CharityModal';
import Icon from '../components/Icon';
import { optimizeImage } from '../utils/imageUtils';

function FundDetailPage() {
  const navigate = useNavigate();
  const { name } = useParams();
  const [fund, setFund] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Загружаем информацию о фонде
        const { data: fundData, error: fundError } = await supabase
          .from('partner_funds')
          .select('*')
          .eq('name', decodeURIComponent(name))
          .single();
        
        if (fundError) throw fundError;
        setFund(fundData);

        // Загружаем подопечных этого фонда
        const { data: beneficiariesData, error: beneficiariesError } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('partner_fund', decodeURIComponent(name))
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (beneficiariesError) throw beneficiariesError;
        
        // Форматируем данные
        const formatted = beneficiariesData.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          categoryName: getCategoryName(item.category),
          partnerFund: item.partner_fund,
          image: item.image_url,
          images: item.images || [item.image_url],
          videos: item.videos || [],
          helpersCount: item.helpers_count,
          documentsLink: item.documents_link,
          raised: item.raised_amount || 0,
          target: item.target_amount || 0,
          isUrgent: item.is_urgent,
          collectionStatus: item.collection_status
        }));
        
        setBeneficiaries(formatted);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [name]);

  if (loading) {
    return (
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin" />
      </div>
    );
  }

  if (!fund) {
    return (
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-[var(--text-secondary)] mb-4'>Фонд не найден</p>
          <button onClick={() => navigate(-1)} className='btn-primary'>
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen bg-[var(--bg-secondary)]'>
        <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => navigate(-1)}
              className='w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center'
            >
              <Icon name="arrow-left" size={20} />
            </button>
            <h1 className='text-xl font-bold'>{fund.name}</h1>
          </div>
        </header>

        <div className='p-4 pb-20'>
          {/* Карточка с информацией о фонде */}
          <div className='card mb-6'>
            <div className='flex items-start space-x-4'>
              <img
                src={optimizeImage(fund.logo_url, { width: 80, quality: 75 })}
                alt={fund.name}
                className='w-20 h-20 object-cover rounded-xl'
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80?text=' + fund.name.charAt(0);
                }}
              />
              <div className='flex-1'>
                <div className='flex items-center space-x-2 mb-2'>
                  <h2 className='text-xl font-bold'>{fund.name}</h2>
                  {fund.is_verified && (
                    <div className='w-6 h-6 bg-[var(--success-color)] rounded-full flex items-center justify-center'>
                      <Icon name="check" size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <p className='text-[var(--text-secondary)] text-sm leading-relaxed'>
                  {fund.description}
                </p>
              </div>
            </div>
          </div>

          {/* Список подопечных фонда */}
          <div className='mb-4'>
            <h3 className='text-lg font-semibold mb-3'>
              Подопечные фонда ({beneficiaries.length})
            </h3>
          </div>

          {beneficiaries.length === 0 ? (
            <div className='text-center py-8'>
              <Icon name="users" size={32} className="text-gray-400 mx-auto mb-4" />
              <p className='text-[var(--text-secondary)]'>У этого фонда пока нет подопечных</p>
            </div>
          ) : (
            <div className='cards-grid'>
              {beneficiaries.map(item => (
                <CharityCard 
                  key={item.id} 
                  data={item} 
                  onCardClick={() => setSelectedCharity(item)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCharity && (
        <CharityModal 
          data={selectedCharity} 
          onClose={() => setSelectedCharity(null)} 
        />
      )}
    </>
  );
}

// Хелпер для названий категорий
function getCategoryName(category) {
  const categories = {
    'children': 'Дети',
    'animals': 'Животные',
    'operations': 'Операции',
    'urgent': 'Срочно',
    'non_material': 'Нематериальная помощь'
  };
  return categories[category] || category;
}

export default FundDetailPage;