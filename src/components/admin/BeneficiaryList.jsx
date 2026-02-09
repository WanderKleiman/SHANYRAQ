import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Icon from '../Icon';

function BeneficiaryList({ statusFilter = 'active', onEdit, onRefresh, onAddReport }) {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBeneficiaries();
  }, [statusFilter, onRefresh]);

  const loadBeneficiaries = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('beneficiaries')
        .select('*')
        .eq('collection_status', statusFilter)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этого подопечного?')) return;
    
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadBeneficiaries();
    } catch (error) {
      alert('Ошибка при удалении: ' + error.message);
    }
  };

  const handleComplete = async (beneficiary) => {
    if (!confirm('Подтвердите завершение сбора средств для этого подопечного')) return;
    
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .update({
          collection_status: 'completed',
          completion_date: new Date().toISOString(),
          is_active: false
        })
        .eq('id', beneficiary.id);
      
      if (error) throw error;
      loadBeneficiaries();
    } catch (error) {
      alert('Ошибка при завершении сбора: ' + error.message);
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

  if (isLoading) {
    return (
      <div className='card text-center py-8'>
        <Icon name="loader" size={32} className="text-[var(--primary-color)] animate-spin mx-auto mb-2" />
        <p>Загрузка подопечных...</p>
      </div>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <div className='card text-center py-8'>
        <Icon name="users" size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className='text-lg font-medium mb-2'>Нет подопечных</h3>
        <p className='text-[var(--text-secondary)]'>Пока нет добавленных подопечных</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {beneficiaries.map(beneficiary => {
        const progressPercentage = (beneficiary.raised_amount / beneficiary.target_amount) * 100;
        
        return (
          <div key={beneficiary.id} className='card'>
            <div className='flex space-x-4'>
              <img 
                src={beneficiary.image_url}
                alt={beneficiary.title}
                className='w-24 h-24 object-cover rounded-xl flex-shrink-0'
              />
              
              <div className='flex-1'>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h3 className='font-semibold text-lg'>{beneficiary.title}</h3>
                    <div className='flex items-center space-x-4 text-sm text-[var(--text-secondary)]'>
                      <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                        {getCategoryName(beneficiary.category)}
                      </span>
                      <span>{beneficiary.city}</span>
                      <span>{beneficiary.partner_fund}</span>
                      {beneficiary.is_urgent && (
                        <span className='bg-red-100 text-red-800 px-2 py-1 rounded-full'>Срочно</span>
                      )}
                      {!beneficiary.is_active && (
                        <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded-full'>Неактивен</span>
                      )}
                    </div>
                  </div>
                  
                  <div className='flex space-x-2'>
                    {statusFilter === 'active' && (
                      <button
                        onClick={() => handleComplete(beneficiary)}
                        className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200'
                      >
                        Завершить
                      </button>
                    )}
{statusFilter === 'completed' && (
    <button
      onClick={() => onAddReport && onAddReport(beneficiary)}
      className='px-3 py-1 bg-[var(--primary-color)] text-white rounded-full text-sm font-medium hover:opacity-90'
    >
      Добавить отчёт
    </button>
  )}
                    <button
                      onClick={() => onEdit(beneficiary)}
                      className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200'
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(beneficiary.id)}
                      className='w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200'
                    >
                      <Icon name="trash-2" size={16} />
                    </button>
                  </div>
                </div>
                
                <p className='text-sm text-[var(--text-secondary)] mb-3 line-clamp-2'>
                  {beneficiary.description}
                </p>
                
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Прогресс сбора</span>
                    <span className='font-medium'>
                      {beneficiary.raised_amount?.toLocaleString()} ₸ / {beneficiary.target_amount?.toLocaleString()} ₸
                    </span>
                  </div>
                  
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div 
                      className='bg-[var(--primary-color)] h-2 rounded-full transition-all duration-300'
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className='text-xs text-[var(--text-secondary)]'>
                    {progressPercentage.toFixed(1)}% от цели
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BeneficiaryList;
