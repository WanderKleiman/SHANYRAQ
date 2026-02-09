import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import Icon from '../Icon';

function ReportFormModal({ beneficiary, onClose, onSave }) {
  const [formData, setFormData] = useState({
    report_photos: beneficiary?.report_photos?.join('\n') || '',
    report_videos: beneficiary?.report_videos?.join('\n') || '',
    report_description: beneficiary?.report_description || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('beneficiaries')
        .update({
          report_photos: formData.report_photos ? formData.report_photos.split('\n').filter(url => url.trim()) : [],
          report_videos: formData.report_videos ? formData.report_videos.split('\n').filter(url => url.trim()) : [],
          report_description: formData.report_description,
          collection_status: 'reported',
          completion_date: new Date().toISOString()
        })
        .eq('id', beneficiary.id);
      
      if (error) throw error;
      onSave();
    } catch (error) {
      alert('Ошибка при сохранении отчёта: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold'>Добавить отчёт: {beneficiary?.title}</h2>
          <button onClick={onClose} className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Фотографии отчёта (по одной на строку)</label>
            <textarea
              value={formData.report_photos}
              onChange={(e) => handleChange('report_photos', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl h-24'
              placeholder='https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Видео отчёта (YouTube ссылки, по одной на строку)</label>
            <textarea
              value={formData.report_videos}
              onChange={(e) => handleChange('report_videos', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl h-24'
              placeholder='https://www.youtube.com/watch?v=example1&#10;https://www.youtube.com/watch?v=example2'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Описание оказанной помощи *</label>
            <textarea
              value={formData.report_description}
              onChange={(e) => handleChange('report_description', e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl h-32'
              placeholder='Опишите, какая помощь была оказана...'
              required
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <button type='submit' disabled={isLoading} className='btn-primary flex-1'>
              {isLoading ? 'Сохранение...' : 'Опубликовать отчёт'}
            </button>
            <button type='button' onClick={onClose} className='btn-secondary'>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportFormModal;
