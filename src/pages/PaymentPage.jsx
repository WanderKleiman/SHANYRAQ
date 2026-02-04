import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('kaspi');
  
  const presetAmounts = [500, 1000, 2000, 5000];

  const handleAmountSelect = (value) => {
    setSelectedAmount(value);
    setAmount(value.toString());
  };

  const handleCustomAmount = (e) => {
    setAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handlePayment = () => {
    if (!amount || parseInt(amount) < 1) {
      alert('Пожалуйста, введите сумму пожертвования');
      return;
    }
    
    alert(`Спасибо за ваше пожертвование в размере ${amount} ₸!`);
    navigate('/');
  };

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
        <div className='flex items-center space-x-3'>
          <button 
            onClick={() => navigate(-1)}
            className='w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center'
          >
            <div className='icon-arrow-left text-lg' />
          </button>
          <h1 className='text-xl font-bold'>Сделать пожертвование</h1>
        </div>
      </header>

      <div className='p-4 space-y-6'>
        <div className='card'>
          <h2 className='text-lg font-semibold mb-4'>Выберите сумму</h2>
          
          <div className='grid grid-cols-2 gap-3 mb-4'>
            {presetAmounts.map(preset => (
              <button
                key={preset}
                onClick={() => handleAmountSelect(preset)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedAmount === preset
                    ? 'border-[var(--primary-color)] bg-blue-50 text-[var(--primary-color)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                }`}
              >
                {preset.toLocaleString()} ₸
              </button>
            ))}
          </div>
          
          <div>
            <label className='block text-sm font-medium mb-2'>Или введите свою сумму</label>
            <input
              type='number'
              value={amount}
              onChange={handleCustomAmount}
              placeholder='Введите сумму'
              className='w-full p-3 border border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none'
            />
          </div>
        </div>

        <div className='card'>
          <h2 className='text-lg font-semibold mb-4'>Способ оплаты</h2>
          
          <div className='space-y-3'>
            <label className='flex items-center space-x-3 p-3 border border-[var(--border-color)] rounded-xl cursor-pointer'>
              <input
                type='radio'
                name='payment'
                value='kaspi'
                checked={paymentMethod === 'kaspi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className='text-[var(--primary-color)]'
              />
              <img 
                src='https://app.trickle.so/storage/public/images/usr_140a45f300000001/823ce37e-1f25-43d5-abfb-6fc4b672368b.jpeg'
                alt='Каспи'
                className='h-8 object-contain'
              />
            </label>
            
            <label className='flex items-center space-x-3 p-3 border border-[var(--border-color)] rounded-xl cursor-pointer'>
              <input
                type='radio'
                name='payment'
                value='card'
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className='text-[var(--primary-color)]'
              />
              <div className='icon-credit-card text-lg text-[var(--primary-color)]' />
              <span>Банковской картой</span>
            </label>
          </div>
        </div>

        <button 
          onClick={handlePayment}
          className='btn-primary w-full'
        >
          Сделать пожертвование {amount && `${parseInt(amount).toLocaleString()} ₸`}
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;