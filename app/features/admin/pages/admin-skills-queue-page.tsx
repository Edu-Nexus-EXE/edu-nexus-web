import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  addAdminSkillPrerequisite,
  approveAdminSkill,
  createAdminSkill,
  deleteAdminSkillPrerequisite,
  loadAdminSkillsList,
  loadAdminSkillsQueue,
  mergeAdminSkill,
  setAdminSkillActive,
  updateAdminSkill,
  type AdminSkillRowView,
} from '../lib/admin-data'

type SkillFormState = {
  name: string
  slug: string
  category: string
  major: string
  description: string
  difficultyLevel: string
  isActive: boolean
}

type ConfirmTone = 'primary' | 'success' | 'warning' | 'destructive'

type SkillConfirmState = {
  title: string
  message: string
  confirmLabel: string
  icon: string
  tone: ConfirmTone
  onConfirm: () => Promise<void>
}

const emptySkillForm: SkillFormState = {
  name: '',
  slug: '',
  category: 'uncategorized',
  major: 'IT',
  description: '',
  difficultyLevel: '3',
  isActive: true,
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toForm(row: AdminSkillRowView): SkillFormState {
  return {
    name: row.title,
    slug: row.slug || slugify(row.title),
    category: row.subtitle,
    major: row.major || 'IT',
    description: row.description || '',
    difficultyLevel: String(row.difficultyLevel ?? 3),
    isActive: Boolean(row.isActive ?? true),
  }
}

function difficulty(value: string) {
  const next = Number(value)
  return Number.isFinite(next) ? Math.min(5, Math.max(1, next)) : 3
}

function statusClass(row: AdminSkillRowView) {
  if (!row.isActive) return 'bg-muted text-muted-foreground'
  if (row.status === 'pending') return 'bg-warning/10 text-warning'
  return 'bg-success/10 text-success'
}

const SKILL_STATUS_VI: Record<string, string> = {
  pending: 'Cần duyệt',
  active: 'Đang bật',
  inactive: 'Đã tắt',
  approved: 'Đã duyệt',
}

const SKILL_CATEGORY_VI: Record<string, string> = {
  uncategorized: 'Chưa phân loại',
  framework: 'Framework',
  devops: 'DevOps',
  'programming-language': 'Ngôn ngữ lập trình',
  database: 'Cơ sở dữ liệu',
}

const CONFIRM_TONE_CLASS: Record<ConfirmTone, { icon: string; button: string; ring: string }> = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    button: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90',
    ring: 'border-primary/20',
  },
  success: {
    icon: 'bg-success/10 text-success',
    button: 'bg-success text-primary-foreground hover:bg-success/90',
    ring: 'border-success/25',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    button: 'bg-warning text-primary-foreground hover:bg-warning/90',
    ring: 'border-warning/25',
  },
  destructive: {
    icon: 'bg-destructive/10 text-destructive',
    button: 'bg-destructive text-primary-foreground hover:bg-destructive/90',
    ring: 'border-destructive/25',
  },
}

function localizeSkillValue(value: string | undefined, language: string, table: Record<string, string>) {
  if (!value || !language.startsWith('vi')) return value ?? ''
  return table[value.toLowerCase()] ?? value
}

