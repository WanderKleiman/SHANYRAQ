import React, { Component, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Onboarding, { shouldShowOnboarding } from './components/Onboarding';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import MainPage from './pages/MainPage';
import Icon from './components/Icon';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { supabase } from './supabaseClient';
import { initPushNotifications } from './utils/pushNotifications';

// Lazy-loaded pages — загружаются только при переходе
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const AdminAccessPage = React.lazy(() => import('./pages/AdminAccessPage'));
const AboutFundPage = React.lazy(() => import('./pages/AboutFundPage'));
const DocumentsPage = React.lazy(() => import('./pages/DocumentsPage'));
const ContactsPage = React.lazy(() => import('./pages/ContactsPage'));
const PartnerFundsPage = React.lazy(() => import('./pages/PartnerFundsPage'));
const FundDetailPage = React.lazy(() => import('./pages/FundDetailPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ProfileSettingsPage = React.lazy(() => import('./pages/ProfileSettingsPage'));
const AuthCallbackPage = React.lazy(() => import('./pages/AuthCallbackPage'));
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminKaspiRequestsPage = React.lazy(() => import('./pages/admin/AdminKaspiRequestsPage'));
const PolicyPage = React.lazy(() => import('./pages/PolicyPage'));
const OfertaPage = React.lazy(() => import('./pages/OfertaPage'));

function PageLoader() {
  return (
    <div className='min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center'>
      <Icon name="loader" size={28} className="text-[var(--primary-color)] animate-spin" />
    </div>
  );
}

// Handle OAuth callback — redirect to /profile only on fresh sign-in (not on app reload)
function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    let hadSession = false;
    // Check if user already has a session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      hadSession = !!session;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Only redirect on fresh sign-in (user didn't have session before)
      if (event === 'SIGNED_IN' && !hadSession) {
        hadSession = true;
        navigate('/profile', { replace: true });
      }
    });
    return () => { subscription.unsubscribe(); };
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

function AppLayout({ children, selectedCity, onCityChange, hideHeader }) {
  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      {!hideHeader && (
        <div className='mobile-hide'>
          <Header />
        </div>
      )}

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

  // Initialize push notifications on app start
  useEffect(() => {
    initPushNotifications();
  }, []);

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
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <AuthCallback />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path='/'
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange} hideHeader>
                <MainPage />
              </AppLayout>
            }
          />
          <Route
            path='/feed'
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <HomePage />
              </AppLayout>
            }
          />
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
          <Route
            path='/fund/:name'
            element={
              <AppLayout selectedCity={selectedCity} onCityChange={handleCityChange}>
                <FundDetailPage />
              </AppLayout>
            }
          />
          <Route path='/admin' element={<AdminLoginPage />} />
          <Route path='/admin/dashboard' element={<AdminDashboardPage />} />
          <Route path='/admin/kaspi-requests' element={<AdminKaspiRequestsPage />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
