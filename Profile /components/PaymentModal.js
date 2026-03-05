function PaymentModal({ beneficiary, onClose }) {
  const [selectedAmount, setSelectedAmount] = React.useState(null);
  const [customAmount, setCustomAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('card');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

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

  const handlePayment = () => {
    const amount = selectedAmount || parseInt(customAmount);
    
    if (!amount || amount <= 0) {
      alert('Пожалуйста, выберите или введите сумму пожертвования');
      return;
    }

    if (paymentMethod === 'kaspi') {
      if (phoneNumber.length !== 11) {
        alert('Пожалуйста, введите корректный номер телефона');
        return;
      }
      alert(`Счет на сумму ${amount}₸ будет отправлен на номер ${formatPhone(phoneNumber)}`);
    } else {
      alert('Перенаправление на Freedom Pay (временно недоступно)');
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end md:items-center md:justify-center p-0 md:p-4' onClick={onClose}>
      <div className='absolute inset-0 bg-black bg-opacity-50' />
      <div className='bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl relative z-10 overflow-y-auto max-h-[90vh]' onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className='absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center z-30'>
          <div className='icon-x text-sm' />
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
              <label className='flex items-center space-x-3 p-4 bg-gray-100 rounded-xl cursor-pointer'>
                <input
                  type='radio'
                  name='payment'
                  value='card'
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='w-5 h-5 text-[var(--primary-color)]'
                />
                <span className='text-[var(--text-primary)]'>Банковская карта</span>
              </label>
              <label className='flex items-center space-x-3 p-4 bg-gray-100 rounded-xl cursor-pointer'>
                <input
                  type='radio'
                  name='payment'
                  value='kaspi'
                  checked={paymentMethod === 'kaspi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='w-5 h-5 text-[var(--primary-color)]'
                />
                <div className='flex items-center space-x-2'>
                  <span className='text-[var(--text-primary)]'>Kaspi</span>
                  <img src='https://app.trickle.so/storage/public/images/usr_140a45f300000001/823ce37e-1f25-43d5-abfb-6fc4b672368b.jpeg' alt='Kaspi' className='h-6' />
                </div>
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
              <p className='text-xs text-blue-600'>На указанный номер придет счет на оплату данного подопечного</p>
            </div>
          )}

          <button onClick={handlePayment} className='btn-primary w-full'>
            Оплатить
          </button>
        </div>
      </div>
    </div>
  );
}