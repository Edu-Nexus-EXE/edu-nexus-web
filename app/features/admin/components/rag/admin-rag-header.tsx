import { useTranslation } from 'react-i18next'

export function AdminRagHeader() {
  const { t } = useTranslation('admin')

  return (
    <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12'>
      <div>
        <h2 className='font-display-lg text-4xl font-bold text-foreground mb-2'>
          {t('rag.title')}
        </h2>
        <p className='text-muted-foreground font-body-lg max-w-2xl opacity-80'>
          {t('rag.description')}
        </p>
      </div>
      <button className='bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all hover:opacity-90'>
        <span className='material-symbols-outlined'>upload_file</span>
        <span className='font-body-lg'>{t('rag.uploadButton')}</span>
      </button>
    </div>
  )
}
