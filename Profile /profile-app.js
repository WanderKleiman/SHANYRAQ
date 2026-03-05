class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Profile error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center'>
          <button onClick={() => window.location.reload()} className='btn-primary'>
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProfileApp() {
  const [userData, setUserData] = React.useState(null);
  const [helpedByCategory, setHelpedByCategory] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCity, setSelectedCity] = React.useState('Алматы');

  React.useEffect(() => {
    const city = localStorage.getItem('selectedCity') || 'Алматы';
    setSelectedCity(city);
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      setUserData(profile);
      setHelpedByCategory(profile.helpedByCategory);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='icon-loader text-2xl text-[var(--primary-color)] animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white pb-20'>
      <ProfileHeader userData={userData} />
      <div className='px-4 mt-6 space-y-6'>
        {['children', 'urgent', 'operations', 'animals', 'social', 'non_material'].map(category => (
          <CategoryHelpSection
            key={category}
            category={category}
            helpedList={helpedByCategory[category] || []}
            selectedCity={selectedCity}
          />
        ))}
      </div>
      <BottomNavigation selectedCity={selectedCity} onCityChange={setSelectedCity} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ProfileApp />
  </ErrorBoundary>
);