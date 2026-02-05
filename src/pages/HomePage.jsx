import React, { useState, useEffect, useMemo } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import CharityCard from '../components/CharityCard';
import CharityModal from '../components/CharityModal';
import CitySelectionModal from '../components/CitySelectionModal';
import { useBeneficiaries } from '../hooks/useBeneficiaries';
import { ymTrackBeneficiaryView, ymTrackCategoryChange } from '../utils/yandexMetrika';
import Icon from '../components/Icon';

function HomePage({ selectedCity, onCityChange }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(null);

  // Загружаем данные из Supabase
  const { beneficiaries, loading, error } = useBeneficiaries(
    activeCategory === 'all' ? null : activeCategory,
    selectedCity
  );

  console.log('HomePage рендер:', { selectedCity, beneficiariesCount: beneficiaries.length });

  useEffect(() => {
    localStorage.setItem('activeTab', 'home');
    
    const hasSelectedCity = localStorage.getItem('selectedCity');
    if (!hasSelectedCity) {
      setTimeout(() => setShowCitySelector(true), 15000);
    }
  }, []);

  // Преобразуем данные из Supabase в формат компонентов
  const formattedData = useMemo(() => {
    return beneficiaries.map(item => ({
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
  }, [beneficiaries]);

  useEffect(() => {
    if (selectedCharity) {
      ymTrackBeneficiaryView(selectedCharity.id, selectedCharity.title, selectedCharity.category);
    }
  }, [selectedCharity]);

  useEffect(() => {
    ymTrackCategoryChange(activeCategory);
  }, [activeCategory]);

  return (
    <>
      <div className='sticky top-0 bg-white bg-opacity-90 backdrop-blur-md z-10 pt-4 pb-2'>
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </div>
      
      <div className='px-4 mt-4'>
        {loading ? (
          <div className='text-center py-8'>
            <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin mx-auto mb-2" />
            <p className='text-[var(--text-secondary)]'>Загрузка подопечных...</p>
          </div>
        ) : error ? (
          <div className='text-center py-8 text-red-500'>
            <p>Ошибка загрузки данных: {error}</p>
          </div>
        ) : formattedData.length === 0 ? (
          <div className='text-center py-8'>
            <Icon name="users" size={32} className="text-gray-400 mx-auto mb-4" />
            <h3 className='text-lg font-medium mb-2'>Нет подопечных</h3>
            <p className='text-[var(--text-secondary)]'>
              {activeCategory === 'all' 
                ? `В городе ${selectedCity} пока нет подопечных` 
                : `В категории пока нет подопечных в городе ${selectedCity}`}
            </p>
          </div>
        ) : (
          <div className='cards-grid'>
            {formattedData.map(item => (
              <CharityCard key={item.id} data={item} onCardClick={() => setSelectedCharity(item)} />
            ))}
          </div>
        )}
      </div>

      {showCitySelector && <CitySelectionModal onCitySelect={(city) => { onCityChange(city); setShowCitySelector(false); }} />}
      {selectedCharity && <CharityModal data={selectedCharity} onClose={() => setSelectedCharity(null)} />}
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

export default HomePage;
