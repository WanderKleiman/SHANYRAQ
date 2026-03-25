import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CharityCard from '../components/CharityCard';
import CharityModal from '../components/CharityModal';
import Icon from '../components/Icon';
import { optimizeImage } from '../utils/imageUtils';

function FundDetailPage() {
  const navigate = useNavigate();
  const { name } = useParams();
  const [fund, setFund] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: fundData, error: fundError } = await supabase
          .from('partner_funds')
          .select('*')
          .eq('name', decodeURIComponent(name))
          .single();

        if (fundError) throw fundError;
        setFund(fundData);

        const { data: beneficiariesData, error: beneficiariesError } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('partner_fund', decodeURIComponent(name))
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (beneficiariesError) throw beneficiariesError;

        const formatted = beneficiariesData.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          categoryName: getCategoryName(item.category),
          partnerFund: item.partner_fund,
          image: item.image_url,
          images: item.images || [item.image_url],
          videos: item.videos || [],
          helpersCount: item.helpers_count,
          documentsLink: item.documents_link,
          raised: item.raised_amount || 0,
          target: item.target_amount || 0,
          isUrgent: item.is_urgent,
          collectionStatus: item.collection_status
        }));

        setBeneficiaries(formatted);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [name]);

  useEffect(() => {
    if (descRef.current) {
      const lineHeight = parseFloat(getComputedStyle(descRef.current).lineHeight);
      const height = descRef.current.scrollHeight;
      setIsDescriptionLong(height > lineHeight * 5);
    }
  }, [fund]);

  if (loading) {
    return (
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin" />
      </div>
    );
  }

  if (!fund) {
    return (
      <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-[var(--text-secondary)] mb-4'>Фонд не найден</p>
          <button onClick={() => navigate(-1)} className='btn-primary'>
            Назад
          </button>
        </div>
      </div>
    );
  }

  const socialLinks = fund.social_links || {};

  return (
    <>
      <div className='min-h-screen bg-[var(--bg-secondary)]'>
        <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => navigate(-1)}
              className='w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center'
            >
              <Icon name="arrow-left" size={20} />
            </button>
            <h1 className='text-xl font-bold'>{fund.name}</h1>
          </div>
        </header>

        <div className='p-4 pb-20'>
          {/* Fund card - new layout: logo top, name, description, details */}
          <div className='card mb-6'>
            <div className='flex flex-col items-center text-center'>
              <img
                src={optimizeImage(fund.logo_url, { width: 160, quality: 75 })}
                alt={fund.name}
                className='w-24 h-24 object-contain rounded-2xl mb-3'
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/96?text=' + fund.name.charAt(0);
                }}
              />
              <div className='flex items-center space-x-2 mb-3'>
                <h2 className='text-xl font-bold'>{fund.name}</h2>
                {fund.is_verified && (
                  <img
                    src='https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/Galochka.png'
                    alt='Верифицирован'
                    className='w-6 h-6'
                  />
                )}
              </div>
            </div>

            {/* Description with "ещё" */}
            {fund.description && (
              <div className='mb-4'>
                <p
                  ref={descRef}
                  className={`text-[var(--text-secondary)] text-sm leading-relaxed ${!showFullDescription && isDescriptionLong ? 'line-clamp-5' : ''}`}
                >
                  {fund.description}
                </p>
                {isDescriptionLong && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className='text-[var(--primary-color)] text-sm font-medium mt-1'
                  >
                    {showFullDescription ? 'Свернуть' : 'Ещё'}
                  </button>
                )}
              </div>
            )}

            {/* Fund details */}
            {(fund.bin || fund.founded_date || fund.location) && (
              <div className='space-y-3 pt-3 border-t border-[var(--border-color)]'>
                {fund.bin && (
                  <div className='flex items-center space-x-3'>
                    <Icon name="file-check" size={18} className="text-[var(--text-secondary)]" />
                    <div>
                      <p className='text-xs text-[var(--text-secondary)]'>БИН</p>
                      <p className='text-sm font-medium'>{fund.bin}</p>
                    </div>
                  </div>
                )}
                {fund.founded_date && (
                  <div className='flex items-center space-x-3'>
                    <Icon name="database" size={18} className="text-[var(--text-secondary)]" />
                    <div>
                      <p className='text-xs text-[var(--text-secondary)]'>Дата создания</p>
                      <p className='text-sm font-medium'>{new Date(fund.founded_date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                )}
                {fund.location && (
                  <div className='flex items-center space-x-3'>
                    <Icon name="map-pin" size={18} className="text-[var(--text-secondary)]" />
                    <div>
                      <p className='text-xs text-[var(--text-secondary)]'>Расположение</p>
                      <p className='text-sm font-medium'>{fund.location}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social links */}
            {(socialLinks.website || socialLinks.instagram || socialLinks.facebook || socialLinks.whatsapp) && (
              <div className='pt-3 mt-3 border-t border-[var(--border-color)]'>
                <p className='text-xs text-[var(--text-secondary)] mb-2'>Социальные сети</p>
                <div className='flex flex-wrap gap-2'>
                  {socialLinks.website && (
                    <a href={socialLinks.website} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-1.5 px-3 py-2 bg-[var(--bg-secondary)] rounded-xl text-sm'>
                      <Icon name="external-link" size={14} className="text-[var(--primary-color)]" />
                      <span>Сайт</span>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-1.5 px-3 py-2 bg-[var(--bg-secondary)] rounded-xl text-sm'>
                      <Icon name="instagram" size={14} className="text-[#E4405F]" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-1.5 px-3 py-2 bg-[var(--bg-secondary)] rounded-xl text-sm'>
                      <Icon name="users" size={14} className="text-[#1877F2]" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {socialLinks.whatsapp && (
                    <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target='_blank' rel='noopener noreferrer' className='flex items-center space-x-1.5 px-3 py-2 bg-[var(--bg-secondary)] rounded-xl text-sm'>
                      <Icon name="message-circle" size={14} className="text-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Beneficiaries list */}
          <div className='mb-4'>
            <h3 className='text-lg font-semibold mb-3'>
              Подопечные фонда ({beneficiaries.length})
            </h3>
          </div>

          {beneficiaries.length === 0 ? (
            <div className='text-center py-8'>
              <Icon name="users" size={32} className="text-gray-400 mx-auto mb-4" />
              <p className='text-[var(--text-secondary)]'>У этого фонда пока нет подопечных</p>
            </div>
          ) : (
            <div className='cards-grid'>
              {beneficiaries.map(item => (
                <CharityCard
                  key={item.id}
                  data={item}
                  onCardClick={() => setSelectedCharity(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCharity && (
        <CharityModal
          data={selectedCharity}
          onClose={() => setSelectedCharity(null)}
        />
      )}
    </>
  );
}

function getCategoryName(category) {
  const categories = {
    'children': 'Дети',
    'animals': 'Животные',
    'operations': 'Пожилые',
    'urgent': 'Взрослые',
    'non_material': 'Нематериальная помощь'
  };
  return categories[category] || category;
}

export default FundDetailPage;
