import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  approveAdminSkill,
  loadAdminSkillsQueue,
  rejectAdminSkill,
  updateAdminSkill,
  type AdminSkillRowView,
} from '../lib/admin-data'

function getSkillStatusLabel(status: string, t: ReturnType<typeof useTranslation>['t']) {
  const normalized = status.toLowerCase()
  if (normalized === 'pending') return t('skillsQueue.status.pending')
  if (normalized === 'approved' || normalized === 'active') return t('skillsQueue.status.approved')
  if (normalized === 'rejected' || normalized === 'inactive') return t('skillsQueue.status.rejected')
  return status
}

function getSkillCategoryLabel(category: string, t: ReturnType<typeof useTranslation>['t']) {
  if (category.toLowerCase() === 'uncategorized') return t('skillsQueue.uncategorized')
  return category
}

function getSkillDescriptionLabel(description: string | undefined, t: ReturnType<typeof useTranslation>['t']) {
  if (!description) return t('skillsQueue.noDescription')
  if (description.includes('[AI-GENERATED]') && description.includes('Roadmap Generator')) {
    return t('skillsQueue.aiGeneratedDescription')
  }
  return description
}

export function AdminSkillsQueuePage() {
  const { t } = useTranslation('admin')
  const [rows, setRows] = useState<AdminSkillRowView[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [major, setMajor] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftCategory, setDraftCategory] = useState('')
  const [draftDescription, setDraftDescription] = useState('')

  async function refresh(nextPage = page) {
    const next = await loadAdminSkillsQueue({
      search: query || undefined,
      major: major || undefined,
      page: nextPage,
      pageSize,
    })
    setRows(next.items)
    setTotal(next.total)
  }

  useEffect(() => {
    let cancelled = false

    loadAdminSkillsQueue({ search: query || undefined, major: major || undefined, page, pageSize })
      .then((next) => {
        if (cancelled) return
        setRows(next.items)
        setTotal(next.total)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message || t('skillsQueue.errors.load'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [major, page, query, t])

  function startEdit(row: AdminSkillRowView) {
    setEditingId(row.id)
    setDraftName(row.title)
    setDraftCategory(row.subtitle)
    setDraftDescription(row.description ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setDraftName('')
    setDraftCategory('')
    setDraftDescription('')
  }

  async function onApprove(row: AdminSkillRowView) {
    try {
      setSubmittingId(row.id)
      setError(null)
      await approveAdminSkill(row.id, row)
      cancelEdit()
      await refresh()
    } catch (err) {
      setError((err as Error).message || t('skillsQueue.errors.approve'))
    } finally {
      setSubmittingId(null)
    }
  }

  async function onSaveEdit(id: string) {
    try {
      setSubmittingId(id)
      setError(null)
      await updateAdminSkill(id, {
        name: draftName,
        category: draftCategory,
        description: draftDescription,
      })
      cancelEdit()
      await refresh()
    } catch (err) {
      setError((err as Error).message || t('skillsQueue.errors.update'))
    } finally {
      setSubmittingId(null)
    }
  }

  async function onReject(id: string) {
    try {
      setSubmittingId(id)
      setError(null)
      await rejectAdminSkill(id)
      cancelEdit()
      await refresh()
    } catch (err) {
      setError((err as Error).message || t('skillsQueue.errors.reject'))
    } finally {
      setSubmittingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil((total || rows.length || 1) / pageSize))

  return (
    <div className='p-8 max-w-7xl mx-auto w-full space-y-8'>
      <div>
        <h2 className='text-4xl font-bold text-foreground'>{t('skillsQueue.title')}</h2>
        <p className='text-muted-foreground mt-1'>{t('skillsQueue.subtitle')}</p>
      </div>

      {error ? (
        <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
          {error}
        </div>
      ) : null}

      <section className='bg-card rounded-xl p-6 shadow-sm space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <input
            value={query}
            onChange={(e) => {
              setPage(1)
              setQuery(e.target.value)
            }}
            placeholder={t('skillsQueue.filter.search')}
            className='px-4 py-3 bg-muted rounded-lg border-none'
          />
          <input
            value={major}
            onChange={(e) => {
              setPage(1)
              setMajor(e.target.value)
            }}
            placeholder={t('skillsQueue.filter.major')}
            className='px-4 py-3 bg-muted rounded-lg border-none'
          />
        </div>
        <p className='text-xs text-muted-foreground'>{t('skillsQueue.helper')}</p>
      </section>

      <section className='bg-card rounded-2xl border border-border overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-muted/50'>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                  {t('skillsQueue.table.skill')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                  {t('skillsQueue.table.category')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                  {t('skillsQueue.table.description')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                  {t('skillsQueue.table.status')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right'>
                  {t('skillsQueue.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className='animate-pulse'>
                    <td className='px-6 py-5 min-w-[220px]'>
                      <div className='space-y-2'>
                        <div className='h-4 w-36 rounded bg-muted' />
                        <div className='h-3 w-20 rounded bg-muted' />
                      </div>
                    </td>
                    <td className='px-6 py-5 min-w-[180px]'><div className='h-4 w-24 rounded bg-muted' /></td>
                    <td className='px-6 py-5 min-w-[280px]'>
                      <div className='space-y-2'>
                        <div className='h-4 w-full max-w-xs rounded bg-muted' />
                        <div className='h-4 w-full max-w-sm rounded bg-muted' />
                      </div>
                    </td>
                    <td className='px-6 py-5'><div className='h-6 w-20 rounded-full bg-muted' /></td>
                    <td className='px-6 py-5'>
                      <div className='ml-auto flex justify-end gap-2'>
                        <div className='h-9 w-20 rounded-lg bg-muted' />
                        <div className='h-9 w-20 rounded-lg bg-muted' />
                        <div className='h-9 w-20 rounded-lg bg-muted' />
                      </div>
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-6 py-8'>
                    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-8 text-center'>
                      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <span className='material-symbols-outlined'>psychology_alt</span>
                      </div>
                      <p className='text-sm font-semibold text-foreground'>{t('adminCommon.empty')}</p>
                      <p className='mt-2 text-sm text-muted-foreground'>{t('skillsQueue.helper')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const editing = editingId === row.id
                  const submitting = submittingId === row.id

                  return (
                    <tr key={row.id} className='hover:bg-muted/30 transition-colors align-top'>
                      <td className='px-6 py-5 font-semibold text-foreground min-w-[220px]'>
                        {editing ? (
                          <input
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className='w-full px-3 py-2 bg-muted rounded-lg border-none'
                          />
                        ) : (
                          row.title
                        )}
                        {row.major ? <div className='text-xs text-muted-foreground mt-2'>{row.major}</div> : null}
                      </td>
                      <td className='px-6 py-5 text-muted-foreground min-w-[180px]'>
                        {editing ? (
                          <input
                            value={draftCategory}
                            onChange={(e) => setDraftCategory(e.target.value)}
                            className='w-full px-3 py-2 bg-muted rounded-lg border-none'
                          />
                        ) : (
                          getSkillCategoryLabel(row.subtitle, t)
                        )}
                      </td>
                      <td className='px-6 py-5 text-muted-foreground min-w-[280px]'>
                        {editing ? (
                          <textarea
                            value={draftDescription}
                            onChange={(e) => setDraftDescription(e.target.value)}
                            className='w-full px-3 py-2 bg-muted rounded-lg border-none min-h-24 resize-y'
                          />
                        ) : (
                          getSkillDescriptionLabel(row.description, t)
                        )}
                      </td>
                      <td className='px-6 py-5'>
                        <span className='inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground'>
                          {getSkillStatusLabel(row.status, t)}
                        </span>
                      </td>
                      <td className='px-6 py-5 text-right'>
                        <div className='flex justify-end gap-2 flex-wrap'>
                          {editing ? (
                            <>
                              <button
                                type='button'
                                disabled={submitting}
                                onClick={() => void onSaveEdit(row.id)}
                                className='px-3 py-2 rounded-lg border border-border disabled:opacity-50'
                              >
                                {t('skillsQueue.save')}
                              </button>
                              <button
                                type='button'
                                disabled={submitting}
                                onClick={cancelEdit}
                                className='px-3 py-2 rounded-lg border border-border disabled:opacity-50'
                              >
                                {t('skillsQueue.cancel')}
                              </button>
                              <button
                                type='button'
                                disabled={submitting}
                                onClick={() => void onReject(row.id)}
                                className='px-3 py-2 rounded-lg border border-destructive/30 text-destructive disabled:opacity-50'
                              >
                                {t('skillsQueue.reject')}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type='button'
                                disabled={submitting}
                                onClick={() => startEdit(row)}
                                className='px-3 py-2 rounded-lg border border-border disabled:opacity-50'
                              >
                                {t('skillsQueue.edit')}
                              </button>
                              <button
                                type='button'
                                disabled={submitting}
                                onClick={() => void onApprove(row)}
                                className='px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50'
                              >
                                {t('skillsQueue.approve')}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className='px-6 py-4 flex items-center justify-between border-t border-border bg-muted/30'>
          <p className='text-xs font-semibold text-muted-foreground'>
            {t('adminCommon.pagination', { page, totalPages, total })}
          </p>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className='px-3 py-2 rounded-lg border border-border disabled:opacity-50'
            >
              {t('adminCommon.prev')}
            </button>
            <button
              type='button'
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className='px-3 py-2 rounded-lg border border-border disabled:opacity-50'
            >
              {t('adminCommon.next')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
