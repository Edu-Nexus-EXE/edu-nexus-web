import { useTranslation, Trans } from 'react-i18next'
import { Link } from 'react-router'

export function AdminUserManagementPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-8'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div>
          <h2 className='text-4xl font-bold text-primary mb-2'>{t('users.title')}</h2>
          <p className='text-muted-foreground'>{t('users.description')}</p>
        </div>
        <div className='flex gap-3'>
          <button className='px-6 py-3 bg-card text-primary border border-primary font-bold rounded-lg hover:bg-primary/5 transition-all active:scale-95 flex items-center gap-2'>
            <span className='material-symbols-outlined text-[20px]'>file_download</span>
            {t('users.exportExcel')}
          </button>
          <button className='px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center gap-2'>
            <span className='material-symbols-outlined text-[20px]'>person_add</span>
            {t('users.addNew')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <section className='bg-card rounded-xl p-6 shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='space-y-2'>
            <label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('users.filter.searchLabel')}
            </label>
            <div className='relative'>
              <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                alternate_email
              </span>
              <input
                className='w-full pl-10 pr-4 py-3 bg-muted border-none rounded-lg focus:ring-2 focus:ring-primary/50'
                placeholder={t('users.filter.searchPlaceholder')}
                type='text'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('users.filter.tierLabel')}
            </label>
            <select className='w-full px-4 py-3 bg-muted border-none rounded-lg focus:ring-2 focus:ring-primary/50 appearance-none'>
              <option>{t('users.filter.tiers.all')}</option>
              <option>{t('users.filter.tiers.free')}</option>
              <option>{t('users.filter.tiers.pro')}</option>
              <option>{t('users.filter.tiers.enterprise')}</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('users.filter.statusLabel')}
            </label>
            <select className='w-full px-4 py-3 bg-muted border-none rounded-lg focus:ring-2 focus:ring-primary/50 appearance-none'>
              <option>{t('users.filter.statuses.all')}</option>
              <option>{t('users.filter.statuses.active')}</option>
              <option>{t('users.filter.statuses.banned')}</option>
            </select>
          </div>
          <div className='flex items-end'>
            <button className='w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2'>
              <span className='material-symbols-outlined'>filter_list</span>
              {t('users.filter.apply')}
            </button>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className='bg-card rounded-xl overflow-hidden shadow-sm'>
        <div className='overflow-x-auto custom-scrollbar'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-muted/50'>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.user')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.tier')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.registered')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.expired')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.jdCount')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.status')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none text-right'>
                  {t('users.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {/* Row 1 */}
              <tr className='hover:bg-muted/30 transition-colors cursor-pointer'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold'>
                      NH
                    </div>
                    <div>
                      <p className='font-bold text-foreground'>Nguyễn Hoàng</p>
                      <p className='text-sm text-muted-foreground'>hoang.nguyen@gmail.com</p>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-xs font-bold uppercase tracking-wider'>
                    Enterprise
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <span className='flex items-center gap-1.5 text-sm font-medium'>
                    <span className='w-2 h-2 rounded-full bg-success'></span>
                    {t('users.table.active')}
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <p className='text-sm'>24/12/2024</p>
                </td>
                <td className='px-6 py-5 font-bold'>128</td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1 bg-success/10 text-success rounded-lg text-xs font-bold uppercase'>
                    {t('users.table.normal')}
                  </span>
                </td>
                <td className='px-6 py-5 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <Link
                      to='/admin/users/hoang.nguyen@gmail.com'
                      className='p-2 hover:bg-muted rounded-lg text-primary transition-colors inline-flex items-center justify-center'
                      title={t('users.table.viewAction')}
                    >
                      <span className='material-symbols-outlined text-lg'>visibility</span>
                    </Link>
                    <button className='px-3 py-1.5 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 whitespace-nowrap'>
                      {t('users.table.banAction')}
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className='hover:bg-muted/30 transition-colors cursor-pointer'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold'>
                      TM
                    </div>
                    <div>
                      <p className='font-bold text-foreground'>Trần Minh</p>
                      <p className='text-sm text-muted-foreground'>minhtran.dev@outlook.com</p>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-bold uppercase tracking-wider'>
                    Pro
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <span className='flex items-center gap-1.5 text-sm font-medium'>
                    <span className='w-2 h-2 rounded-full bg-warning'></span>
                    {t('users.table.expiredStatus')}
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <p className='text-sm text-muted-foreground'>15/05/2024</p>
                </td>
                <td className='px-6 py-5 font-bold'>42</td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1 bg-destructive/10 text-destructive rounded-lg text-xs font-bold uppercase'>
                    {t('users.table.banned')}
                  </span>
                </td>
                <td className='px-6 py-5 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <Link
                      to='/admin/users/minhtran.dev@outlook.com'
                      className='p-2 hover:bg-muted rounded-lg text-primary transition-colors inline-flex items-center justify-center'
                      title={t('users.table.viewAction')}
                    >
                      <span className='material-symbols-outlined text-lg'>visibility</span>
                    </Link>
                    <button className='px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 whitespace-nowrap'>
                      {t('users.table.unbanAction')}
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className='hover:bg-muted/30 transition-colors cursor-pointer'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold'>
                      LA
                    </div>
                    <div>
                      <p className='font-bold text-foreground'>Lê Anh</p>
                      <p className='text-sm text-muted-foreground'>le.anh.92@edu.vn</p>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-bold uppercase tracking-wider'>
                    Free
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <span className='flex items-center gap-1.5 text-sm font-medium'>
                    <span className='w-2 h-2 rounded-full bg-success'></span>
                    {t('users.table.active')}
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <p className='text-sm'>{t('users.table.indefinite')}</p>
                </td>
                <td className='px-6 py-5 font-bold'>5</td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1 bg-success/10 text-success rounded-lg text-xs font-bold uppercase'>
                    {t('users.table.normal')}
                  </span>
                </td>
                <td className='px-6 py-5 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <Link
                      to='/admin/users/le.anh.92@edu.vn'
                      className='p-2 hover:bg-muted rounded-lg text-primary transition-colors inline-flex items-center justify-center'
                      title={t('users.table.viewAction')}
                    >
                      <span className='material-symbols-outlined text-lg'>visibility</span>
                    </Link>
                    <button className='px-3 py-1.5 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 whitespace-nowrap'>
                      {t('users.table.banAction')}
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className='hover:bg-muted/30 transition-colors cursor-pointer'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold'>
                      PT
                    </div>
                    <div>
                      <p className='font-bold text-foreground'>Phạm Thảo</p>
                      <p className='text-sm text-muted-foreground'>thao.pham@creative.co</p>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-xs font-bold uppercase tracking-wider'>
                    Pro
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <span className='flex items-center gap-1.5 text-sm font-medium'>
                    <span className='w-2 h-2 rounded-full bg-success'></span>
                    {t('users.table.active')}
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <p className='text-sm'>12/01/2025</p>
                </td>
                <td className='px-6 py-5 font-bold'>31</td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1 bg-success/10 text-success rounded-lg text-xs font-bold uppercase'>
                    {t('users.table.normal')}
                  </span>
                </td>
                <td className='px-6 py-5 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <Link
                      to='/admin/users/thao.pham@creative.co'
                      className='p-2 hover:bg-muted rounded-lg text-primary transition-colors inline-flex items-center justify-center'
                      title={t('users.table.viewAction')}
                    >
                      <span className='material-symbols-outlined text-lg'>visibility</span>
                    </Link>
                    <button className='px-3 py-1.5 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 whitespace-nowrap'>
                      {t('users.table.banAction')}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='p-6 border-t border-border flex flex-col md:flex-row gap-4 items-center justify-between'>
          <p className='text-muted-foreground text-sm font-medium'>
            <Trans
              t={t}
              i18nKey='users.pagination'
              values={{ start: 4, total: '1,250' }}
              components={{
                1: <span className='font-bold text-foreground' />,
                2: <span className='font-bold text-foreground' />
              }}
            />
          </p>
          <div className='flex gap-2'>
            <button
              className='p-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50'
              disabled
            >
              <span className='material-symbols-outlined'>chevron_left</span>
            </button>
            <button className='px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg active:scale-95 transition-all'>
              1
            </button>
            <button className='px-4 py-2 hover:bg-muted rounded-lg font-medium transition-all'>2</button>
            <button className='px-4 py-2 hover:bg-muted rounded-lg font-medium transition-all'>3</button>
            <span className='px-2 py-2'>...</span>
            <button className='px-4 py-2 hover:bg-muted rounded-lg font-medium transition-all'>42</button>
            <button className='p-2 border border-border rounded-lg hover:bg-muted transition-colors active:scale-95'>
              <span className='material-symbols-outlined'>chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
