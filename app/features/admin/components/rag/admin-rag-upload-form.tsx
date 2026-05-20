import { useTranslation } from 'react-i18next'

export function AdminRagUploadForm() {
  const { t } = useTranslation('admin')

  return (
    <div className='bg-card p-6 rounded-xl shadow-sm'>
      <div className='flex items-center gap-2 mb-6'>
        <span className='material-symbols-outlined text-primary'>add_circle</span>
        <h3 className='font-bold text-lg text-foreground'>{t('rag.form.title')}</h3>
      </div>
      <form className='space-y-5'>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>
            {t('rag.form.fileLabel')}
          </label>
          <div className='border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group'>
            <span className='material-symbols-outlined text-4xl text-muted-foreground group-hover:text-primary transition-colors'>
              cloud_upload
            </span>
            <p className='mt-2 text-sm font-medium text-foreground'>{t('rag.form.dragDrop')}</p>
            <p className='text-xs text-muted-foreground'>{t('rag.form.orClick')}</p>
          </div>
        </div>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>
            {t('rag.form.docTitle')}
          </label>
          <input
            className='w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-foreground font-body-lg'
            placeholder={t('rag.form.docTitlePlaceholder')}
            type='text'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>
            {t('rag.form.sourceType')}
          </label>
          <select className='w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-foreground font-body-lg appearance-none'>
            <option>{t('rag.form.sourceTypes.textbook')}</option>
            <option>{t('rag.form.sourceTypes.research')}</option>
            <option>{t('rag.form.sourceTypes.slide')}</option>
            <option>{t('rag.form.sourceTypes.other')}</option>
          </select>
        </div>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>
            {t('rag.form.skills')}
          </label>
          <div className='space-y-2'>
            <div className='flex flex-wrap gap-2 mb-2'>
              <span className='bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1'>
                Python{' '}
                <span className='material-symbols-outlined text-xs cursor-pointer'>close</span>
              </span>
              <span className='bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1'>
                Data Science{' '}
                <span className='material-symbols-outlined text-xs cursor-pointer'>close</span>
              </span>
            </div>
            <input
              className='w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-foreground font-body-lg'
              placeholder={t('rag.form.skillsPlaceholder')}
              type='text'
            />
          </div>
        </div>
        <button
          className='w-full py-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all'
          type='button'
        >
          {t('rag.form.submit')}
        </button>
      </form>
    </div>
  )
}
