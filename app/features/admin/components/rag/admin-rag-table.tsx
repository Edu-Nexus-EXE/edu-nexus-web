import { useTranslation } from 'react-i18next'

export function AdminRagTable() {
  const { t } = useTranslation('admin')

  return (
    <div className='xl:col-span-8'>
      <div className='bg-card rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-muted/50'>
                <th className='px-6 py-4 font-label-md text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  {t('rag.table.title')}
                </th>
                <th className='px-6 py-4 font-label-md text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  {t('rag.table.sourceType')}
                </th>
                <th className='px-6 py-4 font-label-md text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  {t('rag.table.chunks')}
                </th>
                <th className='px-6 py-4 font-label-md text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  {t('rag.table.status')}
                </th>
                <th className='px-6 py-4 font-label-md text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right'>
                  {t('rag.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              <tr className='hover:bg-muted/30 transition-colors'>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <span className='material-symbols-outlined text-primary'>picture_as_pdf</span>
                    <span className='font-bold text-foreground'>Giáo trình Python Cơ bản.pdf</span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t('rag.table.uploadedAt')} 12/10/2023 08:30
                  </p>
                </td>
                <td className='px-6 py-4 text-muted-foreground'>Lý thuyết Công nghệ</td>
                <td className='px-6 py-4 font-medium'>142</td>
                <td className='px-6 py-4'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold'>
                    <span className='w-1.5 h-1.5 rounded-full bg-success'></span>
                    {t('rag.table.statusCompleted')}
                  </span>
                </td>
                <td className='px-6 py-4 text-right'>
                  <button className='p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10'>
                    <span className='material-symbols-outlined'>delete</span>
                  </button>
                </td>
              </tr>
              <tr className='bg-muted/20 hover:bg-muted/30 transition-colors'>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <span className='material-symbols-outlined text-primary'>picture_as_pdf</span>
                    <span className='font-bold text-foreground'>Kỹ năng Giao tiếp Quản lý.pdf</span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t('rag.table.uploadedAt')} 11/10/2023 14:15
                  </p>
                </td>
                <td className='px-6 py-4 text-muted-foreground'>Kỹ năng mềm</td>
                <td className='px-6 py-4 font-medium'>89</td>
                <td className='px-6 py-4'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold animate-pulse'>
                    <span className='w-1.5 h-1.5 rounded-full bg-blue-500'></span>
                    {t('rag.table.statusProcessing')}
                  </span>
                </td>
                <td className='px-6 py-4 text-right'>
                  <button className='p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10'>
                    <span className='material-symbols-outlined'>delete</span>
                  </button>
                </td>
              </tr>
              <tr className='hover:bg-muted/30 transition-colors'>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <span className='material-symbols-outlined text-primary'>picture_as_pdf</span>
                    <span className='font-bold text-foreground'>Tài liệu Deep Learning.pdf</span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t('rag.table.uploadedAt')} 10/10/2023 09:00
                  </p>
                </td>
                <td className='px-6 py-4 text-muted-foreground'>Nghiên cứu AI</td>
                <td className='px-6 py-4 font-medium'>0</td>
                <td className='px-6 py-4'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold'>
                    <span className='w-1.5 h-1.5 rounded-full bg-muted-foreground'></span>
                    {t('rag.table.statusPending')}
                  </span>
                </td>
                <td className='px-6 py-4 text-right'>
                  <button className='p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10'>
                    <span className='material-symbols-outlined'>delete</span>
                  </button>
                </td>
              </tr>
              <tr className='bg-muted/20 hover:bg-muted/30 transition-colors'>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <span className='material-symbols-outlined text-primary'>picture_as_pdf</span>
                    <span className='font-bold text-foreground'>Data Structures Review.pdf</span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t('rag.table.uploadedAt')} 09/10/2023 16:45
                  </p>
                </td>
                <td className='px-6 py-4 text-muted-foreground'>Computer Science</td>
                <td className='px-6 py-4 font-medium'>210</td>
                <td className='px-6 py-4'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold'>
                    <span className='w-1.5 h-1.5 rounded-full bg-success'></span>
                    {t('rag.table.statusCompleted')}
                  </span>
                </td>
                <td className='px-6 py-4 text-right'>
                  <button className='p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10'>
                    <span className='material-symbols-outlined'>delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
