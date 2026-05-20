import { useTranslation } from 'react-i18next'

export function AdminRagSummary() {
  const { t } = useTranslation('admin')

  return (
    <div className='bg-primary p-6 rounded-xl shadow-sm relative overflow-hidden'>
      <div className='relative z-10'>
        <h4 className='text-primary-foreground font-bold mb-4'>{t('rag.summary.title')}</h4>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white/20 backdrop-blur-md p-4 rounded-lg'>
            <p className='text-xs text-primary-foreground/80 uppercase font-bold'>
              {t('rag.summary.totalDocs')}
            </p>
            <p className='text-2xl font-black text-primary-foreground'>48</p>
          </div>
          <div className='bg-white/20 backdrop-blur-md p-4 rounded-lg'>
            <p className='text-xs text-primary-foreground/80 uppercase font-bold'>
              {t('rag.summary.totalChunks')}
            </p>
            <p className='text-2xl font-black text-primary-foreground'>12.4k</p>
          </div>
        </div>
      </div>
      <span className='material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/10 select-none pointer-events-none'>
        data_object
      </span>
    </div>
  )
}
