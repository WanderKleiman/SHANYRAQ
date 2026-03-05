class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Export error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>Ошибка экспорта</h1>
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

function ExportApp() {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [exportData, setExportData] = React.useState(null);

  const tables = [
    { id: 'charity_beneficiary', name: 'Подопечные', icon: 'users' },
    { id: 'admin_user', name: 'Администраторы', icon: 'shield' },
    { id: 'partner_fund', name: 'Фонды-партнеры', icon: 'handshake' },
    { id: 'company_profile', name: 'Спонсоры', icon: 'building' }
  ];

  const exportTable = async (tableId) => {
    setLoading(true);
    setStatus(`Загрузка данных из таблицы: ${tableId}...`);
    
    try {
      const result = await window.trickleListObjects(tableId, 100, true);
      setStatus(`Загружено ${result.items.length} записей`);
      setExportData({ tableId, data: result.items });
      return result.items;
    } catch (error) {
      console.error('Export error:', error);
      setStatus(`Ошибка: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = (tableId, data) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableId}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (tableId, data) => {
    if (!data || data.length === 0) return;
    
    const headers = ['objectId', 'objectType', 'createdAt', 'updatedAt'];
    const dataKeys = Object.keys(data[0].objectData || {});
    const allHeaders = [...headers, ...dataKeys.map(k => `data_${k}`)];
    
    let csv = allHeaders.join(',') + '\n';
    
    data.forEach(item => {
      const row = [
        item.objectId,
        item.objectType,
        item.createdAt,
        item.updatedAt,
        ...dataKeys.map(k => {
          const value = item.objectData[k];
          if (typeof value === 'object') return JSON.stringify(value);
          return `"${String(value).replace(/"/g, '""')}"`;
        })
      ];
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (tableId, format) => {
    const data = await exportTable(tableId);
    if (!data) return;
    
    if (format === 'json') {
      downloadJSON(tableId, data);
    } else if (format === 'csv') {
      downloadCSV(tableId, data);
    }
  };

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      <header className='bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4'>
        <div className='flex items-center space-x-3'>
          <button 
            onClick={() => window.location.href = 'index.html'}
            className='w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center'
          >
            <div className='icon-arrow-left text-lg' />
          </button>
          <div>
            <h1 className='text-xl font-bold'>Экспорт базы данных</h1>
            <p className='text-sm text-[var(--text-secondary)]'>Выгрузка данных в CSV или JSON</p>
          </div>
        </div>
      </header>

      <div className='p-4 space-y-4'>
        {status && (
          <div className='card bg-blue-50 border border-blue-200'>
            <div className='flex items-center space-x-3'>
              <div className={`icon-${loading ? 'loader animate-spin' : 'check-circle'} text-lg text-blue-600`} />
              <span className='text-sm text-blue-800'>{status}</span>
            </div>
          </div>
        )}

        <div className='space-y-3'>
          {tables.map(table => (
            <div key={table.id} className='card'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center'>
                    <div className={`icon-${table.icon} text-lg text-[var(--primary-color)]`} />
                  </div>
                  <div>
                    <h3 className='font-semibold'>{table.name}</h3>
                    <p className='text-xs text-[var(--text-secondary)]'>{table.id}</p>
                  </div>
                </div>
              </div>
              
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleExport(table.id, 'json')}
                  disabled={loading}
                  className='btn-primary flex-1 flex items-center justify-center space-x-2'
                >
                  <div className='icon-download text-lg' />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => handleExport(table.id, 'csv')}
                  disabled={loading}
                  className='btn-secondary flex-1 flex items-center justify-center space-x-2'
                >
                  <div className='icon-file-text text-lg' />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className='card bg-yellow-50 border border-yellow-200'>
          <div className='flex items-start space-x-3'>
            <div className='icon-info text-lg text-yellow-600 flex-shrink-0' />
            <div className='text-sm text-yellow-800'>
              <p className='font-medium mb-1'>Важная информация:</p>
              <ul className='space-y-1 list-disc list-inside'>
                <li>JSON формат сохраняет всю структуру данных</li>
                <li>CSV формат удобен для Excel/Google Sheets</li>
                <li>Максимум 100 записей за один экспорт</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ExportApp />
  </ErrorBoundary>
);