function FloatingDownload() {
  try {
    return (
      <div className="md:hidden fixed bottom-4 left-3 right-3 z-50" data-name="floating-download" data-file="components/FloatingDownload.js">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] text-center mb-2">
          В приложении удобнее
        </p>
        <div className="flex gap-3 justify-center">
          <a href="https://play.google.com/store/apps/details?id=com.example.app" className="block flex-1">
            <img
              src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/Google%20.png"
              alt="Google Play"
              className="h-[52px] w-full object-contain"
            />
          </a>
          <a href="https://apps.apple.com/app/id000000000" className="block flex-1">
            <img
              src="https://bvxccwndrkvnwmfbfhql.supabase.co/storage/v1/object/public/images/app%20store%20.png"
              alt="App Store"
              className="h-[52px] w-full object-contain"
            />
          </a>
        </div>
      </div>
    );
  } catch (error) {
    console.error('FloatingDownload component error:', error);
    return null;
  }
}
