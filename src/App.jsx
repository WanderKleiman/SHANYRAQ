import React, { Component, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Onboarding, { shouldShowOnboarding } from './components/Onboarding';
import AuthCallbackPage from './pages/AuthCallbackPage';
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
import FundDetailPage from './pages/FundDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminKaspiRequestsPage from './pages/admin/AdminKaspiRequestsPage';
import PolicyPage from './pages/PolicyPage';
import OfertaPage from './pages/OfertaPage';
import { AuthProvider } from './contexts/AuthContext';
import { supabase } from './supabaseClient';

// Handle OAuth callback — redirect to /profile after Google/Email auth
function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/profile', { replace: true });
      }
    });
  }, [navigate]);
  return null;
}

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

function AppLayout({ children, selectedCity, onCityChange }) {
  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <div className='mobile-hide'>
        <Header />
      </div>
      
      <main className='pb-20'>
        {React.cloneElement(children, { selectedCity, onCityChange })}
      </main>
      
      <BottomNavigation selectedCity={selectedCity} onCityChange={onCityChange} />
    </div>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding);
  const [selectedCity, setSelectedCity] = React.useState(() => {
    return localStorage.getItem('selectedCity') || 'Алматы';
  });

  const handleCityChange = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
      <BrowserRouter>
        <AuthCallback />
        <Routes>
          <Route 
            path='/' 
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <HomePage />
              </AppLayout>
            } 
          />
          <Route path='/payment' element={<PaymentPage />} />
          <Route 
            path='/reports' 
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <ReportsPage />
              </AppLayout>
            } 
          />
          <Route path='/admin-access' element={<AdminAccessPage />} />
          <Route 
            path='/about' 
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <AboutFundPage />
              </AppLayout>
            } 
          />
          <Route 
            path='/documents' 
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <DocumentsPage />
              </AppLayout>
            } 
          />
          <Route 
            path='/contacts' 
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <ContactsPage />
              </AppLayout>
            } 
          />
          <Route 
            path='/partner-funds' 
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <PartnerFundsPage />
              </AppLayout>
            } 
          />
          <Route
            path='/profile'
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <ProfilePage />
              </AppLayout>
            }
          />
          <Route
            path='/profile/settings'
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <ProfileSettingsPage />
              </AppLayout>
            }
          />
          <Route path='/auth-callback' element={<AuthCallbackPage />} />
          <Route path='/policy' element={<PolicyPage />} />
          <Route path='/oferta' element={<OfertaPage />} />
          <Route path='/fund/:name' element={<FundDetailPage />} />
          <Route path='/admin' element={<AdminLoginPage />} />
<Route path='/admin/dashboard' element={<AdminDashboardPage />} />
          <Route path='/admin/kaspi-requests' element={<AdminKaspiRequestsPage />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
