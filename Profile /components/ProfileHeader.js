function ProfileHeader({ userData }) {
  return (
    <div className='relative' data-name='profile-header' data-file='components/ProfileHeader.js'>
      <div className='relative h-48 overflow-hidden mb-4' style={{ clipPath: 'ellipse(80% 100% at 50% 0%)' }}>
        <img
          src='https://app.trickle.so/storage/public/images/usr_140a45f300000001/ae0b6fde-54ab-4b26-a878-98c220206cb8.png'
          alt='Profile background'
          className='w-full h-full object-cover'
        />
      </div>
      
      <div className='px-6 text-center'>
        <h1 className='text-xl font-bold text-[var(--text-primary)] mb-2'>
          {userData?.name || 'Пользователь'}
        </h1>
        <p className='text-sm text-[var(--text-secondary)]'>
          Помог на сумму: <span className='font-bold text-[var(--text-primary)]'>{userData?.totalHelp?.toLocaleString() || 0} ₸</span>
        </p>
      </div>
    </div>
  );
}
