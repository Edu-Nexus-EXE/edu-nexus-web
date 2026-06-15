import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { uploadAdminRagDocument } from '../../lib/admin-data'

export function AdminRagUploadForm() {
  const { t } = useTranslation('admin')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [sourceType, setSourceType] = useState('textbook')
  const [skills, setSkills] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const skillIds = useMemo(
    () => skills.split(',').map((item) => item.trim()).filter(Boolean),
    [skills]
  )

  async function onSubmit() {
    if (!file || !title.trim()) return
    setSubmitting(true)
    try {
      await uploadAdminRagDocument({
        file,
        title: title.trim(),
        sourceType,
        relatedSkillIds: skillIds,
      })
      setFile(null)
      setTitle('')
      setSourceType('textbook')
      setSkills('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='bg-card p-6 rounded-xl shadow-sm'>
      <div className='flex items-center gap-2 mb-6'>
        <span className='material-symbols-outlined text-primary'>add_circle</span>
        <h3 className='font-bold text-lg text-foreground'>{t('rag.form.title')}</h3>
      </div>
      <form className='space-y-5' onSubmit={(e) => {
        e.preventDefault()
        void onSubmit()
      }}>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>{t('rag.form.fileLabel')}</label>
          <input type='file' accept='.pdf,.txt' onChange={(e) => setFile(e.target.files?.[0] ?? null)} className='w-full px-4 py-3 bg-muted rounded-lg border-none text-foreground' />
        </div>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>{t('rag.form.docTitle')}</label>
          <input className='w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-foreground' placeholder={t('rag.form.docTitlePlaceholder')} type='text' value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>{t('rag.form.sourceType')}</label>
          <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} className='w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-foreground appearance-none'>
            <option value='textbook'>{t('rag.form.sourceTypes.textbook')}</option>
            <option value='research'>{t('rag.form.sourceTypes.research')}</option>
            <option value='slide'>{t('rag.form.sourceTypes.slide')}</option>
            <option value='other'>{t('rag.form.sourceTypes.other')}</option>
          </select>
        </div>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>{t('rag.form.skills')}</label>
          <input className='w-full px-4 py-3 bg-muted rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-foreground' placeholder={t('rag.form.skillsPlaceholder')} type='text' value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
        <button className='w-full py-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-60' type='submit' disabled={submitting || !file || !title.trim()}>
          {submitting ? t('adminCommon.submitting') : t('rag.form.submit')}
        </button>
      </form>
    </div>
  )
}
