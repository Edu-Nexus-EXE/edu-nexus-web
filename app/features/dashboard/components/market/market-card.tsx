import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import { DASHBOARD_TONE_STYLES, type DashboardTone } from '../../lib/dashboard-tone'

export type ScholarshipCardProps = {
  id: string
  title: string
  university: string
  location: string
  logo: React.ReactNode
  endsIn: string
  matchPercent: number
  matchTone: DashboardTone
  strengths: string[]
  missing: string[]
  aiSuggestion?: React.ReactNode
}

export function MarketCard({
  title,
  university,
  location,
  logo,
  endsIn,
  matchPercent,
  matchTone,
  strengths,
  missing,
  aiSuggestion
}: ScholarshipCardProps) {
  const { t } = useTranslation('dashboard')
  const [remindMe, setRemindMe] = useState(false)
  const isUrgent = endsIn.includes('Days') || endsIn.includes('Ngày')

  return (
    <article className='bg-card rounded-xl p-8 border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden'>
      <div className='absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none' />

      {/* Header */}
      <div className='flex justify-between items-start mb-8'>
        <div className='flex gap-4'>
          <div className='w-14 h-14 bg-card rounded-xl p-2.5 flex items-center justify-center border border-border shadow-sm'>
            {logo}
          </div>
          <div>
            <h3 className='text-xl font-bold text-foreground leading-tight mb-1.5'>{title}</h3>
            <p className='text-sm font-medium text-muted-foreground flex items-center gap-1'>
              <span className='material-symbols-outlined text-sm text-primary'>location_on</span>
              {university}, {location}
            </p>
          </div>
        </div>
        <div className='flex flex-col items-end gap-3'>
          <button type='button' className='text-muted-foreground hover:text-primary transition-colors'>
            <span className='material-symbols-outlined'>bookmark_border</span>
          </button>
          <div className='flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full'>
            <span className={cn('material-symbols-outlined text-xs text-primary', isUrgent && 'animate-pulse')}>
              timer
            </span>
            <span className='text-[10px] font-bold text-primary uppercase tracking-wider'>{endsIn}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className='flex flex-col sm:flex-row gap-8 mb-8'>
        {/* Match Circle */}
        <div className='flex-shrink-0 w-full sm:w-32 flex flex-col items-center justify-center bg-muted/30 rounded-xl p-4 border border-border'>
          <div className='relative w-24 h-24'>
            <svg className={cn('circular-chart', DASHBOARD_TONE_STYLES[matchTone].text)} viewBox='0 0 36 36'>
              <path
                className='circle-bg'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                opacity='0.1'
              />
              <path
                className='circle stroke-current'
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                strokeDasharray={`${matchPercent}, 100`}
                fill='none'
                strokeWidth='2.5'
                strokeLinecap='round'
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <span className='text-2xl font-black text-foreground'>{matchPercent}%</span>
              <span className='text-[8px] font-bold text-muted-foreground uppercase tracking-widest'>
                {t('market.card.match')}
              </span>
            </div>
          </div>
        </div>

        {/* Strengths & Missing */}
        <div className='flex-1 grid grid-cols-2 gap-6'>
          <div>
            <p className='text-[10px] font-bold text-success uppercase tracking-widest mb-3 flex items-center gap-1'>
              <span className='material-symbols-outlined text-sm'>check_circle</span> {t('market.card.strengths')}
            </p>
            <ul className='space-y-2.5'>
              {strengths.map((str, i) => (
                <li key={i} className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                  <div className='w-1.5 h-1.5 rounded-full bg-success' /> {str}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className='text-[10px] font-bold text-warning uppercase tracking-widest mb-3 flex items-center gap-1'>
              <span className='material-symbols-outlined text-sm'>warning</span> {t('market.card.missing')}
            </p>
            <ul className='space-y-2.5'>
              {missing.map((mis, i) => (
                <li key={i} className='flex items-center gap-2 text-sm font-medium text-muted-foreground opacity-70'>
                  <div className='w-1.5 h-1.5 rounded-full bg-warning' /> {mis}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className='bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3 mb-8'>
          <span className='material-symbols-outlined text-primary text-xl mt-0.5'>auto_awesome</span>
          <div>
            <p className='text-sm text-foreground leading-relaxed'>
              <span className='font-bold text-primary'>{t('market.card.aiSuggestion')} </span>
              {aiSuggestion}
            </p>
          </div>
        </div>
      )}

      {/* Reminder Toggle */}
      <div className='flex justify-end items-center mb-6 border-t border-border pt-4'>
        <label className='flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer group/reminder text-muted-foreground hover:text-primary transition-colors'>
          <span
            className={cn(
              'material-symbols-outlined text-lg',
              remindMe ? 'text-primary animate-pulse' : 'group-hover/reminder:animate-bounce'
            )}
          >
            {remindMe ? 'notifications_active' : 'notifications_none'}
          </span>
          <span className={remindMe ? 'text-primary' : ''}>
            {remindMe ? t('market.card.remindOn') : t('market.card.remind')}
          </span>
          <div className='relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in'>
            <input
              type='checkbox'
              checked={remindMe}
              onChange={() => setRemindMe(!remindMe)}
              className='peer absolute block w-4 h-4 rounded-full bg-card border-4 border-muted appearance-none cursor-pointer checked:right-0 checked:border-primary transition-all duration-300'
            />
            <div className='block overflow-hidden h-4 rounded-full bg-muted cursor-pointer peer-checked:bg-primary transition-colors duration-300' />
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className='flex gap-4'>
        <button
          type='button'
          className={cn(
            'flex-1 py-3.5 px-6 rounded-xl font-bold transition-all flex justify-center items-center gap-2 group-hover:translate-y-[-2px]',
            'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30'
          )}
        >
          {t('market.card.apply')}
          <span className='material-symbols-outlined text-sm'>arrow_forward</span>
        </button>
        <button
          type='button'
          className='px-6 py-3.5 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-colors'
        >
          {t('market.card.details')}
        </button>
      </div>
    </article>
  )
}
