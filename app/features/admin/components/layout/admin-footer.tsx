import { useTranslation } from 'react-i18next'

export function AdminFooter() {
  const { t } = useTranslation('admin')

  return (
    <footer className='mt-auto py-8 px-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm gap-4'>
      <p>{t('footer.copyright')}</p>
      <div className='flex gap-6 font-medium'>
        <a className='hover:text-primary transition-colors' href='#'>
          {t('footer.support')}
        </a>
        <a className='hover:text-primary transition-colors' href='#'>
          {t('footer.privacy')}
        </a>
        <a className='hover:text-primary transition-colors' href='#'>
          {t('footer.terms')}
        </a>
      </div>
    </footer>
  )
}
