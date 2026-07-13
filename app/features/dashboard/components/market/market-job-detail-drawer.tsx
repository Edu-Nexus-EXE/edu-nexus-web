import type { MarketJobDetailView } from '../../lib/market-intelligence'

type CopyState = 'idle' | 'copied' | 'failed'

type Labels = {
  close: string
  copied: string
  copy: string
  copyFallback: string
  analyze: string
  source: string
  skills: string
  originalContent: string
  openSource: string
  sourceUnavailable: string
}

type Props = {
  open: boolean
  loading: boolean
  error: string
  job: MarketJobDetailView | null
  copyState: CopyState
  labels: Labels
  onClose: () => void
  onCopy: (value: string) => void
  onAnalyze: (job: MarketJobDetailView) => void
}

function getDisplayContent(job: MarketJobDetailView) {
  return (job.originalContent || job.rawContent || '').trim()
}

function splitContentBlocks(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
}

function isLikelyHeading(block: string) {
  const normalized = block.trim()
  return normalized.length <= 72 && !/[.!?]$/.test(normalized) && normalized.split(/\s+/).length <= 9
}

function JobContent({ content }: { content: string }) {
  const blocks = splitContentBlocks(content)
  if (blocks.length === 0) {
    return <p className='text-sm text-muted-foreground'>-</p>
  }

  return (
    <div className='space-y-4 text-[15px] leading-7 text-foreground'>
      {blocks.map((block, index) => {
        const lines = block
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
        if (lines.length > 1) {
          return (
            <div key={`${index}-${lines[0]}`} className='space-y-2'>
              {lines.map((line, lineIndex) =>
                lineIndex === 0 && isLikelyHeading(line) ? (
                  <h3 key={line} className='text-base font-black text-foreground'>
                    {line}
                  </h3>
                ) : (
                  <p key={`${line}-${lineIndex}`} className='break-words'>
                    {line}
                  </p>
                )
              )}
            </div>
          )
        }

        return isLikelyHeading(block) ? (
          <h3 key={`${index}-${block}`} className='text-base font-black text-foreground'>
            {block}
          </h3>
        ) : (
          <p key={`${index}-${block}`} className='break-words'>
            {block}
          </p>
        )
      })}
    </div>
  )
}

export function MarketJobDetailDrawer({
  open,
  loading,
  error,
  job,
  copyState,
  labels,
  onClose,
  onCopy,
  onAnalyze
}: Props) {
  if (!open) return null

  const content = job ? getDisplayContent(job) : ''
  const sourceUrl = job?.sourceUrl?.trim()

  return (
    <div className='fixed inset-0 z-50 flex justify-end bg-foreground/40' role='dialog' aria-modal='true'>
      <button
        type='button'
        onClick={onClose}
        className='flex-1 cursor-default'
        aria-label={labels.close}
        tabIndex={-1}
      />
      <aside className='flex h-full w-full max-w-3xl flex-col overflow-hidden bg-card shadow-2xl'>
        <header className='shrink-0 border-b border-border p-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0'>
              <p className='text-xs font-bold uppercase tracking-widest text-primary'>{labels.source}</p>
              {loading ? (
                <div className='mt-3 h-7 w-2/3 animate-pulse rounded bg-muted' />
              ) : (
                <h2 className='mt-1 break-words text-2xl font-black leading-tight text-foreground'>
                  {job?.jobTitle ?? '-'}
                </h2>
              )}
              {job ? (
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  {[job.companyName, job.location, job.salaryText].filter(Boolean).join(' - ') || job.sourceSite}
                </p>
              ) : null}
            </div>
            <button
              type='button'
              onClick={onClose}
              className='rounded-xl border border-border p-3 text-muted-foreground hover:text-foreground'
              aria-label={labels.close}
            >
              <span className='material-symbols-outlined text-base'>close</span>
            </button>
          </div>
          {job ? (
            <div className='mt-4 flex flex-wrap items-center gap-2'>
              <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary'>
                {job.sourceSite}
              </span>
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground hover:bg-muted/40'
                >
                  <span className='material-symbols-outlined text-sm'>open_in_new</span>
                  {labels.openSource}
                </a>
              ) : (
                <span className='rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground'>
                  {labels.sourceUnavailable}
                </span>
              )}
            </div>
          ) : null}
        </header>

        <div className='flex-1 overflow-y-auto px-6 py-5'>
          {error ? (
            <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
              {error}
            </div>
          ) : loading ? (
            <div className='space-y-3'>
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className='h-4 animate-pulse rounded bg-muted' />
              ))}
            </div>
          ) : job ? (
            <div className='space-y-6'>
              <section className='rounded-2xl border border-border bg-background p-5'>
                <p className='mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                  {labels.originalContent}
                </p>
                <JobContent content={content} />
              </section>

              <section>
                <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>{labels.skills}</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {job.skills.length > 0 ? (
                    job.skills.map((skill) => (
                      <span key={skill} className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary'>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className='text-sm text-muted-foreground'>-</span>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className='rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground'>
              {labels.copyFallback}
            </div>
          )}
        </div>

        <footer className='shrink-0 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-card p-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-muted/40'
          >
            {labels.close}
          </button>
          <button
            type='button'
            onClick={() => job && onCopy(content)}
            disabled={!job || !content}
            className='inline-flex items-center gap-2 rounded-xl border border-primary/30 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 disabled:opacity-40'
          >
            <span className='material-symbols-outlined text-base'>content_copy</span>
            {copyState === 'copied' ? labels.copied : labels.copy}
          </button>
          {copyState === 'failed' ? <span className='text-xs text-destructive'>{labels.copyFallback}</span> : null}
          <button
            type='button'
            onClick={() => job && onAnalyze(job)}
            disabled={!job || !content}
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40'
          >
            <span className='material-symbols-outlined text-base'>auto_awesome</span>
            {labels.analyze}
          </button>
        </footer>
      </aside>
    </div>
  )
}
