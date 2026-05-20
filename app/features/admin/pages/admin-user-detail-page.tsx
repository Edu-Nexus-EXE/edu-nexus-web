import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminHeader } from '../components/layout/admin-header'
import { AdminFooter } from '../components/layout/admin-footer'

interface UserDetail {
  name: string
  email: string
  avatarUrl: string
  createdDate: string
  lastLogin: string
  isBanned: boolean
  plan: string
  startDate: string
  endDate: string
  autoRenew: boolean
  usage: {
    jds: { current: number; max: string; percent: number }
    roadmaps: { current: number; max: string; percent: number }
    assessments: { current: number; max: string; percent: number }
  }
  payments: Array<{
    date: string
    amount: string
    provider: string
    code: string
    status: string
  }>
}

const mockUsersDetail: Record<string, UserDetail> = {
  'hoang.nguyen@gmail.com': {
    name: 'Nguyễn Hoàng',
    email: 'hoang.nguyen@gmail.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKCMcLrZXzVx6YsIMR_8sTfmfz4-sc5B6wUklIfoXuAWHw0haP9V_IaioXC-xd5Np3KARR5wRpDAmXf-Ezk8EgyUyd_O-ceKMaEQqj1gECirtZW99iwW-P_r37adJnyZYKFtkmEodkaFi_qcHpQJEBeHZ8cW3zGiwGs9nRnacCExWsLnNqLv8r7TrSQATPYazFW0DRFkiuoakF5N9yEqsObslMtBMudiAZmmoa2ygBbjLdaMO9DtRlkRAVZpsRuZ5B2S0rRDAqvkID',
    createdDate: '24/12/2023',
    lastLogin: '18/05/2025 14:22',
    isBanned: false,
    plan: 'Enterprise',
    startDate: '24/12/2024',
    endDate: '24/12/2025',
    autoRenew: true,
    usage: {
      jds: { current: 128, max: 'unlimited', percent: 40 },
      roadmaps: { current: 15, max: 'unlimited', percent: 30 },
      assessments: { current: 20, max: 'unlimited', percent: 25 }
    },
    payments: [
      { date: '24/12/2024', amount: '2,999,000 VND', provider: 'Stripe', code: 'EB-99231023', status: 'success' },
      { date: '24/06/2024', amount: '2,999,000 VND', provider: 'Stripe', code: 'EB-87123912', status: 'success' }
    ]
  },
  'minhtran.dev@outlook.com': {
    name: 'Trần Minh',
    email: 'minhtran.dev@outlook.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKCMcLrZXzVx6YsIMR_8sTfmfz4-sc5B6wUklIfoXuAWHw0haP9V_IaioXC-xd5Np3KARR5wRpDAmXf-Ezk8EgyUyd_O-ceKMaEQqj1gECirtZW99iwW-P_r37adJnyZYKFtkmEodkaFi_qcHpQJEBeHZ8cW3zGiwGs9nRnacCExWsLnNqLv8r7TrSQATPYazFW0DRFkiuoakF5N9yEqsObslMtBMudiAZmmoa2ygBbjLdaMO9DtRlkRAVZpsRuZ5B2S0rRDAqvkID',
    createdDate: '15/05/2023',
    lastLogin: '10/05/2024 08:30',
    isBanned: true,
    plan: 'Pro',
    startDate: '15/05/2023',
    endDate: '15/05/2024',
    autoRenew: false,
    usage: {
      jds: { current: 42, max: 'unlimited', percent: 60 },
      roadmaps: { current: 8, max: 'unlimited', percent: 50 },
      assessments: { current: 12, max: 'unlimited', percent: 45 }
    },
    payments: [
      { date: '15/11/2023', amount: '299,000 VND', provider: 'Momo', code: 'EB-76213901', status: 'success' },
      { date: '15/05/2023', amount: '299,000 VND', provider: 'Momo', code: 'EB-65239123', status: 'success' }
    ]
  },
  'le.anh.92@edu.vn': {
    name: 'Lê Anh',
    email: 'le.anh.92@edu.vn',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKCMcLrZXzVx6YsIMR_8sTfmfz4-sc5B6wUklIfoXuAWHw0haP9V_IaioXC-xd5Np3KARR5wRpDAmXf-Ezk8EgyUyd_O-ceKMaEQqj1gECirtZW99iwW-P_r37adJnyZYKFtkmEodkaFi_qcHpQJEBeHZ8cW3zGiwGs9nRnacCExWsLnNqLv8r7TrSQATPYazFW0DRFkiuoakF5N9yEqsObslMtBMudiAZmmoa2ygBbjLdaMO9DtRlkRAVZpsRuZ5B2S0rRDAqvkID',
    createdDate: '01/01/2025',
    lastLogin: '19/05/2025 21:05',
    isBanned: false,
    plan: 'Free',
    startDate: '01/01/2025',
    endDate: 'unlimited',
    autoRenew: false,
    usage: {
      jds: { current: 5, max: 'unlimited', percent: 15 },
      roadmaps: { current: 1, max: 'unlimited', percent: 10 },
      assessments: { current: 2, max: 'unlimited', percent: 8 }
    },
    payments: []
  },
  'thao.pham@creative.co': {
    name: 'Phạm Thảo',
    email: 'thao.pham@creative.co',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKCMcLrZXzVx6YsIMR_8sTfmfz4-sc5B6wUklIfoXuAWHw0haP9V_IaioXC-xd5Np3KARR5wRpDAmXf-Ezk8EgyUyd_O-ceKMaEQqj1gECirtZW99iwW-P_r37adJnyZYKFtkmEodkaFi_qcHpQJEBeHZ8cW3zGiwGs9nRnacCExWsLnNqLv8r7TrSQATPYazFW0DRFkiuoakF5N9yEqsObslMtBMudiAZmmoa2ygBbjLdaMO9DtRlkRAVZpsRuZ5B2S0rRDAqvkID',
    createdDate: '12/01/2024',
    lastLogin: '18/05/2025 10:15',
    isBanned: false,
    plan: 'Pro',
    startDate: '12/01/2025',
    endDate: '12/01/2026',
    autoRenew: true,
    usage: {
      jds: { current: 31, max: 'unlimited', percent: 45 },
      roadmaps: { current: 6, max: 'unlimited', percent: 40 },
      assessments: { current: 10, max: 'unlimited', percent: 35 }
    },
    payments: [
      { date: '12/01/2025', amount: '299,000 VND', provider: 'VNPAY', code: 'EB-54129302', status: 'success' },
      { date: '12/07/2024', amount: '299,000 VND', provider: 'VNPAY', code: 'EB-43210984', status: 'success' }
    ]
  }
}

