import { useTranslation } from 'react-i18next'

type Badge = {
  id: string
  icon: string
  title: string
  desc: string
  code: string
  issuer: string
}

const BADGES: Badge[] = [
  { id: '1', icon: 'psychology', title: 'AI & Học máy', desc: 'Mạng nơ-ron nâng cao & NLP', code: 'ID: ML-992-BA', issuer: 'ACME UNIVERSITY' },
  { id: '2', icon: 'cloud', title: 'Cơ sở hạ tầng đám mây', desc: 'Kiến trúc sư giải pháp AWS liên kết', code: 'ID: AWS-441-XS', issuer: 'AMAZON WEB SERVICES' },
  { id: '3', icon: 'all_inclusive', title: 'Kỹ sư DevOps', desc: 'Tự động hóa luồng CI/CD', code: 'ID: DO-102-PT', issuer: 'JENKINS INSTITUTE' },
  { id: '4', icon: 'terminal', title: 'Chuyên gia an ninh mạng', desc: 'Kiểm thử xâm nhập cấp độ 1', code: 'ID: CY-883-OK', issuer: 'OFFSEC ACADEMY' },
]

export function CertificatesBadges() {
  const { t } = useTranslation('dashboard')

  return (
    <section className='mb-12'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <div className='w-2 h-8 bg-primary rounded-full' />
          <h2 className='text-2xl font-bold text-foreground uppercase tracking-tight'>{t('certificates.badges.title')}</h2>
        </div>
        <span className='text-sm text-muted-foreground'>{t('certificates.badges.total')}</span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {BADGES.map((badge) => (
          <div key={badge.id} className='bg-gradient-to-br from-primary/5 to-primary/0 border border-border rounded-xl p-6 relative group hover:border-primary/40 transition-all cursor-default bg-card'>
            <div className='absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl' />
            <div className='flex justify-between items-start mb-6'>
              <div className='w-12 h-12 bg-card border border-border rounded-lg flex items-center justify-center group-hover:border-primary/30 transition-all shadow-sm'>
                <span className='material-symbols-outlined text-primary text-3xl'>{badge.icon}</span>
              </div>
              <span className='material-symbols-outlined text-primary text-sm'>verified</span>
            </div>
            <h3 className='text-foreground font-bold text-lg mb-1'>{badge.title}</h3>
            <p className='text-muted-foreground text-xs mb-4'>{badge.desc}</p>
            <div className='pt-4 border-t border-border flex items-center justify-between'>
              <span className='text-[10px] font-bold text-muted-foreground'>{badge.code}</span>
              <span className='text-[10px] font-bold text-primary/70 uppercase'>{badge.issuer}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
