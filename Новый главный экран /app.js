class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen flex items-center justify-center">
        <p>Что-то пошло не так</p>
      </div>;
    }
    return this.props.children;
  }
}

function App() {
  try {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]" data-name="app" data-file="app.js">
        {/* Десктопная версия — лендинг */}
        <DesktopHero />

        {/* Мобильная версия — скрыта на десктопе */}
        <div className="md:hidden">
          <Header />
          <SearchBar />
          <CategoryCards />
          <TotalAmount />
          <PartnerFunds />
          <div className="h-16"></div>
        </div>
        <FloatingDownload />
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
