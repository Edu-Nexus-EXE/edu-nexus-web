import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

interface LogDetail {
  email: string
  creationDate: string
  recordedAt: string
  errorType: string
  technicalMessage: string
  retryCount: string
  retryPercent: number
  rawSource: string
}

const mockLogsDetail: Record<string, LogDetail> = {
  'JD-9921': {
    email: 'hoang.anh@company.com',
    creationDate: '14/10/2023 09:42',
    recordedAt: '14/10/2023 09:42:15',
    errorType: 'ParsingException',
    technicalMessage: 'Missing mandatory field: job_title',
    retryCount: '03/05',
    retryPercent: 60,
    rawSource: `Software Engineer - required 5 years experience with Java, Spring Boot, AWS. \nResponsibilities include designing scalable microservices and maintaining CI/CD pipelines. \nCandidates should have strong problem-solving skills and experience with relational databases.\nLocation: Remote (Vietnam)\nExpected Salary: Negotiable\n\n[Error: System stopped processing at line 1 due to missing header "Job Title"]`
  }
}

const fallbackDetail: LogDetail = {
  email: 'hoang.anh@company.com',
  creationDate: '14/10/2023 09:42',
  recordedAt: '14/10/2023 09:42:15',
  errorType: 'ParsingException',
  technicalMessage: 'Missing mandatory field: job_title',
  retryCount: '03/05',
  retryPercent: 60,
  rawSource: `Software Engineer - required 5 years experience with Java, Spring Boot, AWS. \nResponsibilities include designing scalable microservices and maintaining CI/CD pipelines. \nCandidates should have strong problem-solving skills and experience with relational databases.\nLocation: Remote (Vietnam)\nExpected Salary: Negotiable\n\n[Error: System stopped processing at line 1 due to missing header "Job Title"]`
}

