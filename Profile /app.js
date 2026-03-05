class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
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

function App() {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [selectedCity, setSelectedCity] = React.useState(() => {
    return localStorage.getItem('selectedCity') || 'Алматы';
  });
  const [showCitySelector, setShowCitySelector] = React.useState(false);
  const [charityData, setCharityData] = React.useState([]);
  const [selectedCharity, setSelectedCharity] = React.useState(null);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [paymentBeneficiary, setPaymentBeneficiary] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    initYandexMetrika();
    clearCache('beneficiaries');
    
    const hasSelectedCity = localStorage.getItem('selectedCity');
    if (!hasSelectedCity) {
      setTimeout(() => setShowCitySelector(true), 15000);
    }
  }, []);

  React.useEffect(() => {
    if (selectedCity) loadCharityData();
  }, [selectedCity]);

  const loadCharityData = async () => {
    setIsLoading(true);
    try {
      const data = await getCharityData(selectedCity);
      setCharityData(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
    setShowCitySelector(false);
  };

  const handleOpenPayment = (beneficiary) => {
    setPaymentBeneficiary(beneficiary);
    setShowPaymentModal(true);
    setSelectedCharity(null);
  };

  const filteredData = React.useMemo(() => {
    if (activeCategory === 'all') return charityData;
    return charityData.filter(item => item.category === activeCategory);
  }, [charityData, activeCategory]);

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <div className='mobile-hide'>
        <Header />
      </div>
      
      <main className='pb-20'>
        <div className='sticky top-0 bg-white bg-opacity-90 backdrop-blur-md z-10 pt-4 pb-2'>
          <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>
        
        <div className='px-4 mt-4'>
          {isLoading ? (
            <div className='text-center py-8'>
              <div className='icon-loader text-2xl text-[var(--primary-color)] animate-spin mx-auto mb-2' />
              <p className='text-[var(--text-secondary)]'>Загрузка подопечных...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className='text-center py-8'>
              <div className='icon-users text-3xl text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium mb-2'>Нет подопечных</h3>
              <p className='text-[var(--text-secondary)]'>
                {activeCategory === 'all' 
                  ? `В городе ${selectedCity} пока нет подопечных` 
                  : `В категории пока нет подопечных в городе ${selectedCity}`}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {filteredData.map(item => (
                <CharityCard 
                  key={item.id} 
                  data={item} 
                  onCardClick={() => setSelectedCharity(item)}
                  onHelpClick={() => handleOpenPayment(item)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation selectedCity={selectedCity} onCityChange={handleCityChange} />
      
      {showCitySelector && <CitySelectionModal onCitySelect={handleCityChange} />}
      {selectedCharity && (
        <CharityModal 
          data={selectedCharity} 
          onClose={() => setSelectedCharity(null)}
          onHelpClick={() => handleOpenPayment(selectedCharity)}
        />
      )}
      {showPaymentModal && (
        <PaymentModal
          beneficiary={paymentBeneficiary}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);