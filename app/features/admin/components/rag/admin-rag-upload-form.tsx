import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  createAdminSkill,
  loadAdminSkillsList,
  uploadAdminRagDocument,
  type AdminSkillRowView,
} from '../../lib/admin-data'

type AdminRagUploadFormProps = {
  open: boolean
  onClose: () => void
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

export function AdminRagUploadForm({ open, onClose }: AdminRagUploadFormProps) {
  const { t, i18n } = useTranslation('admin')
  const isVi = (i18n.language ?? 'vi').startsWith('vi')
  const label = useCallback((vi: string, en: string) => (isVi ? vi : en), [isVi])
  const [file, setFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [title, setTitle] = useState('')
  const [sourceType, setSourceType] = useState('fptu_curriculum')
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [skillOptions, setSkillOptions] = useState<AdminSkillRowView[]>([])
  const [skillLoading, setSkillLoading] = useState(false)
  const [quickSkillName, setQuickSkillName] = useState('')
  const [quickSkillCategory, setQuickSkillCategory] = useState('uncategorized')
  const [quickSkillMajor, setQuickSkillMajor] = useState('IT')
  const [creatingSkill, setCreatingSkill] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    queueMicrotask(() => setSkillLoading(true))
    loadAdminSkillsList({
      search: skillSearch.trim() || undefined,
      page: 1,
      pageSize: 30,
    })
      .then((next) => {
        if (!cancelled) setSkillOptions(next.items)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message || label('Không thể tải danh sách kỹ năng.', 'Failed to load skills.'))
      })
      .finally(() => {
        if (!cancelled) setSkillLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [label, open, skillSearch])

  const selectedSkills = useMemo(
    () => skillOptions.filter((skill) => selectedSkillIds.includes(skill.id)),
    [selectedSkillIds, skillOptions]
  )

  function resetForm() {
    setFile(null)
    setFileInputKey((current) => current + 1)
    setTitle('')
    setSourceType('fptu_curriculum')
    setSelectedSkillIds([])
    setSkillSearch('')
    setQuickSkillName('')
    setQuickSkillCategory('uncategorized')
    setQuickSkillMajor('IT')
    setError(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function toggleSkill(id: string) {
    setSelectedSkillIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ))
  }

  async function createQuickSkill() {
    const name = quickSkillName.trim()
    if (!name) {
      setError(label('Nhập tên kỹ năng cần tạo nhanh.', 'Enter a skill name to quick-create.'))
      return
    }

    try {
      setCreatingSkill(true)
      setError(null)
      await createAdminSkill({
        name,
        slug: slugify(name),
        category: quickSkillCategory.trim() || 'uncategorized',
        major: quickSkillMajor.trim() || 'IT',
        description: null,
        difficultyLevel: 3,
      })
      const next = await loadAdminSkillsList({ search: name, page: 1, pageSize: 30 })
      setSkillOptions(next.items)
      const created = next.items.find((skill) => skill.title.toLowerCase() === name.toLowerCase()) ?? next.items[0]
      if (created) {
        setSelectedSkillIds((current) => (current.includes(created.id) ? current : [...current, created.id]))
      }
      setQuickSkillName('')
    } catch (err) {
      setError((err as Error).message || label('Không thể tạo kỹ năng mới.', 'Failed to create skill.'))
    } finally {
      setCreatingSkill(false)
    }
  }

  async function onSubmit() {
    if (!file) {
      setError(label('Vui lòng chọn file PDF trước khi tải lên.', 'Please choose a PDF file before uploading.'))
      return
    }
    if (!title.trim()) {
      setError(label('Vui lòng nhập tiêu đề tài liệu.', 'Please enter a document title.'))
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await uploadAdminRagDocument({
        file,
        title: title.trim(),
        sourceType,
        relatedSkillIds: selectedSkillIds,
      })
      resetForm()
      onClose()
    } catch (err) {
      setError((err as Error).message || label('Không thể thêm tài liệu RAG.', 'Failed to upload RAG document.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'>
      <section className='max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <span className='material-symbols-outlined rounded-2xl bg-primary/10 p-3 text-primary'>add_circle</span>
            <div>
              <h3 className='text-xl font-bold text-foreground'>{t('rag.form.title')}</h3>
              <p className='mt-1 text-sm text-muted-foreground'>{label('Tải PDF vào kho RAG và gắn với kỹ năng liên quan để AI truy xuất đúng ngữ cảnh.', 'Upload a PDF to the RAG library and map it to related skills for better retrieval.')}</p>
            </div>
          </div>
          <button type='button' onClick={handleClose} className='rounded-full border border-border p-2 text-muted-foreground hover:bg-muted'>
            <span className='material-symbols-outlined'>close</span>
          </button>
        </div>

        {error ? <div className='mt-5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>{error}</div> : null}

        <form className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]' onSubmit={(e) => {
          e.preventDefault()
          void onSubmit()
        }}>
          <div className='space-y-5'>
            <div>
              <label className='mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.form.fileLabel')}</label>
              <input key={fileInputKey} type='file' accept='.pdf,application/pdf' onChange={(e) => setFile(e.target.files?.[0] ?? null)} className='w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground' />
              {file ? <p className='mt-2 text-xs font-semibold text-primary'>{file.name}</p> : null}
            </div>
            <div>
              <label className='mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.form.docTitle')}</label>
              <input className='w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground outline-none focus:border-primary' placeholder={t('rag.form.docTitlePlaceholder')} type='text' value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className='mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.form.sourceType')}</label>
              <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} className='w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground outline-none focus:border-primary'>
                <option value='fptu_curriculum'>{isVi ? 'Chương trình học FPTU' : 'FPTU curriculum'}</option>
                <option value='fptu_syllabus'>{isVi ? 'Đề cương môn học FPTU' : 'FPTU syllabus'}</option>
                <option value='external_doc'>{isVi ? 'Tài liệu bên ngoài' : 'External document'}</option>
              </select>
            </div>

            <section className='rounded-2xl border border-border bg-muted/20 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h4 className='font-bold text-foreground'>{label('Kỹ năng liên quan', 'Related skills')}</h4>
                  <p className='mt-1 text-xs text-muted-foreground'>{label('Chọn kỹ năng hiện có để gắn tài liệu với taxonomy.', 'Pick existing skills to map this document to the taxonomy.')}</p>
                </div>
                <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary'>{selectedSkillIds.length}</span>
              </div>
              <input
                className='mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary'
                placeholder={t('rag.form.skillsPlaceholder')}
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
              <div className='mt-3 max-h-56 space-y-2 overflow-y-auto pr-1'>
                {skillLoading ? (
                  Array.from({ length: 4 }).map((_, index) => <div key={index} className='h-12 animate-pulse rounded-xl bg-muted' />)
                ) : skillOptions.length === 0 ? (
                  <p className='rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground'>{label('Chưa tìm thấy kỹ năng phù hợp.', 'No matching skills found.')}</p>
                ) : (
                  skillOptions.map((skill) => (
                    <label key={skill.id} className='flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 text-sm hover:border-primary/60'>
                      <input type='checkbox' checked={selectedSkillIds.includes(skill.id)} onChange={() => toggleSkill(skill.id)} className='mt-1' />
                      <span className='min-w-0'>
                        <span className='block font-bold text-foreground'>{skill.title}</span>
                        <span className='block truncate text-xs text-muted-foreground'>{skill.subtitle} · {skill.major || 'IT'} · {skill.slug || skill.id}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className='space-y-5'>
            <section className='rounded-2xl border border-border bg-muted/20 p-4'>
              <h4 className='font-bold text-foreground'>{label('Đã chọn', 'Selected')}</h4>
              <div className='mt-3 flex flex-wrap gap-2'>
                {selectedSkills.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>{label('Chưa chọn kỹ năng nào.', 'No skills selected yet.')}</p>
                ) : (
                  selectedSkills.map((skill) => (
                    <button key={skill.id} type='button' onClick={() => toggleSkill(skill.id)} className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20'>
                      {skill.title} ×
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className='rounded-2xl border border-border bg-muted/20 p-4'>
              <h4 className='font-bold text-foreground'>{label('Tạo nhanh kỹ năng', 'Quick-create skill')}</h4>
              <p className='mt-1 text-xs text-muted-foreground'>{label('Dùng khi tài liệu thuộc kỹ năng chưa có trong taxonomy.', 'Use this when the document maps to a skill not yet in the taxonomy.')}</p>
              <div className='mt-4 space-y-3'>
                <input value={quickSkillName} onChange={(e) => setQuickSkillName(e.target.value)} placeholder={label('Tên kỹ năng mới', 'New skill name')} className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary' />
                <div className='grid grid-cols-2 gap-3'>
                  <input value={quickSkillCategory} onChange={(e) => setQuickSkillCategory(e.target.value)} placeholder='category' className='min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary' />
                  <input value={quickSkillMajor} onChange={(e) => setQuickSkillMajor(e.target.value)} placeholder='major' className='min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary' />
                </div>
                <button type='button' disabled={creatingSkill || !quickSkillName.trim()} onClick={() => void createQuickSkill()} className='w-full rounded-xl border border-primary/40 px-4 py-3 text-sm font-bold text-primary disabled:opacity-50'>
                  {creatingSkill ? t('adminCommon.submitting') : label('Tạo và chọn kỹ năng', 'Create and select skill')}
                </button>
              </div>
            </section>

            <div className='flex gap-3'>
              <button className='flex-1 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-4 py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-60' type='submit' disabled={submitting || !file || !title.trim()}>
                {submitting ? t('adminCommon.submitting') : t('rag.form.submit')}
              </button>
              <button type='button' onClick={handleClose} className='rounded-xl border border-border px-4 py-4 font-bold text-foreground hover:bg-muted'>
                {label('Hủy', 'Cancel')}
              </button>
            </div>
          </aside>
        </form>
      </section>
    </div>
  )
}
