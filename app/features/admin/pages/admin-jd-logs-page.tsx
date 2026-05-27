import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function AdminJdLogsPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='p-8 max-w-7xl mx-auto w-full space-y-8'>
      {/* Hero/Header Section */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div>
          <nav className='flex gap-2 text-xs text-muted-foreground mb-2'>
            <span>{t('jdLogs.breadcrumb.system')}</span>
            <span>/</span>
            <span className='text-primary font-medium'>{t('jdLogs.breadcrumb.current')}</span>
          </nav>
          <h2 className='text-4xl font-bold text-foreground'>{t('jdLogs.title')}</h2>
          <p className='text-muted-foreground max-w-2xl mt-1'>{t('jdLogs.subtitle')}</p>
        </div>
        <div className='flex gap-3'>
          <button className='px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20'>
            <span className='material-symbols-outlined'>add</span>
            {t('jdLogs.newAnalysis')}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <section className='bg-card p-6 rounded-xl space-y-4 border border-border shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='md:col-span-2 relative'>
            <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
              search
            </span>
            <input
              className='w-full pl-10 pr-4 py-3 bg-muted border-none ring-1 ring-border focus:ring-2 focus:ring-primary/50 rounded-lg text-foreground'
              placeholder={t('jdLogs.filter.searchPlaceholder')}
              type='text'
            />
          </div>
          <div className='relative'>
            <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
              filter_list
            </span>
            <select className='w-full pl-10 pr-4 py-3 bg-muted border-none ring-1 ring-border focus:ring-2 focus:ring-primary/50 rounded-lg text-foreground appearance-none'>
              <option>{t('jdLogs.filter.statusAll')}</option>
              <option>Success</option>
              <option>Failed</option>
            </select>
          </div>
          <div className='relative'>
            <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
              calendar_today
            </span>
            <input
              className='w-full pl-10 pr-4 py-3 bg-muted border-none ring-1 ring-border focus:ring-2 focus:ring-primary/50 rounded-lg text-foreground'
              type='date'
            />
          </div>
        </div>
      </section>

      {/* Data Table */}
      <div className='bg-card rounded-xl overflow-hidden shadow-sm border border-border'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-muted'>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.date')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.email')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.jdTitle')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.source')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.status')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right'>
                  {t('jdLogs.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {/* Row 1 — Success */}
              <tr className='hover:bg-muted/50 transition-colors'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex flex-col'>
                    <span className='font-medium text-foreground'>Oct 24, 2023</span>
                    <span className='text-xs text-muted-foreground'>14:20 PM</span>
                  </div>
                </td>
                <td className='px-6 py-4 text-muted-foreground'>nguyen.van@edu-bridge.com</td>
                <td className='px-6 py-4 font-medium text-foreground'>Senior Frontend Developer</td>
                <td className='px-6 py-4'>
                  <span className='px-2 py-1 bg-muted text-xs rounded-full border border-border'>LinkedIn</span>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-1.5 text-success font-medium text-sm'>
                    <span className='material-symbols-outlined text-sm' style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    Success
                  </div>
                </td>
                <td className='px-6 py-4 text-right space-x-1'>
                  <Link
                    to='/admin/jd-logs/JD-9922'
                    className='p-2 inline-flex hover:bg-muted rounded-lg text-primary transition-colors'
                    title={t('jdLogs.actions.view')}
                  >
                    <span className='material-symbols-outlined'>visibility</span>
                  </Link>
                  <button
                    className='p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors'
                    title={t('jdLogs.actions.retry')}
                  >
                    <span className='material-symbols-outlined'>refresh</span>
                  </button>
                  <button
                    className='p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors'
                    title={t('jdLogs.actions.delete')}
                  >
                    <span className='material-symbols-outlined'>delete</span>
                  </button>
                </td>
              </tr>

              {/* Row 2 — Failed */}
              <tr className='hover:bg-muted/50 transition-colors'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex flex-col'>
                    <span className='font-medium text-foreground'>Oct 14, 2023</span>
                    <span className='text-xs text-muted-foreground'>09:42 AM</span>
                  </div>
                </td>
                <td className='px-6 py-4 text-muted-foreground'>hoang.anh@company.com</td>
                <td className='px-6 py-4 font-medium text-foreground'>Software Engineer</td>
                <td className='px-6 py-4'>
                  <span className='px-2 py-1 bg-muted text-xs rounded-full border border-border'>File Upload</span>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-1.5 text-destructive font-medium text-sm'>
                    <span className='material-symbols-outlined text-sm' style={{ fontVariationSettings: "'FILL' 1" }}>
                      error
                    </span>
                    Failed
                  </div>
                </td>
                <td className='px-6 py-4 text-right space-x-1'>
                  <Link
                    to='/admin/jd-logs/JD-9921'
                    className='p-2 inline-flex hover:bg-muted rounded-lg text-primary transition-colors'
                    title={t('jdLogs.actions.view')}
                  >
                    <span className='material-symbols-outlined'>visibility</span>
                  </Link>
                  <button
                    className='p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors'
                    title={t('jdLogs.actions.retry')}
                  >
                    <span className='material-symbols-outlined'>refresh</span>
                  </button>
                  <button
                    className='p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors'
                    title={t('jdLogs.actions.delete')}
                  >
                    <span className='material-symbols-outlined'>delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='px-6 py-4 bg-muted flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border'>
          <span className='text-sm text-muted-foreground'>
            {t('jdLogs.pagination', { start: 1, end: 5, total: 128 })}
          </span>
          <div className='flex items-center gap-2'>
            <button
              className='w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all disabled:opacity-50'
              disabled
            >
              <span className='material-symbols-outlined'>chevron_left</span>
            </button>
            <button className='w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold'>
              1
            </button>
            <button className='w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all'>
              2
            </button>
            <button className='w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all'>
              3
            </button>
            <span className='px-2 text-muted-foreground'>...</span>
            <button className='w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all'>
              26
            </button>
            <button className='w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all'>
              <span className='material-symbols-outlined'>chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pb-4'>
        <div className='bg-card p-6 rounded-xl shadow-sm border border-border flex items-center gap-4'>
          <div className='w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center'>
            <span className='material-symbols-outlined'>task</span>
          </div>
          <div>
            <p className='text-xs text-muted-foreground font-bold uppercase tracking-wider'>
              {t('jdLogs.stats.totalProcessed')}
            </p>
            <p className='text-2xl font-bold text-foreground'>1,284</p>
          </div>
        </div>
        <div className='bg-card p-6 rounded-xl shadow-sm border border-border flex items-center gap-4'>
          <div className='w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center'>
            <span className='material-symbols-outlined'>check_circle</span>
          </div>
          <div>
            <p className='text-xs text-muted-foreground font-bold uppercase tracking-wider'>
              {t('jdLogs.stats.success24h')}
            </p>
            <p className='text-2xl font-bold text-foreground'>42</p>
          </div>
        </div>
        <div className='bg-card p-6 rounded-xl shadow-sm border border-border flex items-center gap-4'>
          <div className='w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center'>
            <span className='material-symbols-outlined'>error</span>
          </div>
          <div>
            <p className='text-xs text-muted-foreground font-bold uppercase tracking-wider'>
              {t('jdLogs.stats.systemErrors')}
            </p>
            <p className='text-2xl font-bold text-foreground'>03</p>
          </div>
        </div>
      </div>
    </div>
  )
}
