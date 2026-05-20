import { useTranslation, Trans } from 'react-i18next'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminHeader } from '../components/layout/admin-header'
import { AdminFooter } from '../components/layout/admin-footer'

export function AdminRevenuePage() {
  const { t } = useTranslation('admin')

  return (
    <div className='bg-muted text-foreground min-h-screen flex font-body'>
      <AdminSidebar />
      <main className='flex-1 flex flex-col min-w-0'>
        <AdminHeader />
        <div className='p-8 max-w-7xl mx-auto w-full space-y-8'>

          {/* Header Section */}
          <div className='flex justify-between items-end mb-10'>
            <div>
              <h2 className='text-4xl font-bold text-foreground'>{t('revenue.orders.title', 'Payment Orders')}</h2>
              <p className='text-muted-foreground mt-2'>
                {t('revenue.orders.subtitle', 'Quản lý và theo dõi các giao dịch thanh toán trong hệ thống.')}
              </p>
            </div>
            <button className='bg-primary px-8 py-3 rounded-full text-primary-foreground font-bold flex items-center gap-2 hover:shadow-lg hover:brightness-110 transition-all active:scale-95'>
              <span className='material-symbols-outlined'>download</span>
              {t('revenue.orders.exportCsv', 'Xuất CSV')}
            </button>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
            <div className='bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden group'>
              <div className='absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110'></div>
              <div className='flex items-center gap-4 mb-4 relative z-10'>
                <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                  <span className='material-symbols-outlined'>check_circle</span>
                </div>
                <h3 className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
                  {t('revenue.orders.totalSuccess', 'Tổng giao dịch thành công')}
                </h3>
              </div>
              <p className='text-5xl font-black text-primary relative z-10'>42</p>
            </div>
            <div className='bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden group'>
              <div className='absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110'></div>
              <div className='flex items-center gap-4 mb-4 relative z-10'>
                <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                  <span className='material-symbols-outlined'>payments</span>
                </div>
                <h3 className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
                  {t('revenue.orders.totalRevenue', 'Tổng doanh thu')}
                </h3>
              </div>
              <div className='relative z-10'>
                <p className='text-5xl font-black text-primary'>
                  3,318,000 <span className='text-2xl font-bold text-muted-foreground'>VND</span>
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className='bg-muted p-6 rounded-2xl mb-8 flex flex-wrap gap-4 items-end border border-border'>
            <div className='flex-1 min-w-[200px]'>
              <label className='block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest'>
                {t('revenue.orders.filter.status', 'Trạng thái')}
              </label>
              <select className='w-full bg-card border border-border rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none'>
                <option>All</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>
            <div className='flex-1 min-w-[200px]'>
              <label className='block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest'>
                {t('revenue.orders.filter.provider', 'Provider')}
              </label>
              <select className='w-full bg-card border border-border rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none'>
                <option>All</option>
                <option>VNPay</option>
                <option>MoMo</option>
                <option>Manual</option>
              </select>
            </div>
            <div className='flex-[1.5] min-w-[300px] flex gap-2'>
              <div className='flex-1'>
                <label className='block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest'>
                  {t('revenue.orders.filter.fromDate', 'Từ ngày')}
                </label>
                <input
                  className='w-full bg-card border border-border rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground'
                  type='date'
                />
              </div>
              <div className='flex-1'>
                <label className='block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest'>
                  {t('revenue.orders.filter.toDate', 'Đến ngày')}
                </label>
                <input
                  className='w-full bg-card border border-border rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground'
                  type='date'
                />
              </div>
            </div>
            <div className='flex-[1.5] min-w-[250px]'>
              <label className='block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest'>
                {t('revenue.orders.filter.searchEmail', 'Tìm kiếm email')}
              </label>
              <div className='relative'>
                <input
                  className='w-full bg-card border border-border rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground'
                  placeholder='name@example.com'
                  type='text'
                />
                <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'>
                  search
                </span>
              </div>
            </div>
            <button className='h-12 w-12 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:brightness-110 transition-all shadow-sm active:scale-95'>
              <span className='material-symbols-outlined'>filter_list</span>
            </button>
          </div>

          {/* Payment Table */}
          <div className='bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-8'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse'>
                <thead className='bg-muted border-b border-border'>
                  <tr>
                    <th className='px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                      {t('revenue.orders.table.date', 'Ngày')}
                    </th>
                    <th className='px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                      {t('revenue.orders.table.user', 'User')}
                    </th>
                    <th className='px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                      {t('revenue.orders.table.amount', 'Số tiền')}
                    </th>
                    <th className='px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                      {t('revenue.orders.table.provider', 'Provider')}
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  <tr className='hover:bg-muted/50 transition-colors'>
                    <td className='px-6 py-5 font-medium text-muted-foreground'>05/18</td>
                    <td className='px-6 py-5 font-bold text-primary'>user@ex.com</td>
                    <td className='px-6 py-5 font-black text-foreground'>79,000đ</td>
                    <td className='px-6 py-5'>
                      <span className='bg-info/10 text-info px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider'>
                        VNPay
                      </span>
                    </td>
                  </tr>

                  <tr className='hover:bg-muted/50 transition-colors bg-muted/30'>
                    <td className='px-6 py-5 font-medium text-muted-foreground'>05/15</td>
                    <td className='px-6 py-5 font-bold text-primary'>abc@ex.com</td>
                    <td className='px-6 py-5 font-black text-foreground'>79,000đ</td>
                    <td className='px-6 py-5'>
                      <span className='bg-brand-momo/10 text-brand-momo px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider'>
                        MoMo
                      </span>
                    </td>
                  </tr>

                  <tr className='hover:bg-muted/50 transition-colors'>
                    <td className='px-6 py-5 font-medium text-muted-foreground'>05/14</td>
                    <td className='px-6 py-5 font-bold text-primary'>xyz@ex.com</td>
                    <td className='px-6 py-5 font-black text-foreground'>79,000đ</td>
                    <td className='px-6 py-5'>
                      <span className='bg-muted-foreground/10 text-muted-foreground px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider'>
                        Manual
                      </span>
                    </td>
                  </tr>

                  <tr className='hover:bg-muted/50 transition-colors bg-muted/30'>
                    <td className='px-6 py-5 font-medium text-muted-foreground'>05/13</td>
                    <td className='px-6 py-5 font-bold text-primary'>test@ex.com</td>
                    <td className='px-6 py-5 font-black text-foreground'>79,000đ</td>
                    <td className='px-6 py-5'>
                      <span className='bg-info/10 text-info px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider'>
                        VNPay
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='p-6 flex items-center justify-between border-t border-border'>
              <p className='text-muted-foreground font-medium text-sm'>
                <Trans
                  t={t}
                  i18nKey='revenue.orders.pagination'
                  defaults="Hiển thị <1>{{start}} - {{end}}</1> trên <2>{{total}}</2> giao dịch"
                  values={{ start: 1, end: 4, total: 42 }}
                  components={{
                    1: <span className='font-bold text-foreground' />,
                    2: <span className='font-bold text-foreground' />
                  }}
                />
              </p>
              <div className='flex gap-2'>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all disabled:opacity-50' disabled>
                  <span className='material-symbols-outlined'>chevron_left</span>
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm'>
                  1
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all font-bold'>
                  2
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all font-bold'>
                  3
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all active:scale-95'>
                  <span className='material-symbols-outlined'>chevron_right</span>
                </button>
              </div>
            </div>
          </div>

        </div>
        <AdminFooter />
      </main>
    </div>
  )
}
