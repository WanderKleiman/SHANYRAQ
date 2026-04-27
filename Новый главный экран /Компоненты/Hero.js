function Hero() {
  try {
    return (
      <section className="bg-gradient-to-br from-[var(--bg-light)] to-white py-20" data-name="hero" data-file="components/Hero.js">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-[var(--secondary-color)] rounded-full">
                <span className="text-[var(--primary-color)] text-sm font-medium">✨ New AI Features Available</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
                Transform Your Business with AI
              </h1>
              
              <p className="text-xl text-[var(--text-secondary)] mb-8 leading-relaxed">
                Harness the power of artificial intelligence to automate workflows, gain insights, and scale your business faster than ever before.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary">Start Free Trial</button>
                <button className="btn-secondary">Watch Demo</button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-[var(--primary-color)] to-purple-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[var(--secondary-color)] rounded-full flex items-center justify-center">
                      <div className="icon-sparkles text-xl text-[var(--primary-color)]"></div>
                    </div>
                    <div>
                      <div className="h-3 w-32 bg-gray-200 rounded"></div>
                      <div className="h-2 w-24 bg-gray-100 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                    <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                    <div className="h-2 w-4/6 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Hero component error:', error);
    return null;
  }
}