export function AdminJdLogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('admin')
  const [copied, setCopied] = useState(false)

  const logId = id || 'JD-9921'
  const detail = mockLogsDetail[logId] || {
    ...fallbackDetail,
    logId
  }

  function handleCopy() {
    navigator.clipboard.writeText(detail.rawSource).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className='p-8 max-w-7xl mx-auto w-full space-y-8 flex-1'>
      {/* Breadcrumbs */}
      <nav className='flex text-xs text-muted-foreground gap-2 items-center'>
        <Link to='/admin' className='hover:text-primary transition-colors'>
          {t('jdLogDetail.breadcrumb.admin')}
        </Link>
        <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
        <Link to='/admin/jd-failed' className='hover:text-primary transition-colors'>
          {t('jdLogDetail.breadcrumb.failedLogs')}
        </Link>
        <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
        <span className='text-foreground font-semibold'>{t('jdLogDetail.breadcrumb.detail', { id: logId })}</span>
      </nav>

      {/* Page Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2'>
        <div className='flex items-center gap-4'>
          <Link
            to='/admin/jd-failed'
            className='h-10 w-10 flex items-center justify-center rounded-full hover:bg-card border border-border text-muted-foreground transition-all'
            title={t('jdLogDetail.back')}
            aria-label={t('jdLogDetail.back')}
          >
            <span className='material-symbols-outlined'>arrow_back</span>
          </Link>
          <div className='flex flex-col'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='text-3xl font-bold text-foreground leading-tight'>
                {t('jdLogs.title')} #{logId}
              </h2>
              <span className='px-3 py-1 bg-destructive/10 text-destructive text-[11px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border border-destructive/20'>
                <span className='material-symbols-outlined text-[14px]' style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                {t('jdLogDetail.status.failed')}
              </span>
            </div>
            <p className='text-muted-foreground text-sm mt-1'>
              {t('jdLogDetail.recordedAt', { time: detail.recordedAt })}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4'>
        {/* Left Card: User Info */}
        <div className='bg-card p-8 rounded-xl border border-border shadow-sm relative overflow-hidden group'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110' />

          <div className='flex items-center gap-4 mb-6 relative z-10'>
            <div className='p-3 bg-primary/10 rounded-lg text-primary'>
              <span className='material-symbols-outlined'>person</span>
            </div>
            <h3 className='font-bold text-lg text-foreground'>{t('jdLogDetail.userInfo.title')}</h3>
          </div>

          <div className='space-y-4 relative z-10'>
            <div className='flex justify-between items-center border-b border-border py-2'>
              <span className='text-muted-foreground font-medium'>{t('jdLogDetail.userInfo.email')}</span>
              <span className='text-foreground font-bold'>{detail.email}</span>
            </div>
            <div className='flex justify-between items-center border-b border-border py-2'>
              <span className='text-muted-foreground font-medium'>{t('jdLogDetail.userInfo.logId')}</span>
              <span className='font-mono text-primary font-bold'>{logId}</span>
            </div>
            <div className='flex justify-between items-center py-2'>
              <span className='text-muted-foreground font-medium'>{t('jdLogDetail.userInfo.creationDate')}</span>
              <span className='text-foreground'>{detail.creationDate}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Diagnosis */}
        <div className='bg-card p-8 rounded-xl border border-border shadow-sm relative overflow-hidden group'>
          <div className='absolute bottom-0 right-0 w-40 h-40 bg-destructive/5 rounded-full -mr-20 -mb-20 transition-transform group-hover:scale-110' />

          <div className='flex items-center gap-4 mb-6 relative z-10'>
            <div className='p-3 bg-destructive/10 rounded-lg text-destructive'>
              <span className='material-symbols-outlined'>terminal</span>
            </div>
            <h3 className='font-bold text-lg text-foreground'>{t('jdLogDetail.diagnosis.title')}</h3>
          </div>

          <div className='space-y-4 relative z-10'>
            <div className='flex justify-between items-center border-b border-border py-2'>
              <span className='text-muted-foreground font-medium'>{t('jdLogDetail.diagnosis.errorType')}</span>
              <span className='px-2 py-0.5 bg-destructive/10 text-destructive font-mono text-xs font-bold rounded border border-destructive/20'>
                {detail.errorType}
              </span>
            </div>
            <div className='flex flex-col gap-1 border-b border-border py-2'>
              <span className='text-muted-foreground font-medium'>{t('jdLogDetail.diagnosis.technicalMessage')}</span>
              <span className='text-destructive italic text-sm font-medium'>{detail.technicalMessage}</span>
            </div>
            <div className='flex justify-between items-center py-2'>
              <span className='text-muted-foreground font-medium'>{t('jdLogDetail.diagnosis.retryCount')}</span>
              <div className='flex items-center gap-2'>
                <div className='w-24 bg-muted h-1.5 rounded-full overflow-hidden border border-border'>
                  <div className='bg-primary h-full' style={{ width: `${detail.retryPercent}%` }} />
                </div>
                <span className='font-bold text-foreground'>{detail.retryCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Content: Input Data */}
      <div className='bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col'>
        <div className='p-6 border-b border-border flex justify-between items-center bg-card'>
          <div className='flex items-center gap-3'>
            <span className='material-symbols-outlined text-primary'>description</span>
            <h3 className='font-bold text-lg text-foreground'>{t('jdLogDetail.rawSource.title')}</h3>
          </div>
          <button
            onClick={handleCopy}
            aria-label={copied ? t('jdLogDetail.rawSource.copied') : t('jdLogDetail.rawSource.copy')}
            className='text-primary font-bold text-sm flex items-center gap-1 hover:underline transition-all active:scale-95'
          >
            <span className='material-symbols-outlined text-sm'>{copied ? 'check' : 'content_copy'}</span>
            {copied ? t('jdLogDetail.rawSource.copied') : t('jdLogDetail.rawSource.copy')}
          </button>
        </div>
        <div className='p-8 bg-card'>
          <div className='bg-muted p-6 rounded-lg font-mono text-sm text-muted-foreground leading-relaxed min-h-[200px] border border-border whitespace-pre-wrap'>
            {detail.rawSource}
          </div>
        </div>
      </div>

      {/* Floating Footer Actions */}
      <div className='pb-12 flex flex-col md:flex-row items-center gap-4'>
        <button
          aria-label={t('jdLogDetail.actions.retry')}
          className='w-full md:w-auto px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer'
        >
          <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
            refresh
          </span>
          {t('jdLogDetail.actions.retry')}
        </button>
        <button
          aria-label={t('jdLogDetail.actions.edit')}
          className='w-full md:w-auto px-8 py-3.5 border border-primary text-primary rounded-xl font-bold hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer'
        >
          <span className='material-symbols-outlined'>edit_note</span>
          {t('jdLogDetail.actions.edit')}
        </button>
        <div className='flex-1' />
        <button
          aria-label={t('jdLogDetail.actions.delete')}
          className='w-full md:w-auto px-6 py-3.5 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive/10 rounded-xl transition-all cursor-pointer'
        >
          <span className='material-symbols-outlined'>delete</span>
          {t('jdLogDetail.actions.delete')}
        </button>
      </div>
    </div>
  )
}
