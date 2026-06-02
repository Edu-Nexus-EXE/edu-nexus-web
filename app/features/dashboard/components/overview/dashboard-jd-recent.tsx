import { Link } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getJdSubmissions } from '~/api/operations/jd-submissions/jd-submissions'
import { cn } from '~/shared/lib/cn'
import { Badge } from '~/shared/ui/badge'

import { type JdRecentItem } from '../../lib/sprint2-api'

type ResponseWithData<T> = { data?: T }

type JdRowDto = {
  id?: unknown
  jobTitle?: unknown
  title?: unknown
  parseStatus?: unknown
  status?: unknown
  createdAt?: unknown
}

function parseJdRows(res: unknown): JdRecentItem[] {
  const data = (res as ResponseWithData<unknown>)?.data

  const rows = Array.isArray(data)
    ? (data as unknown[])
    : Array.isArray((data as { items?: unknown[] } | null)?.items)
      ? ((data as { items: unknown[] }).items)
      : Array.isArray((data as { rows?: unknown[] } | null)?.rows)
        ? ((data as { rows: unknown[] }).rows)
        : []

  return rows
    .map((r) => r as JdRowDto)
    .map((r) => {
      const jobTitle = typeof r.jobTitle === 'string' ? r.jobTitle : typeof r.title === 'string' ? r.title : ''
      const parseStatus = String(r.parseStatus ?? r.status ?? '')
      return {
        id: String(r.id ?? ''),
        jobTitle,
        parseStatus,
        createdAt: typeof r.createdAt === 'string' ? r.createdAt : undefined,
      }
    })
    .filter((r) => Boolean(r.id))
}

function statusTone(
  t: (key: string) => string,
  statusRaw: string
): { variant: Parameters<typeof Badge>[0]['variant']; label: string } {
  const s = statusRaw.toLowerCase()
  if (s === 'completed') return { variant: 'success', label: t('jdRecent.status.completed') }
  if (s === 'failed') return { variant: 'destructive', label: t('jdRecent.status.failed') }
  if (s === 'pending') return { variant: 'warning', label: t('jdRecent.status.pending') }
  if (s === 'processing') return { variant: 'warning', label: t('jdRecent.status.processing') }
  return { variant: 'outline', label: statusRaw || '—' }
}

export function DashboardJdRecent() {
  const { t } = useTranslation(['dashboard'])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<JdRecentItem[]>([])

  useEffect(() => {
    let cancelled = false

    setTimeout(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
      }
    }, 0)

    getJdSubmissions({ page: 1, pageSize: 5 })
      .then((res) => {
        if (cancelled) return
        setRows(parseJdRows(res))
      })
      .catch((e) => {
        if (cancelled) return
        setRows([])
        setError((e as Error).message || t('jdRecent.errors.loadFailed'))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  const headerBadge = useMemo(() => {
    if (loading) return { variant: 'warning' as const, label: t('jdRecent.loading') }
    return { variant: 'outline' as const, label: t('jdRecent.badge') }
  }, [loading, t])

  return (
    <section className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
      <div className='flex items-start justify-between gap-4 mb-4'>
        <div>
          <h2 className='text-lg font-semibold text-foreground'>{t('jdRecent.title')}</h2>
          <p className='text-sm text-muted-foreground'>{t('jdRecent.subtitle')}</p>
        </div>
        <Badge variant={headerBadge.variant}>{headerBadge.label}</Badge>
      </div>

      {error ? (
        <div className='mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-sm'>{error}</div>
      ) : null}

      {loading ? (
        <p className='text-sm text-muted-foreground'>{t('jdRecent.loading')}</p>
      ) : rows.length === 0 ? (
        <div className='rounded-xl border border-border bg-muted/10 p-4'>
          <p className='text-sm text-muted-foreground'>{t('jdRecent.empty')}</p>
          <Link
            to='/dashboard/jd/new'
            className='mt-3 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-colors'
          >
            {t('jdRecent.cta')}
          </Link>
        </div>
      ) : (
        <div className='space-y-2'>
          {rows.map((r) => {
            const tone = statusTone((k) => t(k), r.parseStatus)
            return (
              <Link
                key={r.id}
                to={`/dashboard/jd/${encodeURIComponent(r.id)}`}
                className={cn('block rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/20 hover:border-primary/30')}
              >
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='text-sm font-semibold text-foreground'>{r.jobTitle || t('jdRecent.untitled')}</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {t('jdRecent.idLabel')}: {r.id}
                    </p>
                    {r.createdAt ? <p className='text-xs text-muted-foreground mt-1'>{r.createdAt}</p> : null}
                  </div>
                  <Badge variant={tone.variant}>{tone.label}</Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
