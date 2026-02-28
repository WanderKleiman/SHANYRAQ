import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../../utils/adminAuth';
import { supabase } from '../../supabaseClient';
import Icon from '../../components/Icon';

const STATUS_CONFIG = {
  new: { label: 'Новые', color: 'orange' },
  invoice_sent: { label: 'Счёт выслан', color: 'blue' },
  paid: { label: 'Оплачено', color: 'green' },
  unpaid: { label: 'Не оплачено', color: 'red' }
};

const STATUS_COLORS = {
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  red: 'bg-red-100 text-red-700 border-red-200'
};

const TAB_ACTIVE_COLORS = {
  new: 'border-orange-500 text-orange-600',
  invoice_sent: 'border-blue-500 text-blue-600',
  paid: 'border-green-500 text-green-600',
  unpaid: 'border-red-500 text-red-600'
};

function AdminKaspiRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    if (!checkAuth()) {
      navigate('/admin');
    } else {
      fetchRequests();
    }
  }, [navigate]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kaspi_payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('kaspi_payment_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r)
      );
    }
  };

  const filteredRequests = requests.filter(r => r.status === activeTab);

  const counts = {
    new: requests.filter(r => r.status === 'new').length,
    invoice_sent: requests.filter(r => r.status === 'invoice_sent').length,
    paid: requests.filter(r => r.status === 'paid').length,
    unpaid: requests.filter(r => r.status === 'unpaid').length
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPhone = (phone) => {
    if (!phone || phone.length < 11) return phone;
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9)}`;
  };

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <h1 className='text-xl font-bold'>Kaspi запросы</h1>
        </div>
      </header>

      <nav className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4'>
        <div className='flex space-x-2 overflow-x-auto'>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === status
                  ? TAB_ACTIVE_COLORS[status]
                  : 'border-transparent text-[var(--text-secondary)]'
              }`}
            >
              {config.label} ({counts[status]})
            </button>
          ))}
        </div>
      </nav>

      <main className='p-4 space-y-3'>
        {loading ? (
          <div className='text-center py-8'>
            <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin mx-auto mb-2" />
            <p className='text-[var(--text-secondary)]'>Загрузка...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-[var(--text-secondary)]'>Нет запросов в этой категории</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className='bg-[var(--bg-primary)] rounded-2xl p-4 border border-[var(--border-color)]'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1'>
                  <p className='text-xs text-[var(--text-secondary)] mb-1'>{formatDate(req.created_at)}</p>
                  <p className='font-semibold text-[var(--text-primary)]'>{req.beneficiary_title}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[STATUS_CONFIG[req.status].color]}`}>
                  {STATUS_CONFIG[req.status].label}
                </span>
              </div>

              <div className='flex items-center space-x-4 mb-3'>
                <div className='flex items-center space-x-1 text-sm text-[var(--text-secondary)]'>
                  <Icon name="phone" size={14} />
                  <span>{formatPhone(req.phone)}</span>
                </div>
                <div className='font-bold text-[var(--text-primary)]'>
                  {req.amount?.toLocaleString()} ₸
                </div>
              </div>

              <div className='flex space-x-2'>
                {req.status === 'new' && (
                  <>
                    <button
                      onClick={() => updateStatus(req.id, 'invoice_sent')}
                      className='flex-1 py-2 px-3 bg-blue-500 text-white rounded-xl text-sm font-medium'
                    >
                      Счёт выслан
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, 'unpaid')}
                      className='flex-1 py-2 px-3 bg-red-500 text-white rounded-xl text-sm font-medium'
                    >
                      Не оплачено
                    </button>
                  </>
                )}
                {req.status === 'invoice_sent' && (
                  <>
                    <button
                      onClick={() => updateStatus(req.id, 'paid')}
                      className='flex-1 py-2 px-3 bg-green-500 text-white rounded-xl text-sm font-medium'
                    >
                      Оплачено ✅
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, 'unpaid')}
                      className='flex-1 py-2 px-3 bg-red-500 text-white rounded-xl text-sm font-medium'
                    >
                      Не оплачено ❌
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default AdminKaspiRequestsPage;
