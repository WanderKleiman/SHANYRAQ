function Features() {
  try {
    const features = [
      {
        icon: 'brain',
        title: 'Smart Automation',
        description: 'Automate repetitive tasks with intelligent AI workflows that learn and adapt.'
      },
      {
        icon: 'chart-bar',
        title: 'Data Analytics',
        description: 'Get actionable insights from your data with advanced AI-powered analytics.'
      },
      {
        icon: 'shield-check',
        title: 'Enterprise Security',
        description: 'Bank-level security with encryption and compliance built into every feature.'
      },
      {
        icon: 'zap',
        title: 'Lightning Fast',
        description: 'Process millions of data points in seconds with our optimized AI engine.'
      },
      {
        icon: 'users',
        title: 'Team Collaboration',
        description: 'Work together seamlessly with real-time collaboration and sharing.'
      },
      {
        icon: 'settings',
        title: 'Easy Integration',
        description: 'Connect with your existing tools through our powerful API and plugins.'
      }
    ];

    return (
      <section id="features" className="py-20 bg-white" data-name="features" data-file="components/Features.js">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-[var(--text-secondary)]">
              Powerful features designed to help your business grow
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl bg-[var(--bg-light)] hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-[var(--secondary-color)] rounded-xl flex items-center justify-center mb-4">
                  <div className={`icon-${feature.icon} text-2xl text-[var(--primary-color)]`}></div>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Features component error:', error);
    return null;
  }
}