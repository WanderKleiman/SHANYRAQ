import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { supabase } from '../supabaseClient';
import { ymTrackHelpClick } from '../utils/yandexMetrika';

function PaymentModal({ beneficiary, onClose }) {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTouchStart = (e) => {
    setTouchStartY(e.targetTouches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.targetTouches[0].clientY;
    const offset = currentY - touchStartY;
    if (offset > 0) {
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffset > 100) {
      setIsClosing(true);
      setTimeout(() => onClose(), 300);
    } else {
      setDragOffset(0);
    }
  };

  const presetAmounts = [500, 1000, 2000, 5000];

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    setPhoneNumber(value);
  };

  const formatPhone = (phone) => {
    if (!phone) return '+7';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 1) return '+7';
    if (cleaned.length <= 4) return `+7 ${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4)}`;
    return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
  };

  const handlePayment = async () => {
    const amount = selectedAmount || parseInt(customAmount);

    if (!amount || amount <= 0) {
      alert('Пожалуйста, выберите или введите сумму пожертвования');
      return;
    }

    if (paymentMethod === 'card') {
      alert('Оплата банковской картой временно недоступна');
      return;
    }

    if (paymentMethod === 'kaspi') {
      if (phoneNumber.length !== 11) {
        alert('Пожалуйста, введите корректный номер телефона');
        return;
      }

      setIsSubmitting(true);
      try {
        ymTrackHelpClick(beneficiary.id, beneficiary.title, beneficiary.target);

        await supabase.from('kaspi_payment_requests').insert({
          beneficiary_id: beneficiary.id,
          beneficiary_title: beneficiary.title,
          phone: phoneNumber,
          amount: amount,
          status: 'new'
        });

        onClose();
        navigate('/?donated=kaspi');
      } catch (error) {
        console.error('Ошибка при отправке:', error);
        alert('Произошла ошибка. Попробуйте ещё раз.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className='fixed inset-0 z-[60] flex items-end md:items-center md:justify-center p-0 md:p-4' style={{ touchAction: 'none' }} onClick={onClose}>
      <div
        className='absolute inset-0 bg-black transition-opacity'
        style={{
          opacity: isClosing ? 0 : Math.max(0.5 - (dragOffset / 1000), 0),
          transition: isDragging ? 'none' : 'opacity 0.3s ease-out'
        }}
      />
      <div
        className='bg-[var(--bg-primary)] w-full md:max-w-md rounded-t-3xl md:rounded-2xl relative z-10 overflow-y-auto max-h-[90vh]'
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${isClosing ? '100%' : dragOffset + 'px'})`,
          transition: isClosing ? 'transform 0.3s ease-out' : isDragging && dragOffset > 0 ? 'none' : 'transform 0.3s ease-out',
          overscrollBehavior: 'contain'
        }}
      >
        <div className='w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 md:hidden' />
        <button onClick={onClose} className='absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center z-30'>
          <Icon name="x" size={16} />
        </button>

        <div className='p-6 space-y-6'>
          <div>
            <h2 className='text-xl font-bold text-[var(--text-primary)] mb-2'>Помочь подопечному</h2>
            <p className='text-sm text-[var(--text-secondary)]'>{beneficiary?.title}</p>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-[var(--text-primary)] mb-3'>Выберите сумму</h3>
            <div className='grid grid-cols-2 gap-3 mb-3'>
              {presetAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => handleAmountClick(amount)}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    selectedAmount === amount
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'bg-gray-100 text-[var(--text-primary)]'
                  }`}
                >
                  {amount.toLocaleString()} ₸
                </button>
              ))}
            </div>
            <div>
              <label className='text-sm text-[var(--text-secondary)] mb-2 block'>Своя сумма</label>
              <input
                type='text'
                inputMode='numeric'
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder='Введите сумму'
                className='w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
              />
            </div>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-[var(--text-primary)] mb-3'>Способ оплаты</h3>
            <div className='space-y-2'>
              <label className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer ${paymentMethod === 'card' ? 'bg-blue-50 ring-2 ring-[var(--primary-color)]' : 'bg-gray-100'}`}>
                <input
                  type='radio'
                  name='payment'
                  value='card'
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='w-5 h-5 text-[var(--primary-color)]'
                />
                <Icon name="credit-card" size={20} className="text-[var(--text-primary)]" />
                <span className='text-[var(--text-primary)]'>Банковская карта</span>
                <span className='text-xs text-[var(--text-secondary)] ml-auto'>скоро</span>
              </label>
              <label className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer ${paymentMethod === 'kaspi' ? 'bg-blue-50 ring-2 ring-[var(--primary-color)]' : 'bg-gray-100'}`}>
                <input
                  type='radio'
                  name='payment'
                  value='kaspi'
                  checked={paymentMethod === 'kaspi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='w-5 h-5 text-[var(--primary-color)]'
                />
                <img src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/png-klev-club-xxta-p-kaspii-logotip-png-10.png" alt="Kaspi" className="h-14 object-contain" />
              </label>
            </div>
          </div>

          {paymentMethod === 'kaspi' && (
            <div className='bg-blue-50 p-4 rounded-xl space-y-3'>
              <label className='text-sm text-[var(--text-secondary)] block'>Номер телефона</label>
              <input
                type='tel'
                value={formatPhone(phoneNumber)}
                onChange={handlePhoneChange}
                placeholder='+7'
                className='w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
              />
              <p className='text-xs text-blue-600'>На указанный номер придёт счёт на оплату в Kaspi</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isSubmitting}
            className='btn-primary w-full disabled:opacity-50'
          >
            {isSubmitting ? 'Отправка...' : 'Оплатить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
