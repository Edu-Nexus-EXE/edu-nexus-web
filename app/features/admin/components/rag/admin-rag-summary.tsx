import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ADMIN_RAG_UPDATED_EVENT, loadAdminRagDocumentsList, type AdminRagDocumentView } from '../../lib/admin-data'

export function AdminRagSummary() {
  const { t } = useTranslation('admin')
  const [rows, setRows] = useState<AdminRagDocumentView[]>([])

  async function refresh() {
    const next = await loadAdminRagDocumentsList()
    setRows(next)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

    function handleUpdated() {
      void refresh()
    }

    window.addEventListener(ADMIN_RAG_UPDATED_EVENT, handleUpdated)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(ADMIN_RAG_UPDATED_EVENT, handleUpdated)
    }
  }, [])

  const totalDocs = rows.length
  const totalChunks = useMemo(() => rows.reduce((sum, row) => sum + row.chunks, 0), [rows])

  return (
    <div className='bg-primary p-6 rounded-xl shadow-sm relative overflow-hidden'>
      <div className='relative z-10'>
        <h4 className='text-primary-foreground font-bold mb-4'>{t('rag.summary.title')}</h4>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white/20 backdrop-blur-md p-4 rounded-lg'>
            <p className='text-xs text-primary-foreground/80 uppercase font-bold'>{t('rag.summary.totalDocs')}</p>
            <p className='text-2xl font-black text-primary-foreground'>{totalDocs}</p>
          </div>
          <div className='bg-white/20 backdrop-blur-md p-4 rounded-lg'>
            <p className='text-xs text-primary-foreground/80 uppercase font-bold'>{t('rag.summary.totalChunks')}</p>
            <p className='text-2xl font-black text-primary-foreground'>{totalChunks}</p>
          </div>
        </div>
      </div>
      <span className='material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/10 select-none pointer-events-none'>
        data_object
      </span>
    </div>
  )
}
