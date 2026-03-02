import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';
import { getVisitorId } from '../utils/fingerprint';

function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalHelp, setTotalHelp] = useState(0);
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);
  const [phone, setPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const visitorId = await getVisitorId();

      const { data: payments } = await supabase
        .from('kaspi_payment_requests')
        .select('*')
        .eq('visitor_id', visitorId)
        .eq('status', 'paid');

      if (payments && payments.length > 0) {
        setIsVerified(true);
        setTotalHelp(payments.reduce((sum, p) => sum + p.amount, 0));
        const uniqueBeneficiaries = new Set(payments.map(p => p.beneficiary_id));
        setBeneficiaryCount(uniqueBeneficiaries.size);
        setPhone(payments[0].phone);
      }

      // Also check visitors table for updated phone
      const { data: visitor } = await supabase
        .from('visitors')
        .select('phone')
        .eq('visitor_id', visitorId)
        .single();

      if (visitor?.phone) {
        setPhone(visitor.phone);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneDisplay = (p) => {
    if (!p || p.length < 11) return p || '';
    return `+7 ${p.slice(1, 4)} ${p.slice(4, 7)} ${p.slice(7, 9)} ${p.slice(9)}`;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    setEditPhoneValue(value);
  };

  const handleSavePhone = async () => {
    if (editPhoneValue.length !== 11) {
      alert('Введите корректный номер телефона (11 цифр)');
      return;
    }

    try {
      const visitorId = await getVisitorId();
      await supabase.from('visitors').upsert({
        visitor_id: visitorId,
        phone: editPhoneValue,
        updated_at: new Date().toISOString()
      }, { onConflict: 'visitor_id' });

      setPhone(editPhoneValue);
      setIsEditingPhone(false);
    } catch (error) {
      console.error('Error saving phone:', error);
      alert('Ошибка сохранения');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin" />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => navigate('/profile')}
            className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <h1 className='text-xl font-bold'>Мой профиль</h1>
        </div>
      </header>

      <div className='p-4 space-y-4'>
        {/* Stats */}
        {isVerified && (
          <div className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'>
            <h2 className='text-sm font-semibold text-[var(--text-secondary)] mb-3'>Ваша помощь</h2>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                  <Icon name="heart" size={18} className="text-green-600" />
                </div>
                <div>
                  <p className='text-sm text-[var(--text-secondary)]'>Вы оказали помощь на</p>
                  <p className='font-bold text-[var(--text-primary)]'>{totalHelp.toLocaleString()} ₸</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                  <Icon name="users" size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className='text-sm text-[var(--text-secondary)]'>Вы помогли</p>
                  <p className='font-bold text-[var(--text-primary)]'>{beneficiaryCount} {beneficiaryCount === 1 ? 'подопечному' : 'подопечным'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kaspi Phone */}
        <div className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'>
          <h2 className='text-sm font-semibold text-[var(--text-secondary)] mb-3'>Номер для оплаты Kaspi</h2>
          {isEditingPhone ? (
            <div className='space-y-3'>
              <input
                type='tel'
                value={editPhoneValue.length > 0 ? formatPhoneDisplay(editPhoneValue) : '+7'}
                onChange={handlePhoneChange}
                placeholder='+7'
                className='w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
                autoFocus
              />
              <div className='flex space-x-2'>
                <button
                  onClick={handleSavePhone}
                  className='flex-1 py-2 bg-[var(--primary-color)] text-white rounded-xl text-sm font-medium'
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setIsEditingPhone(false)}
                  className='flex-1 py-2 bg-gray-100 text-[var(--text-primary)] rounded-xl text-sm font-medium'
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center'>
                  <Icon name="phone" size={18} className="text-orange-600" />
                </div>
                <div>
                  {phone ? (
                    <>
                      <p className='font-medium text-[var(--text-primary)]'>{formatPhoneDisplay(phone)}</p>
                      {isVerified && <p className='text-xs text-green-600'>Верифицирован</p>}
                    </>
                  ) : (
                    <p className='text-sm text-[var(--text-secondary)]'>Не указан</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setEditPhoneValue(phone || ''); setIsEditingPhone(true); }}
                className='text-sm text-[var(--primary-color)] font-medium'
              >
                {phone ? 'Сменить' : 'Добавить'}
              </button>
            </div>
          )}
        </div>

        {/* Card placeholder */}
        <div className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'>
          <h2 className='text-sm font-semibold text-[var(--text-secondary)] mb-3'>Банковская карта</h2>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                <Icon name="credit-card" size={18} className="text-gray-400" />
              </div>
              <p className='text-sm text-[var(--text-secondary)]'>Не привязана</p>
            </div>
            <span className='text-xs text-[var(--text-secondary)] bg-gray-100 px-2 py-1 rounded-lg'>скоро</span>
          </div>
        </div>

        {!isVerified && (
          <div className='text-center py-4'>
            <p className='text-sm text-[var(--text-secondary)] mb-3'>Сделайте первую оплату для верификации профиля</p>
            <button onClick={() => navigate('/')} className='btn-primary'>
              Помочь подопечным
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
