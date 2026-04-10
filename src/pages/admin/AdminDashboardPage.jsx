import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            Подписки
          </button>
          <button
            onClick={() => setActiveTab('push')}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'push'
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            Пуши
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

        {activeTab === 'subscriptions' && (
          <SubscriptionsAdmin />
        )}

        {activeTab === 'push' && (
          <PushAdmin />
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

function SubscriptionsAdmin() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('fund_subscriptions').select('*').order('created_at', { ascending: false });
    setSubs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('fund_subscriptions').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error('Ошибка: ' + error.message); return; }
    fetchSubs();
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels = { new: 'Новая', active: 'Активна', paused: 'Пауза', cancelled: 'Отменена' };

  if (loading) {
    return <div className='text-center py-8'><Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin mx-auto" /></div>;
  }

  return (
    <div>
      <h2 className='text-xl font-bold mb-6'>Подписки на фонды</h2>
      {subs.length === 0 ? (
        <div className='card text-center py-8'>
          <p className='text-[var(--text-secondary)]'>Нет подписок</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {subs.map(sub => (
            <div key={sub.id} className='card'>
              <div className='flex items-start justify-between mb-2'>
                <div>
                  <p className='font-semibold'>{sub.fund_name}</p>
                  <p className='text-sm text-[var(--text-secondary)]'>
                    {sub.phone ? `+${sub.phone}` : 'Нет телефона'} · {sub.payment_method === 'kaspi' ? 'Kaspi' : 'Карта'}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-bold text-[var(--primary-color)]'>{sub.amount?.toLocaleString('ru-RU')} ₸/мес</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusColors[sub.status] || 'bg-gray-100'}`}>
                    {statusLabels[sub.status] || sub.status}
                  </span>
                </div>
              </div>
              <p className='text-xs text-[var(--text-secondary)] mb-3'>
                {new Date(sub.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className='flex gap-2'>
                {sub.status !== 'active' && (
                  <button onClick={() => updateStatus(sub.id, 'active')} className='flex-1 py-2 text-xs font-medium rounded-lg bg-green-50 text-green-700 active:bg-green-100'>
                    Активировать
                  </button>
                )}
                {sub.status !== 'paused' && sub.status !== 'cancelled' && (
                  <button onClick={() => updateStatus(sub.id, 'paused')} className='flex-1 py-2 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-700 active:bg-yellow-100'>
                    Пауза
                  </button>
                )}
                {sub.status !== 'cancelled' && (
                  <button onClick={() => updateStatus(sub.id, 'cancelled')} className='flex-1 py-2 text-xs font-medium rounded-lg bg-red-50 text-red-700 active:bg-red-100'>
                    Отменить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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

  const handleAdd = () => {
    setEditingFund(null);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    if (editingFund) {
      const { error } = await supabase.from('partner_funds').update(formData).eq('id', editingFund.id);
      if (error) { toast.error('Ошибка сохранения: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('partner_funds').insert(formData);
      if (error) { toast.error('Ошибка создания: ' + error.message); return; }
    }
    setShowForm(false);
    setEditingFund(null);
    fetchFunds();
  };

  const handleDelete = async (fund) => {
    if (!confirm(`Удалить фонд "${fund.name}"?`)) return;
    const { error } = await supabase.from('partner_funds').delete().eq('id', fund.id);
    if (error) { toast.error('Ошибка удаления: ' + error.message); return; }
    fetchFunds();
  };

  if (loading) {
    return <div className='text-center py-8'><Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin mx-auto" /></div>;
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold'>Управление фондами</h2>
        <button onClick={handleAdd} className='btn-primary flex items-center space-x-2'>
          <Icon name="plus" size={20} />
          <span>Добавить фонд</span>
        </button>
      </div>
      <div className='space-y-3'>
        {funds.map(fund => (
          <div key={fund.id} className='card'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                {fund.logo_url ? (
                  <img src={fund.logo_url} alt={fund.name} className='w-12 h-12 object-contain rounded-lg' />
                ) : (
                  <div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-lg font-bold text-gray-500'>{fund.name?.charAt(0)}</div>
                )}
                <div>
                  <p className='font-semibold'>{fund.name}</p>
                  <p className='text-sm text-[var(--text-secondary)]'>
                    {[fund.bin && `БИН: ${fund.bin}`, fund.location].filter(Boolean).join(' · ') || 'Нет данных'}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <button onClick={() => handleEdit(fund)} className='btn-secondary text-sm'>
                  <Icon name="pencil" size={16} />
                </button>
                <button onClick={() => handleDelete(fund)} className='text-red-500 hover:text-red-700 p-2'>
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FundFormModal fund={editingFund} onClose={() => { setShowForm(false); setEditingFund(null); }} onSave={handleSave} />
      )}
    </div>
  );
}

function FundFormModal({ fund, onClose, onSave }) {
  const isNew = !fund;
  const [form, setForm] = useState({
    name: fund?.name || '',
    description: fund?.description || '',
    logo_url: fund?.logo_url || '',
    is_verified: fund?.is_verified || false,
    bin: fund?.bin || '',
    founded_date: fund?.founded_date || '',
    location: fund?.location || '',
    website: fund?.social_links?.website || '',
    instagram: fund?.social_links?.instagram || '',
    facebook: fund?.social_links?.facebook || '',
    whatsapp: fund?.social_links?.whatsapp || '',
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Введите название фонда'); return; }
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      logo_url: form.logo_url.trim() || null,
      is_verified: form.is_verified,
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

  const inputClass = 'w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]';

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-[var(--bg-primary)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-bold'>{isNew ? 'Добавить фонд' : `Редактировать: ${fund.name}`}</h3>
          <button onClick={onClose} className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Название фонда *</label>
            <input type='text' value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder='Название фонда' className={inputClass} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Описание</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder='Описание фонда' rows={3} className={inputClass} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>URL логотипа</label>
            <input type='url' value={form.logo_url} onChange={e => handleChange('logo_url', e.target.value)} placeholder='https://...logo.png' className={inputClass} />
            {form.logo_url && (
              <img src={form.logo_url} alt='Превью' className='w-16 h-16 object-contain rounded-lg mt-2 border border-[var(--border-color)]' />
            )}
          </div>
          <label className='flex items-center space-x-3 cursor-pointer'>
            <input type='checkbox' checked={form.is_verified} onChange={e => handleChange('is_verified', e.target.checked)} className='w-5 h-5 accent-[var(--primary-color)]' />
            <span className='text-sm font-medium'>Верифицированный фонд</span>
          </label>

          <hr className='border-[var(--border-color)]' />
          <p className='text-sm font-semibold text-[var(--text-secondary)]'>Дополнительно</p>

          <div>
            <label className='block text-sm font-medium mb-1'>БИН фонда</label>
            <input type='text' value={form.bin} onChange={e => handleChange('bin', e.target.value)} placeholder='123456789012' className={inputClass} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Дата создания</label>
            <input type='date' value={form.founded_date} onChange={e => handleChange('founded_date', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Расположение</label>
            <input type='text' value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder='г. Алматы' className={inputClass} />
          </div>

          <hr className='border-[var(--border-color)]' />
          <p className='text-sm font-semibold text-[var(--text-secondary)]'>Социальные сети</p>

          <div>
            <label className='block text-sm font-medium mb-1'>Веб-сайт</label>
            <input type='url' value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder='https://fund.kz' className={inputClass} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Instagram</label>
            <input type='text' value={form.instagram} onChange={e => handleChange('instagram', e.target.value)} placeholder='https://instagram.com/fund' className={inputClass} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Facebook</label>
            <input type='text' value={form.facebook} onChange={e => handleChange('facebook', e.target.value)} placeholder='https://facebook.com/fund' className={inputClass} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>WhatsApp</label>
            <input type='text' value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder='+7 777 123 4567' className={inputClass} />
          </div>
        </div>

        <div className='flex gap-3 mt-6'>
          <button onClick={onClose} className='flex-1 py-3 rounded-xl border border-[var(--border-color)] font-medium'>Отмена</button>
          <button onClick={handleSubmit} className='flex-1 py-3 rounded-xl bg-[var(--primary-color)] text-white font-medium'>{isNew ? 'Создать' : 'Сохранить'}</button>
        </div>
      </div>
    </div>
  );
}

function PushAdmin() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tokens, setTokens] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('push_tokens').select('*').order('updated_at', { ascending: false });
    setTokens(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const sendPush = async () => {
    if (!title.trim() || !body.trim()) { toast.error('Заполните заголовок и текст'); return; }
    if (tokens.length === 0) { toast.error('Нет зарегистрированных устройств'); return; }

    setSending(true);
    setResult(null);

    try {
      // Get Firebase server key from Supabase edge function or send via FCM HTTP API
      const tokenValues = tokens.map(t => t.token);

      const { data, error } = await supabase.functions.invoke('send-push', {
        body: { title: title.trim(), body: body.trim(), tokens: tokenValues }
      });

      if (error) throw error;
      setResult({ success: true, message: `Отправлено на ${tokenValues.length} устройств` });
      setTitle('');
      setBody('');
    } catch (error) {
      console.error('Push send error:', error);
      setResult({ success: false, message: 'Ошибка: ' + (error.message || 'Неизвестная ошибка') });
    } finally {
      setSending(false);
    }
  };

  const inputClass = 'w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]';

  return (
    <div>
      <h2 className='text-xl font-bold mb-6'>Пуш-уведомления</h2>

      <div className='card mb-6'>
        <h3 className='font-semibold mb-4'>Отправить уведомление</h3>
        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium mb-1'>Заголовок</label>
            <input
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Новый подопечный!'
              className={inputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Текст</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='Помогите Асылу собрать средства на операцию'
              rows={3}
              className={inputClass}
            />
          </div>
          <button
            onClick={sendPush}
            disabled={sending || !title.trim() || !body.trim()}
            className='btn-primary w-full disabled:opacity-50'
          >
            {sending ? 'Отправка...' : `Отправить (${tokens.length} устройств)`}
          </button>

          {result && (
            <div className={`p-3 rounded-xl text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result.message}
            </div>
          )}
        </div>
      </div>

      <div className='card'>
        <h3 className='font-semibold mb-4'>Зарегистрированные устройства ({tokens.length})</h3>
        {loading ? (
          <div className='text-center py-4'>
            <Icon name="loader" size={24} className="text-[var(--primary-color)] animate-spin mx-auto" />
          </div>
        ) : tokens.length === 0 ? (
          <p className='text-[var(--text-secondary)] text-sm'>Нет устройств. Пуш-токены появятся когда пользователи установят приложение.</p>
        ) : (
          <div className='space-y-2'>
            {tokens.map(t => (
              <div key={t.id} className='flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl'>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium'>{t.platform === 'android' ? 'Android' : 'iOS'}</p>
                  <p className='text-xs text-[var(--text-secondary)] truncate font-mono'>{t.token.slice(0, 30)}...</p>
                </div>
                <p className='text-xs text-[var(--text-secondary)] ml-2 flex-shrink-0'>
                  {new Date(t.updated_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
