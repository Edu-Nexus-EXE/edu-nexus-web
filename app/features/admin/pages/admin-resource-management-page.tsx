import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AdminResourceUpsertRequest } from '~/api/model'

import {
  approveAdminResource,
  createAdminResource,
  deleteAdminResource,
  disableAdminResource,
  loadAdminSkillsList,
  loadAdminResourcesList,
  rejectAdminResource,
  restoreAdminResource,
  updateAdminResource,
  type AdminSkillRowView,
  type AdminResourceRowView
} from '../lib/admin-data'

type ResourceActiveFilter = 'all' | 'active' | 'inactive'
type ConfirmTone = 'primary' | 'success' | 'warning' | 'destructive'

type ResourceConfirmState = {
  title: string
  message: string
  confirmLabel: string
  icon: string
  tone: ConfirmTone
  onConfirm: () => Promise<void>
}

type ResourceFormState = {
  title: string
  type: string
  provider: string
  url: string
  description: string
  accessType: string
  isFree: boolean
  language: string
  durationMinutes: string
  affiliateLabel: string
  affiliateCommissionRate: string
  skillMappings: string
  needsAdminReview: boolean
  isActive: boolean
}

const emptyForm: ResourceFormState = {
  title: '',
  type: 'video',
  provider: '',
  url: '',
  description: '',
  accessType: 'free',
  isFree: true,
  language: 'vi',
  durationMinutes: '',
  affiliateLabel: '',
  affiliateCommissionRate: '',
  skillMappings: '',
  needsAdminReview: false,
  isActive: true
}

function toForm(row: AdminResourceRowView): ResourceFormState {
  return {
    title: row.title,
    type: row.type,
    provider: row.provider,
    url: row.url ?? '',
    description: row.description ?? '',
    accessType: row.accessType,
    isFree: row.isFree,
    language: row.language,
    durationMinutes: row.durationMinutes ? String(row.durationMinutes) : '',
    affiliateLabel: row.affiliateLabel ?? '',
    affiliateCommissionRate: row.affiliateCommissionRate ? String(row.affiliateCommissionRate) : '',
    skillMappings: row.skillMappings.map((item) => item.skillId).join(', '),
    needsAdminReview: row.needsAdminReview,
    isActive: row.isActive
  }
}

function toPayload(form: ResourceFormState): AdminResourceUpsertRequest {
  const duration = Number(form.durationMinutes)
  const commission = Number(form.affiliateCommissionRate)
  const skillIds = form.skillMappings
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return {
    title: form.title.trim(),
    type: form.type,
    provider: form.provider.trim(),
    url: form.url.trim(),
    description: form.description.trim() || null,
    isFree: form.isFree,
    accessType: form.accessType,
    affiliateLabel: form.affiliateLabel.trim() || null,
    affiliateCommissionRate: Number.isFinite(commission) ? commission : null,
    language: form.language,
    durationMinutes: Number.isFinite(duration) && duration > 0 ? duration : null,
    needsAdminReview: form.needsAdminReview,
    isActive: form.isActive,
    skillMappings: skillIds.map((skillId, index) => ({
      skillId,
      isPrimary: index === 0,
      sequenceOrder: index + 1
    }))
  }
}

function statusClass(row: AdminResourceRowView) {
  if (!row.isActive) return 'bg-muted text-muted-foreground'
  if (row.needsAdminReview) return 'bg-warning/10 text-warning'
  return 'bg-success/10 text-success'
}

const RESOURCE_TYPE_VI: Record<string, string> = {
  video: 'Video',
  article: 'Bài viết',
  course: 'Khóa học',
  document: 'Tài liệu'
}

const RESOURCE_STATUS_VI: Record<string, string> = {
  pending: 'Cần duyệt',
  approved: 'Đã duyệt',
  inactive: 'Đã tắt'
}

