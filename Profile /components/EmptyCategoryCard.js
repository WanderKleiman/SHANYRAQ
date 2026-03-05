function EmptyCategoryCard({ category, categoryName }) {
  const handleAddClick = () => {
    window.location.href = `index.html?category=${category}`;
  };

  return (
    <div
      onClick={handleAddClick}
      className='cursor-pointer transition-all border-2 border-dashed border-gray-300 rounded-2xl bg-green-50 flex-shrink-0 w-32 h-32 flex items-center justify-center'
      data-name='empty-category-card'
      data-file='components/EmptyCategoryCard.js'
    >
      <div className='flex flex-col items-center justify-center text-center px-2'>
        <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2'>
          <div className='icon-plus text-lg text-[var(--primary-color)]' />
        </div>
        <p className='text-xs text-[var(--text-secondary)] leading-tight'>
          Добавьте подопечных
        </p>
      </div>
    </div>
  );
}
