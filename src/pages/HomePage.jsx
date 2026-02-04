import React, { useState, useEffect, useMemo } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import CharityCard from '../components/CharityCard';
import CharityModal from '../components/CharityModal';
import CitySelectionModal from '../components/CitySelectionModal';
import { getCharityData } from '../utils/charityData';
import { clearCache } from '../utils/dataCache';
import { ymTrackBeneficiaryView, ymTrackCategoryChange } from '../utils/yandexMetrika';

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('selectedCity') || 'Алматы';
  });
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [charityData, setCharityData] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('activeTab', 'home');
    clearCache('beneficiaries');
    
    const hasSelectedCity = localStorage.getItem('selectedCity');
    if (!hasSelectedCity) {
      setTimeout(() => setShowCitySelector(true), 15000);
    }
    
    const params = new URLSearchParams(window.location.search);
    const beneficiaryId = params.get('beneficiary');
    if (beneficiaryId) loadBeneficiaryById(beneficiaryId);
  }, []);

  const loadBeneficiaryById = async (id) => {
    try {
      const beneficiary = await window.trickleGetObject('charity_beneficiary', id);
      setSelectedCharity({
        id: beneficiary.objectId,
        title: beneficiary.objectData.title,
        description: beneficiary.objectData.description,
        category: beneficiary.objectData.category,
        categoryName: getCategoryName(beneficiary.objectData.category),
        partnerFund: beneficiary.objectData.partner_fund,
        image: beneficiary.objectData.image_url,
        images: beneficiary.objectData.images || [beneficiary.objectData.image_url],
        videos: beneficiary.objectData.videos || [],
        helpersCount: beneficiary.objectData.helpers_count,
        documentsLink: beneficiary.objectData.documents_link,
        raised: beneficiary.objectData.raised_amount || 0,
        target: beneficiary.objectData.target_amount || 0
      });
    } catch (error) {
      console.error('Error loading beneficiary:', error);
    }
  };

  const loadCharityData = async () => {
    setIsLoading(true);
    try {
      const data = await getCharityData(selectedCity);
      setCharityData(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
    setShowCitySelector(false);
  };

  useEffect(() => {
    if (selectedCity) loadCharityData();
  }, [selectedCity]);

  const filteredData = useMemo(() => {
    if (activeCategory === 'all') return charityData;
    return charityData.filter(item => item.category === activeCategory);
  }, [charityData, activeCategory]);

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
        {isLoading ? (
          <div className='text-center py-8'>
            <div className='icon-loader text-2xl text-[var(--primary-color)] animate-spin mx-auto mb-2' />
            <p className='text-[var(--text-secondary)]'>Загрузка подопечных...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className='text-center py-8'>
            <div className='icon-users text-3xl text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium mb-2'>Нет подопечных</h3>
            <p className='text-[var(--text-secondary)]'>
              {activeCategory === 'all' 
                ? `В городе ${selectedCity} пока нет подопечных` 
                : `В категории пока нет подопечных в городе ${selectedCity}`}
            </p>
          </div>
        ) : (
          <div className='cards-grid'>
            {filteredData.map(item => (
              <CharityCard key={item.id} data={item} onCardClick={() => setSelectedCharity(item)} />
            ))}
          </div>
        )}
      </div>

      {showCitySelector && <CitySelectionModal onCitySelect={handleCityChange} />}
      {selectedCharity && <CharityModal data={selectedCharity} onClose={() => setSelectedCharity(null)} />}
    </>
  );
}

export default HomePage;