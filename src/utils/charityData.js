import { getCachedData, setCachedData } from './dataCache';

export async function getCharityData(selectedCity = 'Алматы') {
  try {
    const cached = getCachedData('beneficiaries', { city: selectedCity });
    if (cached) {
      return cached;
    }

    const result = await window.trickleListObjects('charity_beneficiary', 50, true);
    const cityData = result.items
      .filter(item => {
        const matchesCity = item.objectData.city === selectedCity || item.objectData.is_nationwide;
        const status = item.objectData.collection_status || 'active';
        const isActiveCollection = status === 'active';
        const isActive = item.objectData.is_active !== false;
        
        return matchesCity && isActiveCollection && isActive;
      })
      .map(item => ({
        id: item.objectId,
        title: item.objectData.title,
        description: item.objectData.description,
        category: item.objectData.category,
        categoryName: getCategoryName(item.objectData.category),
        partnerFund: item.objectData.partner_fund,
        image: item.objectData.image_url,
        images: item.objectData.images || [item.objectData.image_url],
        videos: item.objectData.videos || [],
        helpersCount: item.objectData.helpers_count,
        documentsLink: item.objectData.documents_link,
        raised: item.objectData.raised_amount || 0,
        target: item.objectData.target_amount || 0
      }));
    
    setCachedData('beneficiaries', cityData, { city: selectedCity });
    
    return cityData;
  } catch (error) {
    console.error('Error loading charity data:', error);
    return [];
  }
}

export function getCategoryName(category) {
  const categories = {
    children: 'Дети',
    urgent: 'Срочные',
    operations: 'Операции',
    animals: 'Животные',
    social: 'Социальные программы',
    non_material: 'Не материальная помощь'
  };
  return categories[category] || category;
}