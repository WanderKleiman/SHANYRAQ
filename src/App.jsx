import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import ReportsPage from './pages/ReportsPage';
import AdminAccessPage from './pages/AdminAccessPage';
import AboutFundPage from './pages/AboutFundPage';
import DocumentsPage from './pages/DocumentsPage';
import ContactsPage from './pages/ContactsPage';
import PartnerFundsPage from './pages/PartnerFundsPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>Что-то пошло не так</h1>
            <button onClick={() => window.location.reload()} className='btn-primary'>
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppLayout({ children }) {
  const [selectedCity, setSelectedCity] = React.useState(() => {
    return localStorage.getItem('selectedCity') || 'Алматы';
  });

  const handleCityChange = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
  };

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <div className='mobile-hide'>
        <Header />
      </div>
      
      <main className='pb-20'>
        {children}
      </main>
      
      <BottomNavigation selectedCity={selectedCity} onCityChange={handleCityChange} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AppLayout><HomePage /></AppLayout>} />
          <Route path='/payment' element={<PaymentPage />} />
          <Route path='/reports' element={<AppLayout><ReportsPage /></AppLayout>} />
          <Route path='/admin-access' element={<AdminAccessPage />} />
          <Route path='/about' element={<AppLayout><AboutFundPage /></AppLayout>} />
          <Route path='/documents' element={<AppLayout><DocumentsPage /></AppLayout>} />
          <Route path='/contacts' element={<AppLayout><ContactsPage /></AppLayout>} />
          <Route path='/partner-funds' element={<AppLayout><PartnerFundsPage /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