export function AdminSkillsQueuePage() {
  const { t, i18n } = useTranslation('admin')
  const language = i18n.language ?? 'vi'
  const label = (vi: string, en: string) => (language.startsWith('vi') ? vi : en)
  const [skills, setSkills] = useState<AdminSkillRowView[]>([])
  const [queue, setQueue] = useState<AdminSkillRowView[]>([])
  const [loading, setLoading] = useState(true)
  const [queueLoading, setQueueLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [major, setMajor] = useState('')
  const [onlyActive, setOnlyActive] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [queuePage, setQueuePage] = useState(1)
  const [queueTotal, setQueueTotal] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminSkillRowView | null>(null)
  const [isViewing, setIsViewing] = useState(false)
  const [form, setForm] = useState<SkillFormState>(emptySkillForm)
  const [formOpen, setFormOpen] = useState(false)
  const [prereqSkillId, setPrereqSkillId] = useState('')
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [mergeReason, setMergeReason] = useState('')
  const [skillPickerSearch, setSkillPickerSearch] = useState('')
  const [skillPickerOptions, setSkillPickerOptions] = useState<AdminSkillRowView[]>([])
  const [skillPickerLoading, setSkillPickerLoading] = useState(false)
  const [confirm, setConfirm] = useState<SkillConfirmState | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const pageSize = 10

  async function refreshSkills(nextPage = page) {
    const next = await loadAdminSkillsList({
      search: search || undefined,
      category: category || undefined,
      major: major || undefined,
      isActive: onlyActive || undefined,
      page: nextPage,
      pageSize,
    })
    setSkills(next.items)
    setTotal(next.total)
  }

  async function refreshQueue(nextPage = queuePage) {
    const next = await loadAdminSkillsQueue({
      search: search || undefined,
      major: major || undefined,
      page: nextPage,
      pageSize,
    })
    setQueue(next.items)
    setQueueTotal(next.total)
  }

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => setLoading(true))
    loadAdminSkillsList({
      search: search || undefined,
      category: category || undefined,
      major: major || undefined,
      isActive: onlyActive || undefined,
      page,
      pageSize,
    })
      .then((next) => {
        if (cancelled) return
        setSkills(next.items)
        setTotal(next.total)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message || 'Không thể tải taxonomy kỹ năng.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [category, major, onlyActive, page, search])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => setQueueLoading(true))
    loadAdminSkillsQueue({
      search: search || undefined,
      major: major || undefined,
      page: queuePage,
      pageSize,
    })
      .then((next) => {
        if (cancelled) return
        setQueue(next.items)
        setQueueTotal(next.total)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message || 'Không thể tải skill review queue.')
      })
      .finally(() => {
        if (!cancelled) setQueueLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [major, queuePage, search])

  useEffect(() => {
    if (!formOpen || isViewing) return
    let cancelled = false
    queueMicrotask(() => setSkillPickerLoading(true))
    loadAdminSkillsList({ search: skillPickerSearch || undefined, page: 1, pageSize: 80 })
      .then((next) => {
        if (!cancelled) setSkillPickerOptions(next.items)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message || 'Failed to load skills.')
      })
      .finally(() => {
        if (!cancelled) setSkillPickerLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [formOpen, isViewing, skillPickerSearch])

  const totalPages = Math.max(1, Math.ceil((total || skills.length || 1) / pageSize))
  const queuePages = Math.max(1, Math.ceil((queueTotal || queue.length || 1) / pageSize))
  const stats = useMemo(() => ({
    total: total || skills.length,
    active: skills.filter((skill) => skill.isActive).length,
    pending: queueTotal || queue.length,
  }), [queue.length, queueTotal, skills, total])

  function resetForm() {
    setEditing(null)
    setIsViewing(false)
    setForm(emptySkillForm)
    setPrereqSkillId('')
    setMergeTargetId('')
    setMergeReason('')
    setSkillPickerSearch('')
  }

  function startEdit(row: AdminSkillRowView) {
    setIsViewing(false)
    setEditing(row)
    setForm(toForm(row))
    setPrereqSkillId('')
    setMergeTargetId('')
    setMergeReason('')
    setFormOpen(true)
  }

  function startView(row: AdminSkillRowView) {
    setIsViewing(true)
    setEditing(row)
    setForm(toForm(row))
    setPrereqSkillId('')
    setMergeTargetId('')
    setMergeReason('')
    setFormOpen(true)
  }

  function openCreateForm() {
    resetForm()
    setFormOpen(true)
  }

  function closeForm() {
    resetForm()
    setFormOpen(false)
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

  function openConfirm(next: SkillConfirmState) {
    setConfirm(next)
  }

  async function saveSkill() {
    try {
      setBusyId(editing?.id ?? 'new')
      setError(null)
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        category: form.category.trim() || 'uncategorized',
        major: form.major.trim() || 'IT',
        description: form.description.trim() || null,
        difficultyLevel: difficulty(form.difficultyLevel),
      }
      if (editing) {
        await updateAdminSkill(editing.id, payload)
        if (Boolean(editing.isActive ?? true) !== form.isActive) {
          await setAdminSkillActive(editing.id, form.isActive)
        }
      } else {
        await createAdminSkill(payload)
      }
      closeForm()
      await refreshSkills(1)
      await refreshQueue()
      setPage(1)
    } catch (err) {
      setError((err as Error).message || label('Không thể lưu kỹ năng.', 'Failed to save skill.'))
      throw err
    } finally {
      setBusyId(null)
    }
  }

  function handleSubmitSkill() {
    if (!form.name.trim()) {
      setError(label('Vui lòng nhập tên kỹ năng.', 'Please enter a skill name.'))
      return
    }

    openConfirm({
      title: editing ? label('Lưu thay đổi kỹ năng?', 'Save skill changes?') : label('Tạo kỹ năng mới?', 'Create new skill?'),
      message: editing
        ? label(`Metadata và trạng thái của "${form.name.trim()}" sẽ được cập nhật trong taxonomy.`, `Metadata and status for "${form.name.trim()}" will be updated in the taxonomy.`)
        : label(`"${form.name.trim()}" sẽ được thêm vào taxonomy kỹ năng của hệ thống.`, `"${form.name.trim()}" will be added to the system skill taxonomy.`),
      confirmLabel: editing ? label('Lưu thay đổi', 'Save changes') : label('Tạo kỹ năng', 'Create skill'),
      icon: editing ? 'save' : 'add_circle',
      tone: 'primary',
      onConfirm: saveSkill,
    })
  }

  function handleApprove(row: AdminSkillRowView) {
    openConfirm({
      title: label('Duyệt kỹ năng AI tạo?', 'Approve AI-generated skill?'),
      message: label(`"${row.title}" sẽ rời hàng đợi duyệt và được phép dùng trong hệ thống.`, `"${row.title}" will leave the review queue and become available in the system.`),
      confirmLabel: label('Duyệt kỹ năng', 'Approve skill'),
      icon: 'check_circle',
      tone: 'success',
      onConfirm: async () => {
        try {
          setBusyId(row.id)
          await approveAdminSkill(row.id)
          await refreshQueue()
          await refreshSkills()
        } catch (err) {
          setError((err as Error).message || label('Không thể duyệt kỹ năng.', 'Failed to approve skill.'))
          throw err
        } finally {
          setBusyId(null)
        }
      },
    })
  }

  function handleToggleActive(row: AdminSkillRowView) {
    const nextActive = !Boolean(row.isActive)
    openConfirm({
      title: nextActive ? label('Bật kỹ năng?', 'Activate skill?') : label('Tắt kỹ năng?', 'Deactivate skill?'),
      message: nextActive
        ? label(`"${row.title}" sẽ được dùng lại trong taxonomy, roadmap và gợi ý liên quan.`, `"${row.title}" will be available again for taxonomy, roadmaps, and recommendations.`)
        : label(`"${row.title}" sẽ bị ẩn khỏi hệ thống sử dụng mới, nhưng dữ liệu lịch sử vẫn được giữ.`, `"${row.title}" will be hidden from new system use, while history remains intact.`),
      confirmLabel: nextActive ? label('Bật kỹ năng', 'Activate skill') : label('Tắt kỹ năng', 'Deactivate skill'),
      icon: nextActive ? 'toggle_on' : 'block',
      tone: nextActive ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          setBusyId(row.id)
          await setAdminSkillActive(row.id, nextActive)
          await refreshQueue()
          await refreshSkills()
        } catch (err) {
          setError((err as Error).message || label('Không thể cập nhật trạng thái kỹ năng.', 'Failed to update skill status.'))
          throw err
        } finally {
          setBusyId(null)
        }
      },
    })
  }

  function handleAddPrereq() {
    if (!editing || !prereqSkillId.trim()) return
    const target = skillPickerOptions.find((skill) => skill.id === prereqSkillId.trim())
    openConfirm({
      title: label('Thêm kỹ năng tiên quyết?', 'Add prerequisite?'),
      message: label(`"${target?.title ?? prereqSkillId}" sẽ trở thành kỹ năng cần học trước "${editing.title}".`, `"${target?.title ?? prereqSkillId}" will become a prerequisite for "${editing.title}".`),
      confirmLabel: label('Thêm tiên quyết', 'Add prerequisite'),
      icon: 'account_tree',
      tone: 'primary',
      onConfirm: async () => {
        try {
          setBusyId(editing.id)
          await addAdminSkillPrerequisite(editing.id, prereqSkillId.trim())
          setPrereqSkillId('')
          await refreshSkills()
        } catch (err) {
          setError((err as Error).message || label('Không thể thêm kỹ năng tiên quyết.', 'Failed to add prerequisite.'))
          throw err
        } finally {
          setBusyId(null)
        }
      },
    })
  }

  function handleRemovePrereq(prereqId: string) {
    if (!editing) return
    const target = editing.prerequisites?.find((skill) => skill.id === prereqId)
    openConfirm({
      title: label('Xóa kỹ năng tiên quyết?', 'Remove prerequisite?'),
      message: label(`"${target?.name ?? prereqId}" sẽ không còn là điều kiện học trước của "${editing.title}".`, `"${target?.name ?? prereqId}" will no longer be a prerequisite for "${editing.title}".`),
      confirmLabel: label('Xóa tiên quyết', 'Remove prerequisite'),
      icon: 'link_off',
      tone: 'warning',
      onConfirm: async () => {
        try {
          setBusyId(editing.id)
          await deleteAdminSkillPrerequisite(editing.id, prereqId)
          await refreshSkills()
        } catch (err) {
          setError((err as Error).message || label('Không thể xóa kỹ năng tiên quyết.', 'Failed to remove prerequisite.'))
          throw err
        } finally {
          setBusyId(null)
        }
      },
    })
  }

  function handleMerge(row: AdminSkillRowView) {
    if (!mergeTargetId.trim() || mergeTargetId.trim() === row.id) {
      setError(label('Chọn kỹ năng đích khác kỹ năng hiện tại để gộp.', 'Choose a target skill different from the current skill.'))
      return
    }
    const target = skillPickerOptions.find((skill) => skill.id === mergeTargetId.trim())
    openConfirm({
      title: label('Gộp kỹ năng trùng?', 'Merge duplicate skill?'),
      message: label(`"${row.title}" sẽ được gộp vào "${target?.title ?? mergeTargetId}". Toàn bộ usage sẽ chuyển sang kỹ năng đích và kỹ năng cũ sẽ bị xóa.`, `"${row.title}" will be merged into "${target?.title ?? mergeTargetId}". All usage moves to the target skill and the old skill will be deleted.`),
      confirmLabel: label('Gộp kỹ năng', 'Merge skill'),
      icon: 'merge_type',
      tone: 'destructive',
      onConfirm: async () => {
        try {
          setBusyId(row.id)
          await mergeAdminSkill(row.id, mergeTargetId.trim(), mergeReason.trim())
          closeForm()
          await refreshQueue()
          await refreshSkills()
        } catch (err) {
          setError((err as Error).message || label('Không thể gộp kỹ năng.', 'Failed to merge skill.'))
          throw err
        } finally {
          setBusyId(null)
        }
      },
    })
  }

  function renderSkillActions(row: AdminSkillRowView, variant: 'list' | 'queue') {
    const baseButton = 'inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors disabled:opacity-50'
    return (
      <div className='flex justify-end gap-2'>
        <button type='button' onClick={() => startView(row)} className={`${baseButton} border-border text-muted-foreground hover:bg-primary/10 hover:text-primary`} title={t('skillsQueue.viewDetails')} aria-label={t('skillsQueue.viewDetails')}>
          <span className='material-symbols-outlined text-[18px]'>visibility</span>
        </button>
        <button type='button' onClick={() => startEdit(row)} className={`${baseButton} border-border text-muted-foreground hover:bg-muted hover:text-foreground`} title={t('skillsQueue.edit')} aria-label={t('skillsQueue.edit')}>
          <span className='material-symbols-outlined text-[18px]'>edit</span>
        </button>
        {variant === 'queue' ? (
          <button type='button' disabled={busyId === row.id} onClick={() => void handleApprove(row)} className={`${baseButton} border-success/30 bg-success/10 text-success hover:bg-success hover:text-primary-foreground`} title={t('skillsQueue.approve')} aria-label={t('skillsQueue.approve')}>
            <span className='material-symbols-outlined text-[18px]'>check</span>
          </button>
        ) : null}
        <button
          type='button'
          disabled={busyId === row.id}
          onClick={() => handleToggleActive(row)}
          className={`${baseButton} ${row.isActive ? 'border-warning/30 text-warning hover:bg-warning/10' : 'border-success/30 text-success hover:bg-success/10'}`}
          title={row.isActive ? label('Tắt kỹ năng', 'Deactivate skill') : label('Bật kỹ năng', 'Activate skill')}
          aria-label={row.isActive ? label('Tắt kỹ năng', 'Deactivate skill') : label('Bật kỹ năng', 'Activate skill')}
        >
          <span className='material-symbols-outlined text-[18px]'>{row.isActive ? 'block' : 'settings_backup_restore'}</span>
        </button>
      </div>
    )
  }

  return (
    <div className='p-8 max-w-7xl mx-auto w-full space-y-8'>
      <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <h1 className='text-4xl font-bold text-foreground'>{label('Phân loại kỹ năng & hàng đợi duyệt', 'Skills Taxonomy & Review Queue')}</h1>
          <p className='mt-2 text-muted-foreground'>{label('Quản lý bộ kỹ năng, quan hệ kỹ năng tiên quyết và hàng đợi kỹ năng do AI tạo.', 'Manage skills taxonomy, prerequisite graph, and AI-generated skill review queue.')}</p>
        </div>
        <button
          type='button'
          onClick={openCreateForm}
          className='inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20'
        >
          <span className='material-symbols-outlined'>add</span>
          {label('Tạo kỹ năng', 'Create skill')}
        </button>
      </header>

      {error ? <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>{error}</div> : null}

      <section className='overflow-hidden rounded-2xl border border-warning/20 bg-card shadow-sm'>
        <div className='flex flex-col gap-3 border-b border-border bg-warning/5 px-5 py-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-lg font-bold text-foreground'>{label('Hàng đợi duyệt kỹ năng', 'Skill Review Queue')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{label('Ưu tiên xử lý các kỹ năng AI tạo trước khi chúng được dùng trong hệ thống.', 'Prioritize AI-generated skills before they become available in the system.')}</p>
          </div>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-warning/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-warning'>
            <span className='material-symbols-outlined text-[18px]'>pending_actions</span>
            {queueTotal} {label('chờ duyệt', 'pending')}
          </span>
        </div>
        <div className='divide-y divide-border'>
          {queueLoading ? (
            Array.from({ length: 3 }).map((_, index) => <div key={index} className='h-24 animate-pulse bg-muted/20' />)
          ) : queue.length === 0 ? (
            <div className='p-8 text-center text-sm text-muted-foreground'>{label('Không có kỹ năng chờ duyệt.', 'No skills pending review.')}</div>
          ) : (
            queue.map((row) => (
              <article key={row.id} className='p-5'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='min-w-0'>
                    <h3 className='font-bold text-foreground'>{row.title}</h3>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {localizeSkillValue(row.subtitle, language, SKILL_CATEGORY_VI)} · {row.major || 'IT'} · {label('Lộ trình', 'Roadmap')} {row.roadmapUsage ?? 0} · {label('Tài nguyên', 'Resource')} {row.resourceCount ?? 0}
                    </p>
                    <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>{row.description || label('Chưa có mô tả.', 'No description yet.')}</p>
                  </div>
                  {renderSkillActions(row, 'queue')}
                </div>
              </article>
            ))
          )}
        </div>
        <div className='flex items-center justify-between border-t border-border bg-muted/30 px-5 py-4'>
          <p className='text-xs font-semibold text-muted-foreground'>{t('adminCommon.pagination', { page: queuePage, totalPages: queuePages, total: queueTotal })}</p>
          <div className='flex gap-2'>
            <button type='button' disabled={queuePage <= 1} onClick={() => setQueuePage((current) => Math.max(1, current - 1))} className='rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50'>{label('Trước', 'Previous')}</button>
            <button type='button' disabled={queuePage >= queuePages} onClick={() => setQueuePage((current) => Math.min(queuePages, current + 1))} className='rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50'>{label('Sau', 'Next')}</button>
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label('Tổng kỹ năng', 'Total skills')}</p>
          <p className='mt-2 text-3xl font-black text-foreground'>{stats.total}</p>
        </div>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label('Đang bật trong trang', 'Active on page')}</p>
          <p className='mt-2 text-3xl font-black text-success'>{stats.active}</p>
        </div>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label('Chờ duyệt', 'Pending review')}</p>
          <p className='mt-2 text-3xl font-black text-warning'>{stats.pending}</p>
        </div>
      </section>

      <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <input value={search} onChange={(event) => {
            setPage(1)
            setQueuePage(1)
            setSearch(event.target.value)
          }} placeholder={label('Tìm kỹ năng...', 'Search skills...')} className='rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary' />
          <input value={category} onChange={(event) => {
            setPage(1)
            setCategory(event.target.value)
          }} placeholder={label('Danh mục, ví dụ framework', 'Category, e.g. framework')} className='rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary' />
          <input value={major} onChange={(event) => {
            setPage(1)
            setQueuePage(1)
            setMajor(event.target.value)
          }} placeholder={label('Ngành, ví dụ IT', 'Major, e.g. IT')} className='rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary' />
          <label className='flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold'>
            <input type='checkbox' checked={onlyActive} onChange={(event) => {
              setPage(1)
              setOnlyActive(event.target.checked)
            }} />
            {label('Chỉ đang bật', 'Active only')}
          </label>
        </div>
      </section>

      <section className='space-y-6'>
        <div className='space-y-6'>
          <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
            <div className='border-b border-border px-5 py-4'>
              <h2 className='text-lg font-bold text-foreground'>{label('Danh sách kỹ năng', 'Skills list')}</h2>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-left'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label('Kỹ năng', 'Skill')}</th>
                    <th className='px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label('Danh mục', 'Category')}</th>
                    <th className='px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label('Sử dụng', 'Usage')}</th>
                    <th className='px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label('Trạng thái', 'Status')}</th>
                    <th className='px-5 py-4 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label('Thao tác', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className='animate-pulse'>
                        <td className='px-5 py-4'><div className='h-4 w-40 rounded bg-muted' /></td>
                        <td className='px-5 py-4'><div className='h-4 w-28 rounded bg-muted' /></td>
                        <td className='px-5 py-4'><div className='h-4 w-24 rounded bg-muted' /></td>
                        <td className='px-5 py-4'><div className='h-6 w-20 rounded-full bg-muted' /></td>
                        <td className='px-5 py-4'><div className='ml-auto h-8 w-32 rounded bg-muted' /></td>
                      </tr>
                    ))
                  ) : skills.length === 0 ? (
                    <tr><td colSpan={5} className='px-5 py-10 text-center text-sm text-muted-foreground'>{label('Không có kỹ năng.', 'No skills found.')}</td></tr>
                  ) : (
                    skills.map((row) => (
                      <tr key={row.id} className='align-top hover:bg-muted/30'>
                        <td className='px-5 py-4'>
                          <p className='font-bold text-foreground'>{row.title}</p>
                          <p className='text-xs text-muted-foreground'>{row.slug || row.id}</p>
                          <p className='mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground'>{row.description || label('Chưa có mô tả.', 'No description yet.')}</p>
                        </td>
                        <td className='px-5 py-4 text-sm text-muted-foreground'>
                          <p>{localizeSkillValue(row.subtitle, language, SKILL_CATEGORY_VI)}</p>
                          <p className='text-xs'>{row.major || 'IT'} · {label('Độ khó', 'Level')} {row.difficultyLevel ?? 3}</p>
                        </td>
                        <td className='px-5 py-4 text-xs text-muted-foreground'>
                          <p>{label('Lộ trình', 'Roadmap')}: {row.roadmapUsage ?? 0}</p>
                          <p>JD: {row.jdUsage ?? 0}</p>
                          <p>{label('Tài nguyên', 'Resources')}: {row.resourceCount ?? 0}</p>
                        </td>
                        <td className='px-5 py-4'>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClass(row)}`}>
                            {localizeSkillValue(row.status, language, SKILL_STATUS_VI)}
                          </span>
                        </td>
                        <td className='px-5 py-4'>
                          {renderSkillActions(row, 'list')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className='flex items-center justify-between border-t border-border bg-muted/30 px-5 py-4'>
              <p className='text-xs font-semibold text-muted-foreground'>{t('adminCommon.pagination', { page, totalPages, total })}</p>
              <div className='flex gap-2'>
                <button type='button' disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className='rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50'>{label('Trước', 'Previous')}</button>
                <button type='button' disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className='rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50'>{label('Sau', 'Next')}</button>
              </div>
            </div>
          </div>

        </div>

        {formOpen ? (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'>
        <aside className='max-h-[90vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl'>
          <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-lg font-bold text-foreground'>{isViewing ? t('skillsQueue.form.viewTitle') : editing ? t('skillsQueue.form.editTitle') : t('skillsQueue.form.createTitle')}</h2>
                <p className='mt-1 text-sm text-muted-foreground'>{isViewing ? t('skillsQueue.form.viewDesc') : t('skillsQueue.form.editDesc')}</p>
              </div>
              <button type='button' onClick={closeForm} className='rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground' aria-label={t('skillsQueue.cancel')}>
                <span className='material-symbols-outlined text-[20px]'>close</span>
              </button>
            </div>
            <form className='mt-5 space-y-3' onSubmit={(event) => {
              event.preventDefault()
              if (!isViewing) void handleSubmitSkill()
            }}>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('skillsQueue.form.name')}</label>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: current.slug || slugify(event.target.value) }))} placeholder={label('Tên kỹ năng', 'Skill name')} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60' disabled={isViewing} />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('skillsQueue.form.slug')}</label>
                <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder={label('duong-dan-ky-nang', 'skill-slug')} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60' disabled={isViewing} />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('skillsQueue.form.category')}</label>
                  <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder={label('Danh mục kỹ năng', 'Skill category')} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60' disabled={isViewing} />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('skillsQueue.form.major')}</label>
                  <input value={form.major} onChange={(event) => setForm((current) => ({ ...current, major: event.target.value }))} placeholder={label('Ngành học, ví dụ IT', 'Major, e.g. IT')} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60' disabled={isViewing} />
                </div>
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('skillsQueue.form.description')}</label>
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder={label('Mô tả', 'Description')} className='min-h-24 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60' disabled={isViewing} />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('skillsQueue.form.difficultyLevel')}</label>
                <input value={form.difficultyLevel} onChange={(event) => setForm((current) => ({ ...current, difficultyLevel: event.target.value }))} type='number' min='1' max='5' placeholder={label('Độ khó 1-5', 'Difficulty 1-5')} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-60' disabled={isViewing} />
              </div>
              {editing && !isViewing ? (
                <label className='flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground'>
                  <span>{t('skillsQueue.form.active')}</span>
                  <input type='checkbox' checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
                </label>
              ) : null}
              <div className='flex gap-3 pt-2'>
                {!isViewing ? (
                  <button type='submit' disabled={busyId === (editing?.id ?? 'new')} className='flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50'>
                    {editing ? label('Lưu kỹ năng', 'Save skill') : label('Tạo kỹ năng', 'Create skill')}
                  </button>
                ) : null}
                <button type='button' onClick={closeForm} className='rounded-xl border border-border px-4 py-3 text-sm font-bold'>{label('Hủy', 'Cancel')}</button>
              </div>
            </form>
          </section>

          {editing && !isViewing ? (
            <>
              <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
                <h2 className='text-lg font-bold text-foreground'>{label('Kỹ năng tiên quyết', 'Prerequisites')}</h2>
                <p className='mt-1 text-sm text-muted-foreground'>{label('Hệ thống sẽ kiểm tra vòng lặp trước khi lưu quan hệ tiên quyết.', 'Backend checks cycles before saving.')}</p>
                <div className='mt-4 space-y-3'>
                  <input value={skillPickerSearch} onChange={(event) => setSkillPickerSearch(event.target.value)} placeholder={label('Tìm kỹ năng...', 'Search skills...')} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary' />
                  <div className='flex gap-2'>
                  <select value={prereqSkillId} onChange={(event) => setPrereqSkillId(event.target.value)} className='min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm'>
                    <option value=''>{label('Chọn kỹ năng tiên quyết', 'Choose prerequisite skill')}</option>
                    {skillPickerOptions.filter((skill) => skill.id !== editing.id).map((skill) => (
                      <option key={skill.id} value={skill.id}>{skill.title} · {skill.subtitle}</option>
                    ))}
                  </select>
                  <button type='button' disabled={busyId === editing.id} onClick={() => void handleAddPrereq()} className='rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50'>{label('Thêm', 'Add')}</button>
                  </div>
                  {skillPickerLoading ? <p className='text-xs text-muted-foreground'>{t('adminCommon.loading')}</p> : null}
                </div>
                <div className='mt-4 space-y-2'>
                  {(editing.prerequisites ?? []).length === 0 ? (
                    <p className='text-sm text-muted-foreground'>{label('Chưa có kỹ năng tiên quyết trong response hiện tại.', 'No prerequisites in the current response.')}</p>
                  ) : (
                    (editing.prerequisites ?? []).map((item) => (
                      <div key={item.id} className='flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm'>
                        <span>{item.name}</span>
                        <button type='button' onClick={() => void handleRemovePrereq(item.id)} className='text-destructive'>{label('Xóa', 'Delete')}</button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
                <h2 className='text-lg font-bold text-foreground'>{label('Gộp kỹ năng trùng', 'Merge duplicate')}</h2>
                <p className='mt-1 text-sm text-muted-foreground'>{label('Chuyển toàn bộ nơi đang dùng sang kỹ năng đích rồi xóa kỹ năng cũ.', 'Move all usage references to the target skill, then delete the old skill.')}</p>
                <div className='mt-4 space-y-3'>
                  <select value={mergeTargetId} onChange={(event) => setMergeTargetId(event.target.value)} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm'>
                    <option value=''>{label('Chọn kỹ năng đích', 'Choose target skill')}</option>
                    {skillPickerOptions.filter((skill) => skill.id !== editing.id).map((skill) => (
                      <option key={skill.id} value={skill.id}>{skill.title} · {skill.subtitle}</option>
                    ))}
                  </select>
                  <input value={mergeReason} onChange={(event) => setMergeReason(event.target.value)} placeholder={label('Lý do gộp', 'Merge reason')} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm' />
                  <button type='button' disabled={busyId === editing.id} onClick={() => void handleMerge(editing)} className='w-full rounded-xl border border-warning/40 px-4 py-3 text-sm font-bold text-warning disabled:opacity-50'>
                    {label('Gộp kỹ năng này', 'Merge this skill')}
                  </button>
                </div>
              </section>
            </>
          ) : null}
        </aside>
          </div>
        ) : null}

        {confirm ? (
          <div className='fixed inset-0 z-[60] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md' onClick={() => !confirmBusy && setConfirm(null)}>
            <div className={`w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl ${CONFIRM_TONE_CLASS[confirm.tone].ring}`} onClick={(event) => event.stopPropagation()}>
              <div className='flex items-start gap-4'>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${CONFIRM_TONE_CLASS[confirm.tone].icon}`}>
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
