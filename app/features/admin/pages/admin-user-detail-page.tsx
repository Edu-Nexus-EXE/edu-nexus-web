import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import {
  activateAdminUserSubscription,
  loadAdminUserDetail,
  revokeAdminUserSubscription,
  setAdminUserBan,
  type AdminUserDetailView,
} from '../lib/admin-data'

const fallbackUser: AdminUserDetailView = {
  id: 'fallback-user',
  name: 'Nguyễn Văn A',
  email: 'user@example.com',
  avatarUrl: 'https://placehold.co/160x160?text=User',
  createdDate: '2025-01-01T00:00:00.000Z',
  lastLogin: '2025-05-18T00:00:00.000Z',
  isBanned: false,
  plan: 'Student',
  subscriptionStatus: 'active',
  startDate: '2025-03-01T00:00:00.000Z',
  endDate: '2025-06-01T00:00:00.000Z',
  autoRenew: false,
  usage: {
    jds: { current: 5, max: 'unlimited', percent: 25 },
    roadmaps: { current: 3, max: 'unlimited', percent: 17 },
    assessments: { current: 4, max: 'unlimited', percent: 20 },
  },
  payments: [
    { date: '2025-03-15T00:00:00.000Z', amount: '299,000 VND', provider: 'VNPAY', code: 'EB-98231023', status: 'success' },
    { date: '2025-02-01T00:00:00.000Z', amount: '299,000 VND', provider: 'Momo', code: 'EB-87123912', status: 'success' },
  ],
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '—'
  return date.toLocaleString('vi-VN')
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'banned' || normalized === 'suspended') return 'bg-destructive/10 text-destructive border-destructive/20'
  if (normalized === 'expired' || normalized === 'inactive') return 'bg-muted text-muted-foreground border-border'
  return 'bg-success/10 text-success border-success/20'
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('admin')

  const userId = id || 'user@example.com'
  const [detail, setDetail] = useState<AdminUserDetailView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadAdminUserDetail(userId)
      .then((result) => {
        if (cancelled) return
        if (result) {
          setDetail(result)
          return
        }
        setDetail({ ...fallbackUser, id: userId, email: userId })
        setError(t('adminCommon.empty'))
      })
      .catch(() => {
        if (cancelled) return
        setDetail({ ...fallbackUser, id: userId, email: userId })
        setError(t('adminCommon.empty'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t, userId])

  const current = detail ?? fallbackUser
  const banned = current.isBanned
  const subscriptionTone = useMemo(() => statusTone(current.subscriptionStatus), [current.subscriptionStatus])

  async function handleBan(nextValue: boolean) {
    try {
      setSubmitting(true)
      await setAdminUserBan(current.id, nextValue)
      setDetail((prev) => (prev ? { ...prev, isBanned: nextValue } : prev))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleActivateSubscription() {
    try {
      setSubmitting(true)
      await activateAdminUserSubscription(current.id)
      setDetail((prev) => (prev ? { ...prev, plan: 'Student', subscriptionStatus: 'active' } : prev))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevokeSubscription() {
    try {
      setSubmitting(true)
      await revokeAdminUserSubscription(current.id)
      setDetail((prev) => (prev ? { ...prev, subscriptionStatus: 'expired', autoRenew: false } : prev))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='p-8 max-w-7xl mx-auto w-full space-y-6 flex-1'>
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
          {t('userDetail.breadcrumb.detail', { name: current.name })}
        </span>
      </nav>

      {error ? (
        <div className='rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground'>
          {error}
        </div>
      ) : null}

      {loading ? (
        <section className='bg-card rounded-2xl p-8 border border-border shadow-sm animate-pulse space-y-6'>
          <div className='h-8 w-56 rounded bg-muted' />
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='h-48 rounded-2xl bg-muted' />
            <div className='h-48 rounded-2xl bg-muted' />
          </div>
          <div className='h-64 rounded-2xl bg-muted' />
        </section>
      ) : (
        <>
          <section className='bg-card rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-border shadow-sm relative overflow-hidden group'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110' />

            <div className='flex flex-col sm:flex-row items-center gap-6 relative z-10'>
              <div className='h-24 w-24 rounded-2xl overflow-hidden shadow-sm border border-border shrink-0 bg-muted'>
                <img alt={current.name} className='h-full w-full object-cover' src={current.avatarUrl} />
              </div>
              <div className='text-center sm:text-left'>
                <h2 className='text-3xl font-bold text-foreground mb-1'>{current.name}</h2>
                <p className='text-primary font-semibold mb-3'>{current.email}</p>
                <div className='flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-start'>
                  <span className='text-xs text-muted-foreground flex items-center gap-2 font-medium'>
                    <span className='material-symbols-outlined text-[18px]'>calendar_today</span>
                    {t('userDetail.info.createdDate', { date: formatDate(current.createdDate) })}
                  </span>
                  <span className='text-xs text-muted-foreground flex items-center gap-2 font-medium'>
                    <span className='material-symbols-outlined text-[18px]'>login</span>
                    {t('userDetail.info.lastLogin', { date: formatDate(current.lastLogin) })}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex gap-3 w-full md:w-auto relative z-10 shrink-0'>
              <button
                type='button'
                onClick={() => void handleBan(true)}
                className={`flex-1 md:flex-initial px-6 py-2.5 rounded-full font-bold text-sm transition-all border border-destructive hover:bg-destructive/10 ${banned ? 'opacity-50 pointer-events-none' : 'text-destructive'}`}
                disabled={banned || submitting}
              >
                {t('userDetail.info.ban')}
              </button>
              <button
                type='button'
                onClick={() => void handleBan(false)}
                className={`flex-1 md:flex-initial px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${banned ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 hover:scale-[1.02]' : 'bg-muted text-muted-foreground/40 border-border cursor-not-allowed'}`}
                disabled={!banned || submitting}
              >
                {t('userDetail.info.unban')}
              </button>
            </div>
          </section>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
            <section className='lg:col-span-7 bg-card rounded-2xl p-8 flex flex-col border border-border shadow-sm relative overflow-hidden group'>
              <div className='absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16' />

              <div className='flex justify-between items-center mb-8 relative z-10'>
                <h3 className='text-2xl font-bold text-foreground'>{t('userDetail.subscription.title')}</h3>
                <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider border ${subscriptionTone}`}>
                  {current.subscriptionStatus}
                </span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-auto relative z-10'>
                <div className='space-y-4'>
                  <div className='p-5 bg-muted rounded-xl border border-border'>
                    <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>{t('userDetail.subscription.currentPlan')}</p>
                    <p className='font-bold text-foreground text-lg'>{current.plan}</p>
                  </div>
                  <div className='p-5 bg-muted rounded-xl border border-border'>
                    <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>{t('userDetail.subscription.startDate')}</p>
                    <p className='font-bold text-foreground text-lg'>{formatDate(current.startDate)}</p>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='p-5 bg-muted rounded-xl border-l-4 border-primary border border-border'>
                    <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>{t('userDetail.subscription.endDate')}</p>
                    <p className='font-bold text-foreground text-lg'>{formatDate(current.endDate)}</p>
                  </div>
                  <div className='p-5 bg-muted rounded-xl border border-border'>
                    <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>{t('userDetail.subscription.autoRenew')}</p>
                    <p className='font-bold text-foreground text-lg'>{current.autoRenew ? t('userDetail.subscription.yes') : t('userDetail.subscription.no')}</p>
                  </div>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-border relative z-10'>
                <button type='button' onClick={() => void handleActivateSubscription()} disabled={submitting} className='flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50'>
                  {t('userDetail.subscription.activate')}
                </button>
                <button type='button' onClick={() => void handleRevokeSubscription()} disabled={submitting} className='flex-1 border border-destructive text-destructive py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-destructive/10 transition-colors disabled:opacity-50'>
                  {t('userDetail.subscription.revoke')}
                </button>
              </div>
            </section>

            <section className='lg:col-span-5 bg-card rounded-2xl p-8 flex flex-col border border-border shadow-sm relative overflow-hidden group'>
              <div className='absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mb-16' />
              <h3 className='text-2xl font-bold text-foreground mb-8 relative z-10'>{t('userDetail.usage.title')}</h3>

              <div className='space-y-8 flex-1 relative z-10'>
                {[
                  { label: 'Job Descriptions', icon: 'work', value: current.usage.jds },
                  { label: 'Roadmaps', icon: 'map', value: current.usage.roadmaps },
                  { label: 'Assessments', icon: 'assessment', value: current.usage.assessments },
                ].map((item) => (
                  <div key={item.label} className='group'>
                    <div className='flex justify-between items-end mb-3'>
                      <div>
                        <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>{item.label}</p>
                        <p className='text-lg font-bold text-foreground'>
                          {item.value.current} / <span className='text-primary'>{item.value.max}</span>
                        </p>
                      </div>
                      <span className='material-symbols-outlined text-primary group-hover:scale-110 transition-transform'>{item.icon}</span>
                    </div>
                    <div className='h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border'>
                      <div className='h-full bg-primary rounded-full' style={{ width: `${item.value.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className='mt-8 pt-8 flex justify-center relative z-10'>
                <p className='text-muted-foreground italic text-xs font-medium text-center'>
                  {t('userDetail.usage.growthMsg')}
                </p>
              </div>
            </section>
          </div>

          <section className='bg-card rounded-2xl p-8 border border-border shadow-sm overflow-hidden relative group'>
            <div className='flex justify-between items-center mb-8 flex-wrap gap-4'>
              <h3 className='text-2xl font-bold text-foreground'>{t('userDetail.paymentHistory.title')}</h3>
              <button type='button' className='text-xs font-bold text-primary border-b border-primary hover:text-primary/80 hover:border-primary/80 transition-colors pb-0.5 uppercase tracking-wider'>
                {t('userDetail.paymentHistory.exportCsv')}
              </button>
            </div>

            <div className='overflow-x-auto'>
              {current.payments.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground font-medium'>{t('userDetail.paymentHistory.empty')}</div>
              ) : (
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='bg-muted border-b border-border'>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>{t('userDetail.paymentHistory.table.date')}</th>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>{t('userDetail.paymentHistory.table.amount')}</th>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>{t('userDetail.paymentHistory.table.provider')}</th>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>{t('userDetail.paymentHistory.table.code')}</th>
                      <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-center'>{t('userDetail.paymentHistory.table.status')}</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {current.payments.map((pm) => (
                      <tr key={pm.code} className='hover:bg-muted/50 transition-colors'>
                        <td className='px-6 py-5 font-semibold text-foreground text-sm'>{formatDate(pm.date)}</td>
                        <td className='px-6 py-5 font-bold text-foreground text-sm'>{pm.amount}</td>
                        <td className='px-6 py-5 text-muted-foreground text-sm'>{pm.provider}</td>
                        <td className='px-6 py-5 font-mono text-primary font-bold text-sm'>{pm.code}</td>
                        <td className='px-6 py-5 text-center'>
                          <span className='material-symbols-outlined text-primary bg-primary/10 rounded-full p-1.5' style={{ fontVariationSettings: "'FILL' 1" }}>
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
        </>
      )}
    </div>
  )
}
