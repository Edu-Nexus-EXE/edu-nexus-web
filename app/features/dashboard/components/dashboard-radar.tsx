import { useTranslation } from 'react-i18next'

export function DashboardRadar() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='xl:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>{t('radar.title')}</h2>
          <p className='text-sm text-muted-foreground'>{t('radar.subtitle')}</p>
        </div>
        <button type='button' className='text-primary text-sm font-medium hover:underline'>
          {t('radar.detail')}
        </button>
      </div>

      <div className='flex-1 flex items-center justify-center relative min-h-[350px]'>
        <svg className='w-full max-w-md h-auto overflow-visible' viewBox='0 0 400 400'>
          {/* Grid circles */}
          {[160, 120, 80, 40].map((r) => (
            <circle key={r} cx='200' cy='200' r={r} fill='none' className='stroke-primary/20' strokeWidth='1' />
          ))}
          {/* Axis lines */}
          <line x1='200' y1='200' x2='200' y2='40' className='stroke-foreground/10' strokeWidth='1' />
          <line x1='200' y1='200' x2='352' y2='150' className='stroke-foreground/10' strokeWidth='1' />
          <line x1='200' y1='200' x2='294' y2='329' className='stroke-foreground/10' strokeWidth='1' />
          <line x1='200' y1='200' x2='106' y2='329' className='stroke-foreground/10' strokeWidth='1' />
          <line x1='200' y1='200' x2='48' y2='150' className='stroke-foreground/10' strokeWidth='1' />
          {/* Data polygon */}
          <polygon
            points='200,60 320,160 260,300 130,290 80,170'
            className='fill-primary/30 stroke-primary'
            strokeWidth='2'
          />
          {/* Labels */}
          <text x='200' y='30' textAnchor='middle' className='text-[12px] font-medium fill-muted-foreground'>
            {t('radar.technical')}
          </text>
          <text x='365' y='150' textAnchor='start' className='text-[12px] font-medium fill-muted-foreground'>
            {t('radar.language')}
          </text>
          <text x='310' y='350' textAnchor='middle' className='text-[12px] font-medium fill-muted-foreground'>
            {t('radar.leadership')}
          </text>
          <text x='90' y='350' textAnchor='middle' className='text-[12px] font-medium fill-muted-foreground'>
            {t('radar.creativity')}
          </text>
          <text x='35' y='150' textAnchor='end' className='text-[12px] font-medium fill-muted-foreground'>
            {t('radar.softSkills')}
          </text>
        </svg>
      </div>
    </div>
  )
}
