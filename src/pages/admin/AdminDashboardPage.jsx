import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../../utils/adminAuth';
import BeneficiaryFormModal from '../../components/admin/BeneficiaryFormModal';
import BeneficiaryList from '../../components/admin/BeneficiaryList';
import ReportFormModal from '../../components/admin/ReportFormModal';
import Icon from '../../components/Icon';
import { supabase } from '../../supabaseClient';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('beneficiaries');
  const [showForm, setShowForm] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportingBeneficiary, setReportingBeneficiary] = useState(null);
  const [kaspiNewCount, setKaspiNewCount] = useState(0);

  useEffect(() => {
    checkAuth().then(authData => {
      if (!authData) {
        navigate('/admin');
      } else {
        setUser(authData);
        supabase
          .from('kaspi_payment_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new')
          .then(({ count }) => setKaspiNewCount(count || 0));
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleAddBeneficiary = () => {
    setEditingBeneficiary(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBeneficiary(null);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingBeneficiary(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleAddReport = (beneficiary) => {
    setReportingBeneficiary(beneficiary);
    setShowReportForm(true);
  };

  const handleReportFormClose = () => {
    setShowReportForm(false);
    setReportingBeneficiary(null);
  };

  const handleReportFormSave = () => {
    setShowReportForm(false);
    setReportingBeneficiary(null);
    setRefreshKey(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]'>
        <Icon name="loader" size={32} className="text-[var(--primary-color)] animate-spin" />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center'>
              <Icon name="shield" size={20} className="text-white" />
            </div>
            <div>
              <h1 className='text-xl font-bold'>Админ-панель</h1>
              <p className='text-sm text-[var(--text-secondary)]'>{user.username} - Администратор</p>
            </div>
          </div>
          
          <button onClick={handleLogout} className='btn-secondary'>
            Выйти
          </button>
        </div>
      </header>

      <nav className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4'>
        <div className='flex space-x-6 overflow-x-auto'>
          <button
            onClick={() => setActiveTab('beneficiaries')}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'beneficiaries'
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            Подопечные
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'completed'
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            Завершенные
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            Отчеты
          </button>
          <button
            onClick={() => setActiveTab('funds')}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'funds'
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            Фонды
          </button>
          <button
            onClick={() => setActiveTab('kaspi')}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-1 ${
              activeTab === 'kaspi'
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            <span>Kaspi</span>
            {kaspiNewCount > 0 && (
              <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {kaspiNewCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <main className='p-4'>
        {activeTab === 'beneficiaries' && (
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold'>Управление подопечными</h2>
              <button onClick={handleAddBeneficiary} className='btn-primary flex items-center space-x-2'>
                <Icon name="plus" size={20} />
                <span>Добавить подопечного</span>
              </button>
            </div>
            
            <BeneficiaryList
              statusFilter='active'
              onEdit={(beneficiary) => {
                setEditingBeneficiary(beneficiary);
                setShowForm(true);
              }}
              onRefresh={refreshKey}
            />
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold'>Завершенные сборы</h2>
            </div>
            
            <BeneficiaryList
              statusFilter='completed'
              onEdit={(beneficiary) => {
                setEditingBeneficiary(beneficiary);
                setShowForm(true);
              }}
              onAddReport={handleAddReport}
              onRefresh={refreshKey}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold'>Опубликованные отчёты</h2>
            </div>
            
            <BeneficiaryList
              statusFilter='reported'
              onEdit={(beneficiary) => {
                setEditingBeneficiary(beneficiary);
                setShowForm(true);
              }}
              onRefresh={refreshKey}
            />
          </div>
        )}

        {activeTab === 'funds' && (
          <FundsAdmin />
        )}

        {activeTab === 'kaspi' && (
          <div className='text-center py-8'>
            <p className='text-[var(--text-secondary)] mb-4'>
              {kaspiNewCount > 0 ? `Новых запросов: ${kaspiNewCount}` : 'Нет новых запросов'}
            </p>
            <button
              onClick={() => navigate('/admin/kaspi-requests')}
              className='btn-primary'
            >
              Открыть Kaspi запросы
            </button>
          </div>
        )}
      </main>

      {showForm && (
        <BeneficiaryFormModal
          beneficiary={editingBeneficiary}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}

      {showReportForm && (
        <ReportFormModal
          beneficiary={reportingBeneficiary}
          onClose={handleReportFormClose}
          onSave={handleReportFormSave}
        />
      )}
    </div>
  );
}

function FundsAdmin() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFund, setEditingFund] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchFunds = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('partner_funds').select('*').order('name');
    setFunds(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFunds(); }, [fetchFunds]);

  const handleEdit = (fund) => {
    setEditingFund(fund);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    if (editingFund) {
      const { error } = await supabase.from('partner_funds').update(formData).eq('id', editingFund.id);
      if (error) {
        alert('Ошибка сохранения: ' + error.message);
        return;
      }
    }
    setShowForm(false);
    setEditingFund(null);
    fetchFunds();
  };

  if (loading) {
    return <div className='text-center py-8'><Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin mx-auto" /></div>;
  }

  return (
    <div>
      <h2 className='text-xl font-bold mb-6'>Управление фондами</h2>
      <div className='space-y-3'>
        {funds.map(fund => (
          <div key={fund.id} className='card'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <img src={fund.logo_url} alt={fund.name} className='w-12 h-12 object-contain rounded-lg' />
                <div>
                  <p className='font-semibold'>{fund.name}</p>
                  <p className='text-sm text-[var(--text-secondary)]'>
                    {[fund.bin && `БИН: ${fund.bin}`, fund.location].filter(Boolean).join(' · ') || 'Нет данных'}
                  </p>
                </div>
              </div>
              <button onClick={() => handleEdit(fund)} className='btn-secondary text-sm'>
                <Icon name="pencil" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && editingFund && (
        <FundFormModal fund={editingFund} onClose={() => { setShowForm(false); setEditingFund(null); }} onSave={handleSave} />
      )}
    </div>
  );
}

function FundFormModal({ fund, onClose, onSave }) {
  const [form, setForm] = useState({
    bin: fund.bin || '',
    founded_date: fund.founded_date || '',
    location: fund.location || '',
    website: fund.social_links?.website || '',
    instagram: fund.social_links?.instagram || '',
    facebook: fund.social_links?.facebook || '',
    whatsapp: fund.social_links?.whatsapp || '',
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    const data = {
      bin: form.bin || null,
      founded_date: form.founded_date || null,
      location: form.location || null,
      social_links: {
        website: form.website || null,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        whatsapp: form.whatsapp || null,
      },
    };
    onSave(data);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-[var(--bg-primary)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-bold'>Редактировать: {fund.name}</h3>
          <button onClick={onClose} className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>БИН фонда</label>
            <input type='text' value={form.bin} onChange={e => handleChange('bin', e.target.value)} placeholder='123456789012' className='w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Дата создания</label>
            <input type='date' value={form.founded_date} onChange={e => handleChange('founded_date', e.target.value)} className='w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Расположение</label>
            <input type='text' value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder='г. Алматы' className='w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]' />
          </div>

          <hr className='border-[var(--border-color)]' />
          <p className='text-sm font-semibold text-[var(--text-secondary)]'>Социальные сети</p>

          <div>
            <label className='block text-sm font-medium mb-1'>Веб-сайт</label>
            <input type='url' value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder='https://fund.kz' className='w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Instagram</label>
            <input type='text' value={form.instagram} onChange={e => handleChange('instagram', e.target.value)} placeholder='https://instagram.com/fund' className='w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Facebook</label>
            <input type='text' value={form.facebook} onChange={e => handleChange('facebook', e.target.value)} placeholder='https://facebook.com/fund' className='w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>WhatsApp</label>
            <input type='text' value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder='+7 777 123 4567' className='w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]' />
          </div>
        </div>

        <div className='flex gap-3 mt-6'>
          <button onClick={onClose} className='flex-1 py-3 rounded-xl border border-[var(--border-color)] font-medium'>Отмена</button>
          <button onClick={handleSubmit} className='flex-1 py-3 rounded-xl bg-[var(--primary-color)] text-white font-medium'>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
