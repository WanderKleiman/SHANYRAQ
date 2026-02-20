import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Icon from '../Icon';

function BeneficiaryFormModal({ beneficiary, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: beneficiary?.title || '',
    description: beneficiary?.description || '',
    category: beneficiary?.category || 'children',
    city: beneficiary?.city || 'Алматы',
    partner_fund: beneficiary?.partner_fund || 'Шанырак',
    target_amount: beneficiary?.target_amount || '',
    raised_amount: beneficiary?.raised_amount || 0,
    image_url: beneficiary?.image_url || '',
images: beneficiary?.images?.join('\n') || '',
  videos: beneficiary?.videos?.join('\n') || '',
  helpers_count: beneficiary?.helpers_count || '',
  documents_link: beneficiary?.documents_link || '',
    is_active: beneficiary?.is_active !== false,
    is_urgent: beneficiary?.is_urgent || false,
    is_nationwide: beneficiary?.is_nationwide || false
  });
  
  const [partnerFunds, setPartnerFunds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'children', label: 'Дети' },
    { value: 'urgent', label: 'Взрослые' },
    { value: 'operations', label: 'Пожилые' },
    { value: 'animals', label: 'Животные' },
    { value: 'social', label: 'Социальные программы' },
    { value: 'non_material', label: 'Не материальная помощь' }
  ];

  const cities = [
    'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Караганда', 'Тараз',
    'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау', 'Кызылорда',
    'Актау', 'Костанай', 'Уральск', 'Туркестан', 'Петропавловск',
    'Кокшетау', 'Темиртау', 'Талдыкорган', 'Экибастуз'
  ];

  useEffect(() => {
    loadPartnerFunds();
  }, []);

  const loadPartnerFunds = async () => {
    try {
      const { data } = await supabase
        .from('partner_funds')
        .select('name')
        .order('name');
      
      setPartnerFunds(data?.map(f => f.name) || ['Шанырак']);
    } catch (error) {
      setPartnerFunds(['Шанырак']);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const processedData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        city: formData.city,
        partner_fund: formData.partner_fund,
        target_amount: parseInt(formData.target_amount) || 0,
        raised_amount: parseInt(formData.raised_amount) || 0,
        image_url: formData.image_url,
  images: formData.images ? formData.images.split('\n').filter(url => url.trim()) : [],
  videos: formData.videos ? formData.videos.split('\n').filter(url => url.trim()) : [],
  helpers_count: formData.helpers_count,
  documents_link: formData.documents_link,
        is_active: formData.is_active,
        is_urgent: formData.is_urgent,
        is_nationwide: formData.is_nationwide,
        collection_status: 'active'
      };

      if (beneficiary?.id) {
        const { error } = await supabase
          .from('beneficiaries')
          .update(processedData)
          .eq('id', beneficiary.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('beneficiaries')
          .insert([processedData]);
        
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      alert('Ошибка: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold'>
            {beneficiary ? 'Редактировать' : 'Добавить подопечного'}
          </h2>
          <button onClick={onClose} className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Заголовок *</label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Описание *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl h-24'
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Категория</label>
              <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} className='w-full p-3 border border-gray-300 rounded-xl'>
                {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Город</label>
              <select value={formData.city} onChange={(e) => handleChange('city', e.target.value)} className='w-full p-3 border border-gray-300 rounded-xl'>
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Фонд</label>
            <select value={formData.partner_fund} onChange={(e) => handleChange('partner_fund', e.target.value)} className='w-full p-3 border border-gray-300 rounded-xl'>
              {partnerFunds.map(fund => <option key={fund} value={fund}>{fund}</option>)}
            </select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Целевая сумма (₸) *</label>
              <input type='number' value={formData.target_amount} onChange={(e) => handleChange('target_amount', e.target.value)} className='w-full p-3 border border-gray-300 rounded-xl' required />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Собрано (₸)</label>
              <input type='number' value={formData.raised_amount} onChange={(e) => handleChange('raised_amount', e.target.value)} className='w-full p-3 border border-gray-300 rounded-xl' />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>URL изображения *</label>
            <input type='url' value={formData.image_url} onChange={(e) => handleChange('image_url', e.target.value)} className='w-full p-3 border border-gray-300 rounded-xl' placeholder='https://example.com/image.jpg' required />
          </div>
<div>
            <label className='block text-sm font-medium mb-2'>Дополнительные изображения (по одному на строку)</label>
            <textarea
              value={formData.images}
              onChange={(e) => handleChange('images', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl h-20'
              placeholder='https://example.com/image1.jpg&#10;https://example.com/image2.jpg'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Видео (YouTube ссылки, по одной на строку)</label>
            <textarea
              value={formData.videos}
              onChange={(e) => handleChange('videos', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl h-20'
              placeholder='https://www.youtube.com/watch?v=example'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Количество помощников</label>
            <input
              type='text'
              value={formData.helpers_count}
              onChange={(e) => handleChange('helpers_count', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl'
              placeholder='Например: 15'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Документы, подтверждающие сбор (ссылка)</label>
            <input
              type='url'
              value={formData.documents_link}
              onChange={(e) => handleChange('documents_link', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl'
              placeholder='https://example.com/documents'
            />
            <p className='text-xs text-gray-500 mt-1'>Ссылка откроется в новом окне для пользователей</p>
          </div>

          <div className='space-y-2'>
            <label className='flex items-center'><input type='checkbox' checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} className='mr-2 rounded' /><span className='text-sm'>Активный проект</span></label>
            <label className='flex items-center'><input type='checkbox' checked={formData.is_urgent} onChange={(e) => handleChange('is_urgent', e.target.checked)} className='mr-2 rounded' /><span className='text-sm'>Срочный проект</span></label>
            <label className='flex items-center'><input type='checkbox' checked={formData.is_nationwide} onChange={(e) => handleChange('is_nationwide', e.target.checked)} className='mr-2 rounded' /><span className='text-sm'>Показывать во всех городах</span></label>
          </div>

          <div className='flex gap-3 pt-4'>
            <button type='submit' disabled={isLoading} className='btn-primary flex-1'>{isLoading ? 'Сохранение...' : 'Сохранить'}</button>
            <button type='button' onClick={onClose} className='btn-secondary'>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BeneficiaryFormModal;
