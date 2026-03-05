function HelpedBeneficiaryCard({ data }) {
  return (
    <div
      className='cursor-pointer transition-all flex-shrink-0 w-32'
      data-name='helped-beneficiary-card'
      data-file='components/HelpedBeneficiaryCard.js'
      onClick={() => window.location.href = `index.html?beneficiary=${data.id}`}
    >
      <div className='relative mb-2'>
        <img
          src={data.image}
          alt={data.name}
          className='w-32 h-32 object-cover rounded-2xl'
        />
      </div>
      <h3 className='text-xs font-medium text-[var(--text-primary)] mb-1 line-clamp-2'>
        {data.name}
      </h3>
      <p className='text-xs font-bold text-[var(--text-primary)]'>
        {data.helpAmount.toLocaleString()} ₸
      </p>
    </div>
  );
}
