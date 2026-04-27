function Stats() {
  try {
    const stats = [
      { number: '10K+', label: 'Active Users' },
      { number: '99.9%', label: 'Uptime' },
      { number: '50M+', label: 'API Requests Daily' },
      { number: '4.9/5', label: 'Customer Rating' }
    ];

    return (
      <section className="py-20 bg-[var(--primary-color)]" data-name="stats" data-file="components/Stats.js">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-indigo-200 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Stats component error:', error);
    return null;
  }
}