function SearchBar() {
  try {
    const [search, setSearch] = React.useState('');

    return (
      <div className="max-w-md md:max-w-xl mx-auto px-4 mb-4 md:mb-6" data-name="search-bar" data-file="components/SearchBar.js">
        <div className="relative">
          <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]">
            <div className="icon-search text-[16px] md:text-[18px]"></div>
          </div>
          <input
            type="text"
            placeholder="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 md:h-10 pl-10 md:pl-12 pr-4 bg-[#EAEAEA] rounded-[24px] border-0 text-[var(--text-primary)] placeholder-[#9E9E9E] text-[13px] md:text-[15px] focus:outline-none"
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('SearchBar component error:', error);
    return null;
  }
}