const fallbackUser: UserDetail = {
  name: 'Nguyễn Văn A',
  email: 'user@example.com',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKCMcLrZXzVx6YsIMR_8sTfmfz4-sc5B6wUklIfoXuAWHw0haP9V_IaioXC-xd5Np3KARR5wRpDAmXf-Ezk8EgyUyd_O-ceKMaEQqj1gECirtZW99iwW-P_r37adJnyZYKFtkmEodkaFi_qcHpQJEBeHZ8cW3zGiwGs9nRnacCExWsLnNqLv8r7TrSQATPYazFW0DRFkiuoakF5N9yEqsObslMtBMudiAZmmoa2ygBbjLdaMO9DtRlkRAVZpsRuZ5B2S0rRDAqvkID',
  createdDate: '01/01/2025',
  lastLogin: '18/05/2025',
  isBanned: false,
  plan: 'Student',
  startDate: '01/03/2025',
  endDate: '01/06/2025',
  autoRenew: false,
  usage: {
    jds: { current: 5, max: 'unlimited', percent: 25 },
    roadmaps: { current: 3, max: 'unlimited', percent: 16.6 },
    assessments: { current: 4, max: 'unlimited', percent: 20 }
  },
  payments: [
    { date: '15/03/2025', amount: '299,000 VND', provider: 'VNPAY', code: 'EB-98231023', status: 'success' },
    { date: '01/02/2025', amount: '299,000 VND', provider: 'Momo', code: 'EB-87123912', status: 'success' },
    { date: '01/01/2025', amount: '199,000 VND', provider: 'Stripe', code: 'EB-76213901', status: 'success' }
  ]
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('admin')

  const userId = id || 'user@example.com'
  const detail = mockUsersDetail[userId] || {
    ...fallbackUser,
    email: userId
  }

  const [banned, setBanned] = useState(detail.isBanned)

  return (
    <div className='bg-muted text-foreground min-h-screen flex font-body'>
      <AdminSidebar />
      <main className='flex-1 flex flex-col min-w-0'>
        <AdminHeader />

        <div className='p-8 max-w-7xl mx-auto w-full space-y-6 flex-1'>

          {/* Breadcrumbs */}
          <nav className='flex text-xs text-muted-foreground gap-2 items-center'>
            <Link to='/admin' className='hover:text-primary transition-colors'>
              {t('userDetail.breadcrumb.admin')}
            </Link>
            <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
            <Link to='/admin/users' className='hover:text-primary transition-colors'>
              {t('userDetail.breadcrumb.userManagement')}
            </Link>
            <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
            <span className='text-foreground font-semibold'>
              {t('userDetail.breadcrumb.detail', { name: detail.name })}
            </span>
          </nav>

          {/* User Header Section */}
          <section className='bg-card rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-border shadow-sm relative overflow-hidden group'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110' />

            <div className='flex flex-col sm:flex-row items-center gap-6 relative z-10'>
              <div className='h-24 w-24 rounded-2xl overflow-hidden shadow-sm border border-border shrink-0'>
                <img
                  alt={detail.name}
                  className='h-full w-full object-cover'
                  src={detail.avatarUrl}
                />
              </div>
              <div className='text-center sm:text-left'>
                <h2 className='text-3xl font-bold text-foreground mb-1'>{detail.name}</h2>
                <p className='text-primary font-semibold mb-3'>{detail.email}</p>
                <div className='flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-start'>
                  <span className='text-xs text-muted-foreground flex items-center gap-2 font-medium'>
                    <span className='material-symbols-outlined text-[18px]'>calendar_today</span>
                    {t('userDetail.info.createdDate', { date: detail.createdDate })}
                  </span>
                  <span className='text-xs text-muted-foreground flex items-center gap-2 font-medium'>
                    <span className='material-symbols-outlined text-[18px]'>login</span>
                    {t('userDetail.info.lastLogin', { date: detail.lastLogin })}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex gap-3 w-full md:w-auto relative z-10 shrink-0'>
              <button
                onClick={() => setBanned(true)}
                className={`flex-1 md:flex-initial px-6 py-2.5 rounded-full font-bold text-sm transition-all border cursor-pointer border-destructive hover:bg-destructive/10 ${banned ? 'opacity-50 pointer-events-none' : 'text-destructive'
                  }`}
                disabled={banned}
              >
                {t('userDetail.info.ban')}
              </button>
              <button
                onClick={() => setBanned(false)}
                className={`flex-1 md:flex-initial px-6 py-2.5 rounded-full font-bold text-sm transition-all border cursor-pointer ${banned
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 hover:scale-[1.02]'
                  : 'bg-muted text-muted-foreground/40 border-border cursor-not-allowed'
                  }`}
                disabled={!banned}
              >
                {t('userDetail.info.unban')}
              </button>
            </div>
          </section>

          {/* Grid Layout for Subscription and Usage */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
            {/* Subscription Section */}
            <section className='lg:col-span-7 bg-card rounded-2xl p-8 flex flex-col border border-border shadow-sm relative overflow-hidden group'>
              <div className='absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16' />

              <div className='flex justify-between items-center mb-8 relative z-10'>
                <h3 className='text-2xl font-bold text-foreground'>{t('userDetail.subscription.title')}</h3>
                <span className='px-4 py-1.5 bg-success/10 text-success rounded-full font-bold text-xs uppercase tracking-wider border border-success/20'>
                  {t('userDetail.subscription.status')}
                </span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-auto relative z-10'>
                <div className='space-y-4'>
                  <div className='p-5 bg-muted rounded-xl border border-border'>
                    <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>
                      {t('userDetail.subscription.currentPlan')}
                    </p>
                    <p className='font-bold text-foreground text-lg'>{detail.plan}</p>
                  </div>
                  <div className='p-5 bg-muted rounded-xl border border-border'>
                    <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>
                      {t('userDetail.subscription.startDate')}
                    </p>
                    <p className='font-bold text-foreground text-lg'>{detail.startDate}</p>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='p-5 bg-muted rounded-xl border-l-4 border-primary border border-border'>
                    <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>
                      {t('userDetail.subscription.endDate')}
                    </p>
                    <p className='font-bold text-foreground text-lg'>{detail.endDate}</p>
                  </div>
                  <div className='p-5 bg-muted rounded-xl border border-border'>
                    <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>
                      {t('userDetail.subscription.autoRenew')}
                    </p>
                    <p className='font-bold text-foreground text-lg'>
                      {detail.autoRenew ? t('userDetail.subscription.yes') : t('userDetail.subscription.no')}
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-border relative z-10'>
                <button className='flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer'>
                  {t('userDetail.subscription.activate')}
                </button>
                <button className='flex-1 border border-destructive text-destructive py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-destructive/10 transition-colors cursor-pointer'>
                  {t('userDetail.subscription.revoke')}
                </button>
              </div>
            </section>

            {/* Usage Section */}
            <section className='lg:col-span-5 bg-card rounded-2xl p-8 flex flex-col border border-border shadow-sm relative overflow-hidden group'>
              <div className='absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mb-16' />

              <h3 className='text-2xl font-bold text-foreground mb-8 relative z-10'>{t('userDetail.usage.title')}</h3>

              <div className='space-y-8 flex-1 relative z-10'>
                <div className='group'>
                  <div className='flex justify-between items-end mb-3'>
                    <div>
                      <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>
                        Job Descriptions
                      </p>
                      <p className='text-lg font-bold text-foreground'>
                        {detail.usage.jds.current} / <span className='text-primary'>{detail.usage.jds.max}</span>
                      </p>
                    </div>
                    <span className='material-symbols-outlined text-primary group-hover:scale-110 transition-transform'>
                      work
                    </span>
                  </div>
                  <div className='h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border'>
                    <div className='h-full bg-primary rounded-full' style={{ width: `${detail.usage.jds.percent}%` }} />
                  </div>
                </div>

                <div className='group'>
                  <div className='flex justify-between items-end mb-3'>
                    <div>
                      <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>
                        Roadmaps
                      </p>
                      <p className='text-lg font-bold text-foreground'>
                        {detail.usage.roadmaps.current} / <span className='text-primary'>{detail.usage.roadmaps.max}</span>
                      </p>
                    </div>
                    <span className='material-symbols-outlined text-primary group-hover:scale-110 transition-transform'>
                      map
                    </span>
                  </div>
                  <div className='h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border'>
                    <div className='h-full bg-primary rounded-full' style={{ width: `${detail.usage.roadmaps.percent}%` }} />
                  </div>
                </div>

                <div className='group'>
                  <div className='flex justify-between items-end mb-3'>
                    <div>
                      <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>
                        Assessments
                      </p>
                      <p className='text-lg font-bold text-foreground'>
                        {detail.usage.assessments.current} / <span className='text-primary'>{detail.usage.assessments.max}</span>
                      </p>
                    </div>
                    <span className='material-symbols-outlined text-primary group-hover:scale-110 transition-transform'>
                      assessment
                    </span>
                  </div>
                  <div className='h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border'>
                    <div className='h-full bg-primary rounded-full' style={{ width: `${detail.usage.assessments.percent}%` }} />
                  </div>
                </div>
              </div>

              <div className='mt-8 pt-8 flex justify-center relative z-10'>
                <p className='text-muted-foreground italic text-xs font-medium text-center'>
                  {t('userDetail.usage.growthMsg')}
                </p>
              </div>
            </section>
          </div>

          {/* Payment History Table Section */}
          <section className='bg-card rounded-2xl p-8 border border-border shadow-sm overflow-hidden relative group'>
            <div className='flex justify-between items-center mb-8 flex-wrap gap-4'>
              <h3 className='text-2xl font-bold text-foreground'>{t('userDetail.paymentHistory.title')}</h3>
              <button className='text-xs font-bold text-primary border-b border-primary hover:text-primary/80 hover:border-primary/80 transition-colors cursor-pointer pb-0.5 uppercase tracking-wider'>
                {t('userDetail.paymentHistory.exportCsv')}
              </button>
            </div>

            <div className='overflow-x-auto'>
              {detail.payments.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground font-medium'>
                  No transactions recorded
                </div>
              ) : (
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='bg-muted border-b border-border'>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                        {t('userDetail.paymentHistory.table.date')}
                      </th>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                        {t('userDetail.paymentHistory.table.amount')}
                      </th>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                        {t('userDetail.paymentHistory.table.provider')}
                      </th>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                        {t('userDetail.paymentHistory.table.code')}
                      </th>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-center'>
                        {t('userDetail.paymentHistory.table.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {detail.payments.map((pm, idx) => (
                      <tr key={pm.code} className='hover:bg-muted/50 transition-colors'>
                        <td className='px-6 py-5 font-semibold text-foreground text-sm'>{pm.date}</td>
                        <td className='px-6 py-5 font-bold text-foreground text-sm'>{pm.amount}</td>
                        <td className='px-6 py-5 text-muted-foreground text-sm'>{pm.provider}</td>
                        <td className='px-6 py-5 font-mono text-primary font-bold text-sm'>{pm.code}</td>
                        <td className='px-6 py-5 text-center'>
                          <span
                            className='material-symbols-outlined text-primary bg-primary/10 rounded-full p-1.5'
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </div>

        <AdminFooter />
      </main>
    </div>
  )
}
