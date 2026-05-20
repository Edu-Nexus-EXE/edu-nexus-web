import { useTranslation } from 'react-i18next'

export function AdminResourceTable() {
  const { t } = useTranslation('admin')

  return (
    <section className='bg-card rounded-2xl border border-border overflow-hidden shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='bg-muted/50 border-b border-border'>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                {t('resources.table.titleAndProvider')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                {t('resources.table.type')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                {t('resources.table.copyright')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                {t('resources.table.status')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right'>
                {t('resources.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {/* Row 1 */}
            <tr className='hover:bg-muted/50 transition-colors'>
              <td className='px-6 py-5'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                    <span className='material-symbols-outlined text-primary'>auto_stories</span>
                  </div>
                  <div>
                    <p className='font-bold text-foreground text-sm'>Cấu trúc dữ liệu và Giải thuật nâng cao</p>
                    <p className='text-muted-foreground text-xs mt-0.5'>Provider: Đại học Bách Khoa</p>
                  </div>
                </div>
              </td>
              <td className='px-6 py-5'>
                <span className='bg-muted px-3 py-1 rounded-full text-[11px] font-bold text-muted-foreground uppercase'>
                  Course
                </span>
              </td>
              <td className='px-6 py-5'>
                <div className='flex items-center gap-2'>
                  <span className='material-symbols-outlined text-success text-base'>check_circle</span>
                  <span className='text-sm font-semibold text-foreground'>{t('resources.table.free')}</span>
                </div>
              </td>
              <td className='px-6 py-5'>
                <span className='inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success font-bold text-[10px] uppercase tracking-wider'>
                  <span className='w-1.5 h-1.5 rounded-full bg-success mr-2'></span>
                  {t('resources.table.approved')}
                </span>
              </td>
              <td className='px-6 py-5 text-right'>
                <div className='flex justify-end gap-1'>
                  <button className='p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors'>
                    <span className='material-symbols-outlined text-[20px]'>edit</span>
                  </button>
                  <button className='p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors'>
                    <span className='material-symbols-outlined text-[20px]'>delete</span>
                  </button>
                  <button className='p-2 text-success opacity-30 cursor-not-allowed'>
                    <span className='material-symbols-outlined text-[20px]'>verified</span>
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className='hover:bg-muted/50 transition-colors'>
              <td className='px-6 py-5'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                    <span className='material-symbols-outlined text-primary'>description</span>
                  </div>
                  <div>
                    <p className='font-bold text-foreground text-sm'>Ngân hàng câu hỏi Kinh tế vi mô 2024</p>
                    <p className='text-muted-foreground text-xs mt-0.5'>Provider: CLB Học thuật UEH</p>
                  </div>
                </div>
              </td>
              <td className='px-6 py-5'>
                <span className='bg-muted px-3 py-1 rounded-full text-[11px] font-bold text-muted-foreground uppercase'>
                  Document
                </span>
              </td>
              <td className='px-6 py-5'>
                <div className='flex items-center gap-2 text-primary'>
                  <span className='material-symbols-outlined text-base'>payments</span>
                  <span className='text-sm font-semibold'>{t('resources.table.paid')}</span>
                </div>
              </td>
              <td className='px-6 py-5'>
                <span className='inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider'>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary mr-2'></span>
                  {t('resources.table.pending')}
                </span>
              </td>
              <td className='px-6 py-5 text-right'>
                <div className='flex justify-end gap-1'>
                  <button className='p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors'>
                    <span className='material-symbols-outlined text-[20px]'>edit</span>
                  </button>
                  <button className='p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors'>
                    <span className='material-symbols-outlined text-[20px]'>delete</span>
                  </button>
                  <button className='p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-sm'>
                    <span className='material-symbols-outlined text-[20px]'>check_circle</span>
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className='hover:bg-muted/50 transition-colors'>
              <td className='px-6 py-5'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0'>
                    <span className='material-symbols-outlined text-muted-foreground'>edit_note</span>
                  </div>
                  <div>
                    <p className='font-bold text-foreground text-sm'>Draft: Tổng hợp đề thi IELTs 9.0</p>
                    <p className='text-muted-foreground text-xs mt-0.5'>Provider: Academic Team</p>
                  </div>
                </div>
              </td>
              <td className='px-6 py-5'>
                <span className='bg-muted px-3 py-1 rounded-full text-[11px] font-bold text-muted-foreground uppercase'>
                  Document
                </span>
              </td>
              <td className='px-6 py-5'>
                <div className='flex items-center gap-2 text-muted-foreground/50'>
                  <span className='material-symbols-outlined text-base'>pending</span>
                  <span className='text-sm font-semibold'>{t('resources.table.tbc')}</span>
                </div>
              </td>
              <td className='px-6 py-5'>
                <span className='inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground font-bold text-[10px] uppercase tracking-wider'>
                  <span className='w-1.5 h-1.5 rounded-full bg-muted-foreground/50 mr-2'></span>
                  {t('resources.table.draft')}
                </span>
              </td>
              <td className='px-6 py-5 text-right'>
                <div className='flex justify-end gap-1'>
                  <button className='p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors'>
                    <span className='material-symbols-outlined text-[20px]'>edit</span>
                  </button>
                  <button className='p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors'>
                    <span className='material-symbols-outlined text-[20px]'>delete</span>
                  </button>
                  <button className='p-2 hover:bg-primary/10 text-primary rounded-lg transition-all'>
                    <span className='material-symbols-outlined text-[20px]'>publish</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className='px-6 py-4 flex items-center justify-between border-t border-border bg-muted/30'>
        <p className='text-xs font-semibold text-muted-foreground'>{t('resources.pagination')}</p>
        <div className='flex items-center gap-2'>
          <button className='p-1.5 rounded-lg hover:bg-card hover:shadow-sm text-muted-foreground transition-all'>
            <span className='material-symbols-outlined text-xl'>chevron_left</span>
          </button>
          <button className='w-9 h-9 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-md shadow-primary/20'>
            1
          </button>
          <button className='w-9 h-9 rounded-lg hover:bg-card hover:shadow-sm text-muted-foreground font-bold text-sm flex items-center justify-center transition-all'>
            2
          </button>
          <button className='w-9 h-9 rounded-lg hover:bg-card hover:shadow-sm text-muted-foreground font-bold text-sm flex items-center justify-center transition-all'>
            3
          </button>
          <button className='p-1.5 rounded-lg hover:bg-card hover:shadow-sm text-muted-foreground transition-all'>
            <span className='material-symbols-outlined text-xl'>chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  )
}
