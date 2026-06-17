import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'

const GUIDE_URL =
  'https://drive.google.com/file/d/1RVSprFMQKCabsY9X9V4auzSB02we9XUF/view'

export function LandingHero() {
  const { t } = useTranslation('landing')
  const navigate = useNavigate()

  const handleStart = () => {
    if (getAuthSession()) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleGuide = () => {
    window.open(GUIDE_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className='relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden'>
      {/* Background Grid Effect */}
      <div
        className='absolute inset-0 z-0 opacity-40 pointer-events-none'
        style={{
          backgroundSize: '40px 40px',
          backgroundImage:
            'linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)'
        }}
      />

      {/* Glow Effect behind mockup */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none z-0 bg-primary/15' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Hero Text Content */}
        <div className='text-center max-w-4xl mx-auto mb-16'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75' />
              <span className='relative inline-flex rounded-full h-2 w-2 bg-primary' />
            </span>
            {t('hero.badge')}
          </div>

          {/* Heading */}
          <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight'>
            {t('hero.titleStart')}{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70'>
              {t('hero.titleHighlight')}
            </span>
            .
          </h1>

          <p className='text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed'>
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row justify-center gap-4'>
            <button
              type='button'
              onClick={handleStart}
              className={cn(
                'group bg-primary hover:opacity-90 text-primary-foreground',
                'px-8 py-4 rounded-lg text-base font-semibold transition-all',
                'shadow-xl shadow-primary/25 flex items-center justify-center gap-2'
              )}
            >
              {t('hero.ctaPrimary')}
              <span className='material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg'>
                arrow_forward
              </span>
            </button>
            <button
              type='button'
              onClick={handleGuide}
              className='px-8 py-4 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2'
            >
              <span className='material-symbols-outlined text-lg'>play_circle</span>
              {t('hero.ctaSecondary')}
            </button>
          </div>
        </div>

        {/* Interface Mockup Visualization */}
        <HeroMockup />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Mockup — tách riêng để giữ LandingHero gọn                       */
/* ------------------------------------------------------------------ */

function HeroMockup() {
  const { t } = useTranslation('landing')

  return (
    <div
      className='relative max-w-5xl mx-auto mt-8 shadow-2xl rounded-xl transition-transform duration-500 hover:scale-[1.01]'
      style={{ perspective: '1000px' }}
    >
      <div className='bg-card rounded-xl border border-border overflow-hidden shadow-2xl relative'>
        {/* Fake Window Controls */}
        <div className='h-10 border-b border-border/30 bg-muted/30 flex items-center px-4 gap-2'>
          <div className='w-3 h-3 rounded-full bg-destructive/20 border border-destructive/50' />
          <div className='w-3 h-3 rounded-full bg-accent/40 border border-accent/60' />
          <div className='w-3 h-3 rounded-full bg-primary/20 border border-primary/50' />
        </div>

        {/* Mockup Content Area */}
        <div className='p-6 md:p-8 grid grid-cols-12 gap-6 bg-card'>
          {/* Sidebar */}
          <div className='col-span-3 hidden md:block space-y-4'>
            <div className='h-2 w-24 bg-foreground/10 rounded mb-6' />
            <div className='space-y-2'>
              <div className='flex items-center gap-3 p-2 bg-primary/10 rounded-lg border border-primary/20 text-primary'>
                <div className='w-4 h-4 rounded-sm bg-primary' />
                <div className='h-2 w-16 bg-primary/40 rounded' />
              </div>
              <div className='flex items-center gap-3 p-2 text-muted-foreground'>
                <div className='w-4 h-4 rounded-sm border border-border' />
                <div className='h-2 w-20 bg-muted rounded' />
              </div>
              <div className='flex items-center gap-3 p-2 text-muted-foreground'>
                <div className='w-4 h-4 rounded-sm border border-border' />
                <div className='h-2 w-14 bg-muted rounded' />
              </div>
            </div>

            {/* Progress indicator */}
            <div className='mt-8 p-4 bg-muted/50 rounded-lg border border-border'>
              <div className='flex justify-between items-end mb-2'>
                <div className='h-2 w-8 bg-muted-foreground/30 rounded' />
                <div className='text-xs text-primary font-mono'>+12%</div>
              </div>
              <div className='h-1 w-full bg-muted rounded overflow-hidden'>
                <div className='h-full w-3/4 bg-primary' />
              </div>
            </div>
          </div>

          {/* Main Visualization */}
          <div className='col-span-12 md:col-span-9'>
            <div className='flex justify-between items-center mb-6'>
              <div>
                <div className='h-2 w-32 bg-muted-foreground/30 rounded mb-2' />
                <div className='h-5 w-64 bg-foreground/10 rounded' />
              </div>
              <div className='flex gap-2'>
                <div className='h-8 w-8 rounded-lg bg-muted/50 border border-border' />
                <div className='h-8 w-8 rounded-lg bg-muted/50 border border-border' />
              </div>
            </div>

            {/* Graph Area */}
            <div className='relative h-64 w-full bg-muted/30 rounded-lg border border-border p-4 overflow-hidden'>
              <svg className='w-full h-full' viewBox='0 0 800 300' preserveAspectRatio='none'>
                <defs>
                  <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='0%'>
                    <stop offset='0%' style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.1 }} />
                    <stop offset='50%' style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.5 }} />
                    <stop offset='100%' style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.1 }} />
                  </linearGradient>
                </defs>
                <path
                  d='M0,250 C150,250 200,100 400,150 S650,50 800,100'
                  fill='none'
                  stroke='url(#grad1)'
                  strokeWidth='2'
                />
                <path
                  d='M0,280 C180,280 230,150 400,200 S600,100 800,150'
                  fill='none'
                  stroke='currentColor'
                  strokeOpacity='0.1'
                  strokeDasharray='5,5'
                  strokeWidth='1'
                />
                <circle cx='400' cy='150' r='4' fill='var(--color-primary)' className='animate-pulse' />
                <circle cx='400' cy='150' r='12' fill='none' stroke='var(--color-primary)' strokeOpacity='0.3' />
              </svg>

              {/* Tooltip Overlay */}
              <div className='absolute top-1/3 left-1/2 -translate-x-1/2 bg-card border border-primary/40 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm'>
                <div className='text-xs text-muted-foreground mb-1'>{t('hero.mockupTooltipLabel')}</div>
                <div className='text-sm font-bold text-foreground flex items-center gap-1'>
                  {t('hero.mockupTooltipValue')}
                  <span className='text-primary material-symbols-outlined text-sm'>verified</span>
                </div>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className='grid grid-cols-3 gap-4 mt-6'>
              {(['psychology', 'trending_up', 'school'] as const).map((icon) => (
                <div key={icon} className='h-24 bg-muted/30 rounded-lg border border-border p-3'>
                  <div className='w-8 h-8 rounded-lg bg-primary/20 mb-2 flex items-center justify-center'>
                    <span className='material-symbols-outlined text-primary text-sm'>{icon}</span>
                  </div>
                  <div className='h-1.5 w-12 bg-muted-foreground/30 rounded mb-1' />
                  <div className='h-1.5 w-20 bg-muted rounded' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
