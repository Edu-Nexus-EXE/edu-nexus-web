import { useTranslation } from 'react-i18next'

export function AdminRevenueSection() {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
      {/* Revenue Overview */}
      <div className='lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>{t('revenue.title')}</h2>
            <p className='text-sm text-muted-foreground'>{t('revenue.subtitle')}</p>
          </div>
          <button className='text-primary text-sm font-semibold hover:underline'>{t('revenue.reportDetail')}</button>
        </div>
        <div className='grid grid-cols-2 gap-6 mb-10'>
          <div className='p-6 bg-primary/5 border border-primary/10 rounded-2xl'>
            <p className='text-xs font-bold text-primary uppercase tracking-widest mb-2'>{t('revenue.thisMonth')}</p>
            <h4 className='text-2xl font-bold text-foreground'>
              125,000,000 <span className='text-sm font-normal text-muted-foreground'>VND</span>
            </h4>
          </div>
          <div className='p-6 bg-muted/50 border border-border rounded-2xl'>
            <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2'>{t('revenue.allTime')}</p>
            <h4 className='text-2xl font-bold text-foreground'>
              1,450,000,000 <span className='text-sm font-normal text-muted-foreground'>VND</span>
            </h4>
          </div>
        </div>
        <div className='flex-1'>
          <h3 className='text-sm font-bold text-foreground mb-6'>{t('revenue.paymentSources')}</h3>
          <div className='h-48 flex items-end gap-10 border-b border-border pb-4 px-4'>
            <div className='flex-1 flex flex-col items-center gap-3'>
              <div className='w-full bg-primary rounded-t-xl h-[80%] relative group transition-all hover:opacity-90'>
                <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                  80%
                </span>
              </div>
              <span className='text-xs font-bold text-muted-foreground'>VNPay</span>
            </div>
            <div className='flex-1 flex flex-col items-center gap-3'>
              <div className='w-full bg-primary/60 rounded-t-xl h-[45%] relative group transition-all hover:opacity-90'>
                <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                  45%
                </span>
              </div>
              <span className='text-xs font-bold text-muted-foreground'>MoMo</span>
            </div>
            <div className='flex-1 flex flex-col items-center gap-3'>
              <div className='w-full bg-primary/30 rounded-t-xl h-[20%] relative group transition-all hover:opacity-90'>
                <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                  20%
                </span>
              </div>
              <span className='text-xs font-bold text-muted-foreground'>Manual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className='bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col'>
        <h3 className='text-xl font-bold text-foreground mb-6'>{t('revenue.recentTransactions')}</h3>
        <div className='flex-1 overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border'>
                <th className='pb-4 pr-2'>{t('revenue.email')}</th>
                <th className='pb-4 px-2 text-right'>{t('revenue.amount')}</th>
                <th className='pb-4 pl-2 text-right'>{t('revenue.method')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {[
                { email: 'user1@gmail.com', amount: '500k', method: 'VNPay', methodClass: 'bg-primary/10 text-primary' },
                { email: 'student.hust@...', amount: '200k', method: 'MoMo', methodClass: 'bg-muted text-muted-foreground' },
                { email: 'admin.test@...', amount: '1M', method: 'Manual', methodClass: 'bg-muted text-muted-foreground' },
                { email: 'nguyen.a@...', amount: '500k', method: 'VNPay', methodClass: 'bg-primary/10 text-primary' },
                { email: 'tran.b@...', amount: '200k', method: 'MoMo', methodClass: 'bg-muted text-muted-foreground' },
              ].map((row, i) => (
                <tr key={i} className='hover:bg-primary/5 transition-colors group'>
                  <td className='py-4 pr-2 text-xs font-medium text-foreground max-w-[100px] truncate'>
                    {row.email}
                  </td>
                  <td className='py-4 px-2 text-xs font-bold text-right text-foreground'>{row.amount}</td>
                  <td className='py-4 pl-2 text-right'>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.methodClass}`}>
                      {row.method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a
          className='mt-6 w-full py-3 border border-border text-muted-foreground font-bold text-xs rounded-xl hover:bg-muted hover:text-primary transition-all flex items-center justify-center gap-2'
          href='#'
        >
          {t('revenue.viewAll')}
          <span className='material-symbols-outlined text-sm'>arrow_forward</span>
        </a>
      </div>
    </section>
  )
}