const CONFIRM_TONE_CLASS: Record<ConfirmTone, { icon: string; button: string; ring: string }> = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    button: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90',
    ring: 'border-primary/20'
  },
  success: {
    icon: 'bg-success/10 text-success',
    button: 'bg-success text-primary-foreground hover:bg-success/90',
    ring: 'border-success/25'
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    button: 'bg-warning text-primary-foreground hover:bg-warning/90',
    ring: 'border-warning/25'
  },
  destructive: {
    icon: 'bg-destructive/10 text-destructive',
    button: 'bg-destructive text-primary-foreground hover:bg-destructive/90',
    ring: 'border-destructive/25'
  }
}

function localizeResourceValue(value: string, language: string, table: Record<string, string>) {
  if (!language.startsWith('vi')) return value
  return table[value.toLowerCase()] ?? value
}

export function AdminResourceManagementPage() {
  const { t, i18n } = useTranslation('admin')
  const language = i18n.language ?? 'vi'
  const label = (vi: string, en: string) => (language.startsWith('vi') ? vi : en)
  const [rows, setRows] = useState<AdminResourceRowView[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [needsReview, setNeedsReview] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ResourceActiveFilter>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editing, setEditing] = useState<AdminResourceRowView | null>(null)
  const [isViewing, setIsViewing] = useState(false)
  const [form, setForm] = useState<ResourceFormState>(emptyForm)
  const [formOpen, setFormOpen] = useState(false)
  const [skillSearch, setSkillSearch] = useState('')
  const [skillOptions, setSkillOptions] = useState<AdminSkillRowView[]>([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [confirm, setConfirm] = useState<ResourceConfirmState | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const pageSize = 10

  async function refresh(nextPage = page) {
    const next = await loadAdminResourcesList({
      page: nextPage,
      pageSize,
      search: search || undefined,
      type: type || undefined,
      needsReview: needsReview || undefined,
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active'
    })
    setRows(next.items)
    setTotal(next.total)
  }

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => setLoading(true))
    loadAdminResourcesList({
      page,
      pageSize,
      search: search || undefined,
      type: type || undefined,
      needsReview: needsReview || undefined,
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active'
    })
      .then((next) => {
        if (cancelled) return
        setRows(next.items)
        setTotal(next.total)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message || 'Không thể tải tài nguyên.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeFilter, needsReview, page, search, type])

  useEffect(() => {
    if (!formOpen || isViewing) return
    let cancelled = false
    queueMicrotask(() => setSkillsLoading(true))
    loadAdminSkillsList({ search: skillSearch || undefined, page: 1, pageSize: 50 })
      .then((next) => {
        if (!cancelled) setSkillOptions(next.items)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message || 'Failed to load skills.')
      })
      .finally(() => {
        if (!cancelled) setSkillsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [formOpen, isViewing, skillSearch])

  const totalPages = Math.max(1, Math.ceil((total || rows.length || 1) / pageSize))
  const stats = useMemo(() => {
    const active = rows.filter((row) => row.isActive).length
    const pending = rows.filter((row) => row.needsAdminReview).length
    const free = rows.filter((row) => row.isFree).length
    return {
      active,
      pending,
      freeRatio: rows.length ? Math.round((free / rows.length) * 100) : 0
    }
  }, [rows])

  function startEdit(row: AdminResourceRowView) {
    setIsViewing(false)
    setEditing(row)
    setForm(toForm(row))
    setFormOpen(true)
  }

  function startView(row: AdminResourceRowView) {
    setIsViewing(true)
    setEditing(row)
    setForm(toForm(row))
    setFormOpen(true)
  }

  function resetForm() {
    setEditing(null)
    setIsViewing(false)
    setForm(emptyForm)
  }

  function openCreateForm() {
    resetForm()
    setFormOpen(true)
  }

  function closeForm() {
    resetForm()
    setSkillSearch('')
    setFormOpen(false)
  }

  function formSkillIds() {
    return form.skillMappings
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  function toggleFormSkill(skillId: string) {
    const current = formSkillIds()
    const next = current.includes(skillId) ? current.filter((id) => id !== skillId) : [...current, skillId]
    setForm((value) => ({ ...value, skillMappings: next.join(', ') }))
  }

  async function runConfirm() {
    if (!confirm) return
    try {
      setConfirmBusy(true)
      await confirm.onConfirm()
      setConfirm(null)
    } finally {
      setConfirmBusy(false)
    }
  }

  function openConfirm(next: ResourceConfirmState) {
    setConfirm(next)
  }

  async function saveResource() {
    try {
      setBusyId(editing?.id ?? 'new')
      setError(null)
      if (editing) {
        await updateAdminResource(editing.id, toPayload(form))
      } else {
        await createAdminResource(toPayload(form))
      }
      closeForm()
      await refresh(1)
      setPage(1)
    } catch (err) {
      setError((err as Error).message || label('Không thể lưu tài nguyên.', 'Failed to save resource.'))
      throw err
    } finally {
      setBusyId(null)
    }
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.url.trim()) {
      setError(label('Vui lòng nhập tiêu đề và URL tài nguyên.', 'Please enter resource title and URL.'))
      return
    }

    openConfirm({
      title: editing
        ? label('Lưu thay đổi tài nguyên?', 'Save resource changes?')
        : label('Tạo tài nguyên mới?', 'Create new resource?'),
      message: editing
        ? label(
            `Các thay đổi của "${form.title.trim()}" sẽ được áp dụng ngay trên kho học liệu.`,
            `Changes to "${form.title.trim()}" will be applied to the learning library.`
          )
        : label(
            `Tài nguyên "${form.title.trim()}" sẽ được thêm vào kho học liệu.`,
            `Resource "${form.title.trim()}" will be added to the learning library.`
          ),
      confirmLabel: editing ? label('Lưu thay đổi', 'Save changes') : label('Tạo tài nguyên', 'Create resource'),
      icon: editing ? 'save' : 'add_circle',
      tone: 'primary',
      onConfirm: saveResource
    })
  }

  function handleDelete(row: AdminResourceRowView) {
    openConfirm({
      title: label('Xóa tài nguyên?', 'Delete resource?'),
      message: label(
        `"${row.title}" sẽ bị gỡ khỏi kho học liệu. Hành động này không ảnh hưởng các dữ liệu khác.`,
        `"${row.title}" will be removed from the learning library. Other data will not be affected.`
      ),
      confirmLabel: label('Xóa tài nguyên', 'Delete resource'),
      icon: 'delete',
      tone: 'destructive',
      onConfirm: async () => {
        try {
          setBusyId(row.id)
          await deleteAdminResource(row.id)
          await refresh()
        } catch (err) {
          setError((err as Error).message || label('Không thể xóa tài nguyên.', 'Failed to delete resource.'))
          throw err
        } finally {
          setBusyId(null)
        }
      }
    })
  }

  async function handleReview(row: AdminResourceRowView, action: 'approve' | 'reject') {
    if (action === 'reject') {
      openConfirm({
        title: label('Từ chối tài nguyên?', 'Reject resource?'),
        message: label(
          `"${row.title}" sẽ được tắt và vẫn còn trong admin để khôi phục sau.`,
          `"${row.title}" will be disabled and remain available in admin for later restore.`
        ),
        confirmLabel: label('Từ chối', 'Reject'),
        icon: 'do_not_disturb_on',
        tone: 'warning',
        onConfirm: async () => {
          try {
            setBusyId(row.id)
            await rejectAdminResource(row.id)
            await refresh()
          } catch (err) {
            setError(
              (err as Error).message || label('Không thể cập nhật trạng thái duyệt.', 'Failed to update review status.')
            )
            throw err
          } finally {
            setBusyId(null)
          }
        }
      })
      return
    }

    try {
      setBusyId(row.id)
      await approveAdminResource(row.id)
      await refresh()
    } catch (err) {
      setError(
        (err as Error).message || label('Không thể cập nhật trạng thái duyệt.', 'Failed to update review status.')
      )
    } finally {
      setBusyId(null)
    }
  }

  function handleDisable(row: AdminResourceRowView) {
    openConfirm({
      title: label('Tắt tài nguyên?', 'Disable resource?'),
      message: label(
        `"${row.title}" sẽ không còn hiển thị cho người dùng, nhưng admin vẫn có thể bật lại.`,
        `"${row.title}" will no longer be shown to users, but admins can restore it later.`
      ),
      confirmLabel: label('Tắt tài nguyên', 'Disable resource'),
      icon: 'block',
      tone: 'warning',
      onConfirm: async () => {
        try {
          setBusyId(row.id)
          await disableAdminResource(row)
          await refresh()
        } catch (err) {
          setError((err as Error).message || label('Không thể tắt tài nguyên.', 'Failed to disable resource.'))
          throw err
        } finally {
          setBusyId(null)
        }
      }
    })
  }

  function handleRestore(row: AdminResourceRowView) {
    openConfirm({
      title: label('Bật lại tài nguyên?', 'Restore resource?'),
      message: label(
        `"${row.title}" sẽ được hiển thị lại cho người dùng trong các gợi ý học tập.`,
        `"${row.title}" will be visible to users again in learning recommendations.`
      ),
      confirmLabel: label('Bật lại', 'Restore'),
      icon: 'settings_backup_restore',
      tone: 'success',
      onConfirm: async () => {
        try {
          setBusyId(row.id)
          await restoreAdminResource(row)
          await refresh()
        } catch (err) {
          setError((err as Error).message || label('Không thể bật lại tài nguyên.', 'Failed to restore resource.'))
          throw err
        } finally {
          setBusyId(null)
        }
      }
    })
  }

  function renderResourceActions(row: AdminResourceRowView) {
    const baseButton =
      'inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors disabled:opacity-50'
    const isPending = row.needsAdminReview
    const isDisabled = !row.isActive

    return (
      <div className='flex justify-end gap-2'>
        <button
          type='button'
          onClick={() => startEdit(row)}
          className={`${baseButton} border-border text-muted-foreground hover:bg-muted hover:text-foreground`}
          title={t('resources.actions.edit')}
          aria-label={t('resources.actions.edit')}
        >
          <span className='material-symbols-outlined text-[18px]'>edit</span>
        </button>
        {isPending ? (
          <button
            type='button'
            disabled={busyId === row.id}
            onClick={() => void handleReview(row, 'approve')}
            className={`${baseButton} border-success/30 bg-success/10 text-success hover:bg-success hover:text-primary-foreground`}
            title={t('resources.actions.approve')}
            aria-label={t('resources.actions.approve')}
          >
            <span className='material-symbols-outlined text-[18px]'>check</span>
          </button>
        ) : null}
        {isPending ? (
          <button
            type='button'
            disabled={busyId === row.id}
            onClick={() => void handleReview(row, 'reject')}
            className={`${baseButton} border-warning/30 text-warning hover:bg-warning/10`}
            title={t('resources.actions.reject')}
            aria-label={t('resources.actions.reject')}
          >
            <span className='material-symbols-outlined text-[18px]'>do_not_disturb_on</span>
          </button>
        ) : null}
        <button
          type='button'
          onClick={() => startView(row)}
          className={`${baseButton} border-border text-muted-foreground hover:bg-primary/10 hover:text-primary`}
          title={t('resources.actions.viewDetails')}
          aria-label={t('resources.actions.viewDetails')}
        >
          <span className='material-symbols-outlined text-[18px]'>visibility</span>
        </button>
        {isDisabled ? (
          <button
            type='button'
            disabled={busyId === row.id}
            onClick={() => void handleRestore(row)}
            className={`${baseButton} border-success/30 text-success hover:bg-success/10`}
            title={t('resources.actions.restore')}
            aria-label={t('resources.actions.restore')}
          >
            <span className='material-symbols-outlined text-[18px]'>settings_backup_restore</span>
          </button>
        ) : null}
        {!isPending && !isDisabled ? (
          <button
            type='button'
            disabled={busyId === row.id}
            onClick={() => void handleDisable(row)}
            className={`${baseButton} border-warning/30 text-warning hover:bg-warning/10`}
            title={t('resources.actions.disable')}
            aria-label={t('resources.actions.disable')}
          >
            <span className='material-symbols-outlined text-[18px]'>block</span>
          </button>
        ) : null}
        {isPending || isDisabled ? (
          <button
            type='button'
            disabled={busyId === row.id}
            onClick={() => void handleDelete(row)}
            className={`${baseButton} border-destructive/30 text-destructive hover:bg-destructive/10`}
            title={t('resources.actions.delete')}
            aria-label={t('resources.actions.delete')}
          >
            <span className='material-symbols-outlined text-[18px]'>delete</span>
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <nav className='mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            <span>Admin</span>
            <span className='material-symbols-outlined text-[12px]'>chevron_right</span>
            <span>{t('resources.breadcrumb')}</span>
          </nav>
          <h1 className='text-4xl font-bold text-foreground'>{t('resources.title')}</h1>
          <p className='mt-2 text-muted-foreground'>{t('resources.subtitle')}</p>
        </div>
        <button
          type='button'
          onClick={openCreateForm}
          className='inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20'
        >
          <span className='material-symbols-outlined'>add</span>
          {t('resources.addResource')}
        </button>
      </header>

      {error ? (
        <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
          {error}
        </div>
      ) : null}

      <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
            {t('resources.stats.total')}
          </p>
          <p className='mt-2 text-3xl font-black text-foreground'>{total || rows.length}</p>
        </div>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
            {t('resources.stats.pending')}
          </p>
          <p className='mt-2 text-3xl font-black text-warning'>{stats.pending}</p>
        </div>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
            {t('resources.stats.freeRatio')}
          </p>
          <p className='mt-2 text-3xl font-black text-primary'>{stats.freeRatio}%</p>
        </div>
      </section>

      <section className='space-y-4'>
        <div className='space-y-4'>
          <div className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
            <div className='flex flex-wrap items-center gap-3'>
              <input
                value={search}
                onChange={(event) => {
                  setPage(1)
                  setSearch(event.target.value)
                }}
                className='min-w-[260px] flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary'
                placeholder={t('resources.filter.search')}
              />
              <select
                value={type}
                onChange={(event) => {
                  setPage(1)
                  setType(event.target.value)
                }}
                className='rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary'
              >
                <option value=''>{t('resources.filter.type')}</option>
                <option value='video'>{t('resources.filter.types.video')}</option>
                <option value='article'>Article</option>
                <option value='course'>{t('resources.filter.types.course')}</option>
                <option value='document'>{t('resources.filter.types.document')}</option>
              </select>
              <select
                value={activeFilter}
                onChange={(event) => {
                  setPage(1)
                  setActiveFilter(event.target.value as ResourceActiveFilter)
                }}
                className='rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary'
              >
                <option value='all'>{t('resources.filter.activeState.all')}</option>
                <option value='active'>{t('resources.filter.activeState.active')}</option>
                <option value='inactive'>{t('resources.filter.activeState.inactive')}</option>
              </select>
              <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                <input
                  type='checkbox'
                  checked={needsReview}
                  onChange={(event) => {
                    setPage(1)
                    setNeedsReview(event.target.checked)
                  }}
                />
                {t('resources.filter.needsReview')}
              </label>
            </div>
          </div>

          <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                      {t('resources.table.titleAndProvider')}
                    </th>
                    <th className='px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                      {t('resources.table.type')}
                    </th>
                    <th className='px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                      {label('Kỹ năng', 'Skills')}
                    </th>
                    <th className='px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                      {t('resources.table.status')}
                    </th>
                    <th className='px-5 py-4 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                      {t('resources.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className='animate-pulse'>
                        <td className='px-5 py-4'>
                          <div className='h-4 w-48 rounded bg-muted' />
                        </td>
                        <td className='px-5 py-4'>
                          <div className='h-4 w-16 rounded bg-muted' />
                        </td>
                        <td className='px-5 py-4'>
                          <div className='h-4 w-20 rounded bg-muted' />
                        </td>
                        <td className='px-5 py-4'>
                          <div className='h-6 w-20 rounded-full bg-muted' />
                        </td>
                        <td className='px-5 py-4'>
                          <div className='ml-auto h-8 w-40 rounded bg-muted' />
                        </td>
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='px-5 py-10 text-center text-sm text-muted-foreground'>
                        {t('adminCommon.empty')}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className='align-top hover:bg-muted/30'>
                        <td className='px-5 py-4'>
                          <p className='font-bold text-foreground'>{row.title}</p>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {row.provider} · {row.language} ·{' '}
                            {row.isFree ? t('resources.table.free') : t('resources.table.paid')}
                          </p>
                          {row.url ? (
                            <a
                              href={row.url}
                              target='_blank'
                              rel='noreferrer'
                              className='mt-1 inline-block max-w-md truncate text-xs text-primary hover:underline'
                            >
                              {row.url}
                            </a>
                          ) : null}
                        </td>
                        <td className='px-5 py-4'>
                          <span className='rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase text-muted-foreground'>
                            {localizeResourceValue(row.type, language, RESOURCE_TYPE_VI)}
                          </span>
                        </td>
                        <td className='px-5 py-4 text-sm text-muted-foreground'>
                          {label(`${row.skillMappings.length} kỹ năng`, `${row.skillMappings.length} skills`)}
                        </td>
                        <td className='px-5 py-4'>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClass(row)}`}>
                            {localizeResourceValue(row.status, language, RESOURCE_STATUS_VI)}
                          </span>
                        </td>
                        <td className='px-5 py-4'>{renderResourceActions(row)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className='flex items-center justify-between border-t border-border bg-muted/30 px-5 py-4'>
              <p className='text-xs font-semibold text-muted-foreground'>
                {t('adminCommon.pagination', { page, totalPages, total })}
              </p>
              <div className='flex gap-2'>
                <button
                  type='button'
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className='rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50'
                >
                  {t('adminCommon.prev')}
                </button>
                <button
                  type='button'
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className='rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50'
                >
                  {t('adminCommon.next')}
                </button>
              </div>
            </div>
          </section>
        </div>

        {formOpen ? (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'>
            <aside className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h2 className='text-lg font-bold text-foreground'>
                    {isViewing
                      ? t('resources.form.viewDetails')
                      : editing
                        ? t('resources.form.editTitle')
                        : t('resources.form.createTitle')}
                  </h2>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {isViewing ? t('resources.form.viewDetailsDesc') : t('resources.form.editDesc')}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={closeForm}
                  className='rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  aria-label={t('resources.form.close')}
                >
                  <span className='material-symbols-outlined text-[20px]'>close</span>
                </button>
              </div>
              <form
                className='mt-5 space-y-3'
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!isViewing) void handleSubmit()
                }}
              >
                <div className='space-y-1.5'>
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('resources.form.title')} *
                  </label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      !isViewing && setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder={label('Tiêu đề', 'Title')}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                    disabled={isViewing}
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('resources.form.provider')}
                  </label>
                  <input
                    value={form.provider}
                    onChange={(event) =>
                      !isViewing && setForm((current) => ({ ...current, provider: event.target.value }))
                    }
                    placeholder={label('Nhà cung cấp, ví dụ YouTube/Udemy', 'Provider, e.g. YouTube/Udemy')}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                    disabled={isViewing}
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('resources.form.url')} *
                  </label>
                  <input
                    value={form.url}
                    onChange={(event) => !isViewing && setForm((current) => ({ ...current, url: event.target.value }))}
                    placeholder='https://...'
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                    disabled={isViewing}
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('resources.form.resourceType')}
                    </label>
                    <select
                      value={form.type}
                      onChange={(event) =>
                        !isViewing && setForm((current) => ({ ...current, type: event.target.value }))
                      }
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                      disabled={isViewing}
                    >
                      <option value='video'>{label('Video', 'Video')}</option>
                      <option value='article'>{label('Bài viết', 'Article')}</option>
                      <option value='course'>{label('Khóa học', 'Course')}</option>
                      <option value='document'>{label('Tài liệu', 'Document')}</option>
                    </select>
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('resources.form.language')}
                    </label>
                    <select
                      value={form.language}
                      onChange={(event) =>
                        !isViewing && setForm((current) => ({ ...current, language: event.target.value }))
                      }
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                      disabled={isViewing}
                    >
                      <option value='vi'>{label('Tiếng Việt', 'Vietnamese')}</option>
                      <option value='en'>{label('Tiếng Anh', 'English')}</option>
                    </select>
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('resources.form.shortDescription')}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      !isViewing && setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder={label('Mô tả ngắn', 'Short description')}
                    className='min-h-20 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                    disabled={isViewing}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('resources.form.relatedSkillIds')}
                  </label>
                  {isViewing ? (
                    <div className='rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground'>
                      {formSkillIds().length
                        ? formSkillIds().join(', ')
                        : label('Chưa gắn kỹ năng.', 'No skills mapped.')}
                    </div>
                  ) : (
                    <div className='rounded-2xl border border-border bg-background p-3'>
                      <input
                        value={skillSearch}
                        onChange={(event) => setSkillSearch(event.target.value)}
                        placeholder={label('Tìm kỹ năng để gắn...', 'Search skills to map...')}
                        className='w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary'
                      />
                      <div className='mt-3 max-h-44 space-y-2 overflow-y-auto pr-1'>
                        {skillsLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className='h-12 animate-pulse rounded-xl bg-muted' />
                          ))
                        ) : skillOptions.length === 0 ? (
                          <p className='rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground'>
                            {label('Không tìm thấy kỹ năng.', 'No skills found.')}
                          </p>
                        ) : (
                          skillOptions.map((skill) => {
                            const checked = formSkillIds().includes(skill.id)
                            return (
                              <label
                                key={skill.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                              >
                                <input
                                  type='checkbox'
                                  checked={checked}
                                  onChange={() => toggleFormSkill(skill.id)}
                                  className='mt-1'
                                />
                                <span className='min-w-0'>
                                  <span className='block font-bold text-foreground'>{skill.title}</span>
                                  <span className='block truncate text-xs text-muted-foreground'>
                                    {skill.subtitle} · {skill.major || 'IT'} · {skill.id}
                                  </span>
                                </span>
                              </label>
                            )
                          })
                        )}
                      </div>
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {formSkillIds().map((id) => {
                          const skill = skillOptions.find((item) => item.id === id)
                          return (
                            <button
                              key={id}
                              type='button'
                              onClick={() => toggleFormSkill(id)}
                              className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20'
                            >
                              {skill?.title ?? id} ×
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('resources.form.duration')}
                    </label>
                    <input
                      value={form.durationMinutes}
                      onChange={(event) =>
                        !isViewing && setForm((current) => ({ ...current, durationMinutes: event.target.value }))
                      }
                      placeholder={label('Số phút', 'Minutes')}
                      type='number'
                      min='0'
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                      disabled={isViewing}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('resources.form.accessType')}
                    </label>
                    <select
                      value={form.accessType}
                      onChange={(event) =>
                        !isViewing &&
                        setForm((current) => ({
                          ...current,
                          accessType: event.target.value,
                          isFree: event.target.value === 'free'
                        }))
                      }
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                      disabled={isViewing}
                    >
                      <option value='free'>{label('Miễn phí', 'Free')}</option>
                      <option value='paid'>{label('Trả phí', 'Paid')}</option>
                      <option value='affiliate'>{label('Affiliate', 'Affiliate')}</option>
                    </select>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('resources.form.affiliateLabel')}
                    </label>
                    <input
                      value={form.affiliateLabel}
                      onChange={(event) =>
                        !isViewing && setForm((current) => ({ ...current, affiliateLabel: event.target.value }))
                      }
                      placeholder={label('Nhãn Affiliate', 'Affiliate label')}
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                      disabled={isViewing}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('resources.form.commission')}
                    </label>
                    <input
                      value={form.affiliateCommissionRate}
                      onChange={(event) =>
                        !isViewing &&
                        setForm((current) => ({ ...current, affiliateCommissionRate: event.target.value }))
                      }
                      placeholder={label('Phần trăm hoa hồng', 'Commission percentage')}
                      type='number'
                      min='0'
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60'
                      disabled={isViewing}
                    />
                  </div>
                </div>
                <div className='flex flex-wrap gap-4 text-sm'>
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={form.needsAdminReview}
                      onChange={(event) =>
                        !isViewing && setForm((current) => ({ ...current, needsAdminReview: event.target.checked }))
                      }
                      className='rounded'
                      disabled={isViewing}
                    />
                    {t('resources.form.needsReview')}
                  </label>
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={form.isActive}
                      onChange={(event) =>
                        !isViewing && setForm((current) => ({ ...current, isActive: event.target.checked }))
                      }
                      className='rounded'
                      disabled={isViewing}
                    />
                    {t('resources.form.active')}
                  </label>
                </div>
                <div className='flex gap-3 pt-2'>
                  {!isViewing ? (
                    <>
                      <button
                        type='submit'
                        disabled={busyId === (editing?.id ?? 'new')}
                        className='flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50'
                      >
                        {editing ? t('resources.form.saveChanges') : t('resources.form.createResource')}
                      </button>
                      <button
                        type='button'
                        onClick={closeForm}
                        className='rounded-xl border border-border px-4 py-3 text-sm font-bold'
                      >
                        {t('resources.form.cancel')}
                      </button>
                    </>
                  ) : (
                    <button
                      type='button'
                      onClick={closeForm}
                      className='w-full rounded-xl border border-border px-4 py-3 text-sm font-bold'
                    >
                      {label('Đóng', 'Close')}
                    </button>
                  )}
                </div>
              </form>
            </aside>
          </div>
        ) : null}

        {confirm ? (
          <div
            className='fixed inset-0 z-[60] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md'
            onClick={() => !confirmBusy && setConfirm(null)}
          >
            <div
              className={`w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl ${CONFIRM_TONE_CLASS[confirm.tone].ring}`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className='flex items-start gap-4'>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${CONFIRM_TONE_CLASS[confirm.tone].icon}`}
                >
                  <span className='material-symbols-outlined text-[24px]'>{confirm.icon}</span>
                </div>
                <div className='min-w-0'>
                  <h3 className='text-xl font-black text-foreground'>{confirm.title}</h3>
                  <p className='mt-2 text-sm leading-6 text-muted-foreground'>{confirm.message}</p>
                </div>
              </div>

              <div className='mt-6 flex gap-3'>
                <button
                  type='button'
                  disabled={confirmBusy}
                  onClick={() => setConfirm(null)}
                  className='flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50'
                >
                  {t('adminCommon.cancel')}
                </button>
                <button
                  type='button'
                  disabled={confirmBusy}
                  onClick={() => void runConfirm()}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50 ${CONFIRM_TONE_CLASS[confirm.tone].button}`}
                >
                  {confirmBusy ? t('adminCommon.processing') : confirm.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
