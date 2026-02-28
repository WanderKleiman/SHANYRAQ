import React, { useState, useEffect } from 'react';
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
    const authData = checkAuth();
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
          <div className='card text-center py-8'>
            <p className='text-[var(--text-secondary)]'>Управление фондами</p>
          </div>
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

export default AdminDashboardPage;
