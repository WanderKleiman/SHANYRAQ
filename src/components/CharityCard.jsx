import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ymTrackShareClick } from '../utils/yandexMetrika';
import Icon from '../components/Icon';
import PaymentModal from '../components/PaymentModal';
import { Share } from '@capacitor/share';

function CharityCard({ data, onCardClick, index = 0 }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const progressPercentage = (data.raised / data.target) * 100;
  const remainingAmount = Math.max(0, data.target - data.raised);

  const handleHelp = () => {
    setShowPaymentModal(true);
  };

  const handleShare = async () => {
    ymTrackShareClick(data.id, data.title);
    const shareUrl = `https://shanyrak.world/?beneficiary=${data.id}`;
    try {
      await Share.share({
        title: data.title,
        text: `Помогите ${data.title}`,
        url: shareUrl,
        dialogTitle: 'Поделиться'
      });
    } catch (e) {
      // Fallback for browsers without Share API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Ссылка скопирована в буфер обмена');
      }
    }
  };

  return (
    <div
      className='card cursor-pointer'
      data-name='charity-card'
      data-file='src/components/CharityCard.jsx'
      onClick={onCardClick}
    >
      <div className='relative mb-4'>
  <img
  src={data.image}
  alt={data.title}
  loading={index === 0 ? 'eager' : 'lazy'}
  fetchPriority={index === 0 ? 'high' : 'auto'}
  decoding={index === 0 ? 'sync' : 'async'}
  className='w-full h-48 object-cover object-center rounded-xl'
/>
        <div className='absolute top-3 left-3'>
          <span className='bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs font-medium'>
            {data.categoryName}
          </span>
        </div>
      </div>
      <div className='space-y-3'>
        <h3 className='text-lg font-semibold text-[var(--text-primary)] leading-tight'>{data.title}</h3>
        <p className='text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-4'>{data.description}</p>
        <div className='flex items-center space-x-2 text-xs'>
          <Icon name="shield-check" size={16} className="text-[var(--primary-color)]" />
          <a
href={`/fund/${encodeURIComponent(data.partnerFund)}`}
            onClick={(e) => e.stopPropagation()}
            className='text-[var(--primary-color)] hover:underline'
          >
            Фонд "{data.partnerFund}"
          </a>
        </div>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-[var(--text-secondary)]'>Собрано</span>
            <span className='font-medium text-[var(--text-primary)]'>
              {data.raised.toLocaleString("ru-RU")} ₸ из {data.target.toLocaleString("ru-RU")} ₸
            </span>
          </div>
          <div className='progress-bar'>
            <div
              className='progress-fill'
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>
            Осталось собрать: {remainingAmount.toLocaleString("ru-RU")} ₸
          </div>
        </div>
        <div className='flex space-x-3 pt-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleHelp();
            }}
            className='btn-primary flex-1'
          >
            Помочь
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            aria-label="Поделиться" className='btn-secondary w-12 h-12 flex items-center justify-center p-0'
          >
            <Icon name="share-2" size={20} />
          </button>
        </div>
      </div>
      {showPaymentModal && (
        <PaymentModal
          beneficiary={data}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}

export default CharityCard;