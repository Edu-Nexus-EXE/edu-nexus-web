import { useTranslation } from 'react-i18next'

import { DashboardLayout } from '../components/layout/dashboard-layout'
import { MarketCard, type ScholarshipCardProps } from '../components/market/market-card'
import { MarketSidebar } from '../components/market/market-sidebar'

const SCHOLARSHIPS: ScholarshipCardProps[] = [
  {
    id: '1',
    title: 'Học bổng Thạc sĩ AI',
    university: 'VinUniversity',
    location: 'Hà Nội',
    logo: <img src='https://lh3.googleusercontent.com/aida-public/AB6AXuDn2rNR99g1crRz_lmCV8MU3ex_6r231IvDzmAaM8KhK85eqsx_wXTIe3-CLIQRV7y0iqfVHbjes0YZLE-2HF_QuFJBtxCjgR4KB-k5o2P6MgoxzXD2ho3MRmImKnp7VU0xLo8qlPLnk750xyGYCIE_gmF4E3J1mKGf2ySejZXyJMY1MELPcxhwuZbyhny_uwqg-YelMMslf61aXMdnkiP9Vj30bVJj3Rc61WSIgDTHQ734OAlhjlNVevrdmRBKLgPAy3j8hPnuAF9R' alt='VinUni' className='w-full h-full object-contain' />,
    endsIn: '03 Days 12h',
    matchPercent: 85,
    matchTone: 'primary',
    strengths: ['IELTS 7.5', 'GPA 3.6/4.0', 'Python Exp'],
    missing: ['Research Paper', 'AWS Cert'],
    aiSuggestion: (
      <>Hoàn thành thêm chứng chỉ <span className='underline decoration-dotted decoration-primary/50 cursor-help font-medium'>AWS Cloud Practitioner</span> để tăng khả năng đạt 95%.</>
    )
  },
  {
    id: '2',
    title: 'Women in Tech Scholarship',
    university: 'RMIT University',
    location: 'HCMC',
    logo: <img src='https://lh3.googleusercontent.com/aida-public/AB6AXuCST5frgZsZ1Lfw_aJvS1UFt0I27T3_Y_aMpPxH4wLGgYpelaKfW7wSljumfhdxEhjxMDWJpwR1Rvi0ET4m8fTxPBsPA_OHgA6nmCc6TDMfbjNzTs9vWXKZgLQEPlQ3mAeZrxKODsKGEwTGfFUav_a2ZPe1FwdxvlQ2Btn9ELwGL8BF30RBH9k7GRf7iCs9pWBrb1abc7VqHAGKaMk95P__suUeGZsA7SwNGIPd18heyTkHR0WJk0PCmIHmpEN2VZdgx26IcwfMHe2g' alt='RMIT' className='w-full h-full object-contain' />,
    endsIn: '15 Days',
    matchPercent: 65,
    matchTone: 'warning',
    strengths: ['Leadership', 'GPA 3.6'],
    missing: ['Portfolio', 'Rec. Letter', 'Interview Prep'],
    aiSuggestion: (
      <>Cập nhật Portfolio dự án cá nhân lên Github để cải thiện điểm hồ sơ.</>
    )
  },
  {
    id: '3',
    title: 'Data Science Excellence',
    university: 'Harvard Extension',
    location: 'Remote',
    logo: <div className='w-9 h-9 rounded bg-destructive flex items-center justify-center text-destructive-foreground font-serif font-bold text-xs'>H</div>,
    endsIn: '01 Month',
    matchPercent: 92,
    matchTone: 'success',
    strengths: ['Statistics', 'Python', 'SQL'],
    missing: ['TOEFL > 100'],
    aiSuggestion: (
      <>Bạn gần như hoàn hảo! Chỉ cần cải thiện điểm TOEFL trong 2 tháng tới.</>
    )
  }
]

export function MarketPage() {
  const { t } = useTranslation('dashboard')

  return (
    <DashboardLayout>
      <div className='flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 gap-10'>
        <MarketSidebar />

        <main className='flex-1 min-w-0'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
            <h2 className='text-3xl font-bold text-foreground tracking-tight'>
              {t('market.title')}
            </h2>
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
            {SCHOLARSHIPS.map((scholarship) => (
              <MarketCard key={scholarship.id} {...scholarship} />
            ))}
          </div>

          <div className='flex items-center justify-center gap-3 mt-16'>
            <button type='button' className='p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors'>
              <span className='material-symbols-outlined'>chevron_left</span>
            </button>
            <button type='button' className='w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg shadow-primary/20'>
              1
            </button>
            <button type='button' className='w-10 h-10 rounded-lg border border-border text-foreground hover:bg-muted font-bold flex items-center justify-center transition-colors'>
              2
            </button>
            <button type='button' className='w-10 h-10 rounded-lg border border-border text-foreground hover:bg-muted font-bold flex items-center justify-center transition-colors'>
              3
            </button>
            <span className='text-muted-foreground px-2'>...</span>
            <button type='button' className='p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors'>
              <span className='material-symbols-outlined'>chevron_right</span>
            </button>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
