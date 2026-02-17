import React, { useState, useEffect, useMemo } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import CharityCard from '../components/CharityCard';
import CharityModal from '../components/CharityModal';
import CitySelectionModal from '../components/CitySelectionModal';
import { useBeneficiaries } from '../hooks/useBeneficiaries';
import { supabase } from '../supabaseClient';
import { ymTrackBeneficiaryView, ymTrackCategoryChange } from '../utils/yandexMetrika';
import Icon from '../components/Icon';

function HomePage({ selectedCity, onCityChange }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  // Загружаем данные из Supabase
  const { beneficiaries, loading, error } = useBeneficiaries(
    activeCategory === 'all' ? null : activeCategory,
    selectedCity
  );

  console.log('HomePage рендер:', { selectedCity, beneficiariesCount: beneficiaries.length });

  useEffect(() => {
    localStorage.setItem('activeTab', 'home');
  }, []);

  // Проверяем параметр donated
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('donated') === 'true') {
      setShowThankYou(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Проверяем параметр donated
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('donated') === 'true') {
      setShowThankYou(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Показываем выбор города если не выбран
  useEffect(() => {
    const hasSelectedCity = localStorage.getItem('selectedCity');
    if (!hasSelectedCity) {
      setTimeout(() => setShowCitySelector(true), 15000);
    }
  }, []);
  
  // Открываем подопечного из URL (загружаем напрямую, без фильтра по городу)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const beneficiaryId = params.get('beneficiary');
    if (!beneficiaryId) return;

    async function fetchBeneficiary() {
      const { data: beneficiary } = await supabase
        .from('beneficiaries')
        .select('id, title, description, category, city, partner_fund, target_amount, raised_amount, image_url, images, videos, is_urgent, is_nationwide, collection_status, helpers_count, documents_link')
        .eq('id', beneficiaryId)
        .single();

      if (beneficiary) {
        setSelectedCharity({
          id: beneficiary.id,
          title: beneficiary.title,
          description: beneficiary.description,
          category: beneficiary.category,
          categoryName: getCategoryName(beneficiary.category),
          partnerFund: beneficiary.partner_fund,
          image: beneficiary.image_url,
          images: beneficiary.images || [beneficiary.image_url],
          videos: beneficiary.videos || [],
          helpersCount: beneficiary.helpers_count,
          documentsLink: beneficiary.documents_link,
          raised: beneficiary.raised_amount || 0,
          target: beneficiary.target_amount || 0
        });
      }
    }

    fetchBeneficiary();
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
           {formattedData.map((item, index) => (
  <CharityCard 
    key={item.id} 
    data={item}
    index={index}
    onCardClick={() => setSelectedCharity(item)} 
  />
))}
          </div>
        )}
      </div>

      {showCitySelector && <CitySelectionModal onCitySelect={(city) => { onCityChange(city); setShowCitySelector(false); }} />}
      {selectedCharity && <CharityModal data={selectedCharity} onClose={() => setSelectedCharity(null)} />}

      {showThankYou && (
        <div 
          className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
          onClick={() => setShowThankYou(false)}
        >
          <div 
            className='bg-white rounded-3xl p-8 max-w-sm w-full text-center'
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/Group%20270988349.jpg" 
              alt="Спасибо" 
              className="w-32 h-32 mx-auto mb-6"
            />
            <h2 className='text-2xl font-bold mb-3'>Спасибо</h2>
            <p className="text-gray-600 mb-4">Сегодня вы сделали этот мир немного лучше!</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">После оказания помощи мы опубликуем отчёт на сайте в разделе «Отчёты», чтобы вы могли увидеть результат вашей поддержки</p>
            </div>
            <button 
              onClick={() => setShowThankYou(false)}
              className='bg-[var(--primary-color)] text-white w-full py-4 rounded-2xl font-semibold text-lg'
            >
              Отлично!
            </button>
          </div>
        </div>
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

export default HomePage;
