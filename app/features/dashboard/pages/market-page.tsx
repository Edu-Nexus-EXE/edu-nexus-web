import { useTranslation } from 'react-i18next'

import { MarketCard, type ScholarshipCardProps } from '../components/market/market-card'
import { MarketSidebar } from '../components/market/market-sidebar'

function buildScholarships(t: ReturnType<typeof useTranslation>['t']): ScholarshipCardProps[] {
  return [
    {
      id: '1',
      title: t('market.items.aiMaster.title'),
      university: 'VinUniversity',
      location: t('market.items.aiMaster.location'),
      logo: (
        <img
          src='https://lh3.googleusercontent.com/aida-public/AB6AXuDn2rNR99g1crRz_lmCV8MU3ex_6r231IvDzmAaM8KhK85eqsx_wXTIe3-CLIQRV7y0iqfVHbjes0YZLE-2HF_QuFJBtxCjgR4KB-k5o2P6MgoxzXD2ho3MRmImKnp7VU0xLo8qlPLnk750xyGYCIE_gmF4E3J1mKGf2ySejZXyJMY1MELPcxhwuZbyhny_uwqg-YelMMslf61aXMdnkiP9Vj30bVJj3Rc61WSIgDTHQ734OAlhjlNVevrdmRBKLgPAy3j8hPnuAF9R'
          alt='VinUni'
          className='w-full h-full object-contain'
        />
      ),
      endsIn: t('market.items.aiMaster.endsIn'),
      matchPercent: 85,
      matchTone: 'primary',
      strengths: [
        t('market.items.aiMaster.strength1'),
        t('market.items.aiMaster.strength2'),
        t('market.items.aiMaster.strength3'),
      ],
      missing: [t('market.items.aiMaster.missing1'), t('market.items.aiMaster.missing2')],
      aiSuggestion: (
        <>
          {t('market.items.aiMaster.suggestionBefore')}{' '}
          <span className='underline decoration-dotted decoration-primary/50 cursor-help font-medium'>
            {t('market.items.aiMaster.suggestionLink')}
          </span>{' '}
          {t('market.items.aiMaster.suggestionAfter')}
        </>
      ),
    },
    {
      id: '2',
      title: t('market.items.womenTech.title'),
      university: 'RMIT University',
      location: t('market.items.womenTech.location'),
      logo: (
        <img
          src='https://lh3.googleusercontent.com/aida-public/AB6AXuCST5frgZsZ1Lfw_aJvS1UFt0I27T3_Y_aMpPxH4wLGgYpelaKfW7wSljumfhdxEhjxMDWJpwR1Rvi0ET4m8fTxPBsPA_OHgA6nmCc6TDMfbjNzTs9vWXKZgLQEPlQ3mAeZrxKODsKGEwTGfFUav_a2ZPe1FwdxvlQ2Btn9ELwGL8BF30RBH9k7GRf7iCs9pWBrb1abc7VqHAGKaMk95P__suUeGZsA7SwNGIPd18heyTkHR0WJk0PCmIHmpEN2VZdgx26IcwfMHe2g'
          alt='RMIT'
          className='w-full h-full object-contain'
        />
      ),
      endsIn: t('market.items.womenTech.endsIn'),
      matchPercent: 65,
      matchTone: 'warning',
      strengths: [t('market.items.womenTech.strength1'), t('market.items.womenTech.strength2')],
      missing: [
        t('market.items.womenTech.missing1'),
        t('market.items.womenTech.missing2'),
        t('market.items.womenTech.missing3'),
      ],
      aiSuggestion: <>{t('market.items.womenTech.suggestion')}</>,
    },
    {
      id: '3',
      title: t('market.items.dataScience.title'),
      university: 'Harvard Extension',
      location: t('market.items.dataScience.location'),
      logo: (
        <div className='w-9 h-9 rounded bg-destructive flex items-center justify-center text-destructive-foreground font-serif font-bold text-xs'>
          H
        </div>
      ),
      endsIn: t('market.items.dataScience.endsIn'),
      matchPercent: 92,
      matchTone: 'success',
      strengths: [
        t('market.items.dataScience.strength1'),
        t('market.items.dataScience.strength2'),
        t('market.items.dataScience.strength3'),
      ],
      missing: [t('market.items.dataScience.missing1')],
      aiSuggestion: <>{t('market.items.dataScience.suggestion')}</>,
    },
  ]
}

export function MarketPage() {
  const { t } = useTranslation('dashboard')
  const scholarships = buildScholarships(t)

  return (
    <div className='flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 gap-10'>
      <MarketSidebar />

      <main className='flex-1 min-w-0'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
          <h2 className='text-3xl font-bold text-foreground tracking-tight'>{t('market.title')}</h2>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground font-medium'>{t('market.sortBy')}</span>
            <select className='bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 cursor-pointer p-0'>
              <option>{t('market.sortOptions.highestMatch')}</option>
              <option>{t('market.sortOptions.deadline')}</option>
              <option>{t('market.sortOptions.value')}</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
          {scholarships.map((scholarship) => (
            <MarketCard key={scholarship.id} {...scholarship} />
          ))}
        </div>

        <div className='flex items-center justify-center gap-3 mt-16'>
          <button
            type='button'
            aria-label={t('market.pagination.previous')}
            className='p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors'
          >
            <span className='material-symbols-outlined'>chevron_left</span>
          </button>
          <button
            type='button'
            className='w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg shadow-primary/20'
          >
            1
          </button>
          <button
            type='button'
            className='w-10 h-10 rounded-lg border border-border text-foreground hover:bg-muted font-bold flex items-center justify-center transition-colors'
          >
            2
          </button>
          <button
            type='button'
            className='w-10 h-10 rounded-lg border border-border text-foreground hover:bg-muted font-bold flex items-center justify-center transition-colors'
          >
            3
          </button>
          <span className='text-muted-foreground px-2'>...</span>
          <button
            type='button'
            aria-label={t('market.pagination.next')}
            className='p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors'
          >
            <span className='material-symbols-outlined'>chevron_right</span>
          </button>
        </div>
      </main>
    </div>
  )
}
