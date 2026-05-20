import { useTranslation } from 'react-i18next'

export function AdminResourceBanner() {
  const { t } = useTranslation('admin')

  return (
    <div className='mt-12 rounded-2xl h-64 overflow-hidden relative'>
      <img
        alt='Professional workspace'
        className='w-full h-full object-cover'
        src='https://lh3.googleusercontent.com/aida-public/AB6AXuB0uCnM9vsBX-D0IxCGrpdWkFIHrueoSdcX4hvKdIorPH18QQzyWXU1amOSE5zWOWjnv9mGmWsOiNxRtJuJ7KE6H50vKbGwGMLrE8RRCWfJQxnVWT6wGqv4UH-C6G5t_J5VQpWSTb1ioTAGZKv9-zmeq4AVaG4VCmw2Xf-7msyM5ZEy4Rn0E4NAmhsKggIAxyLzKiXYFDbf06j0g5HP4jbo6BwUaD-Rld0pyUyFH9MtvIY27iFTmQNtqjbrWNHwY_IcsF6yJr5OoV1Z'
      />
      <div className='absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent flex flex-col justify-end p-8'>
        <h4 className='text-background text-2xl font-bold'>{t('resources.banner.title')}</h4>
        <p className='text-background/80 text-sm max-w-xl mt-2'>{t('resources.banner.subtitle')}</p>
      </div>
    </div>
  )
}
