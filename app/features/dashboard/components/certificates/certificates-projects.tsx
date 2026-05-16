import { useTranslation } from 'react-i18next'

export function CertificatesProjects() {
  const { t } = useTranslation('dashboard')

  return (
    <section className='pb-20'>
      <div className='flex items-center gap-3 mb-8'>
        <div className='w-2 h-8 bg-primary rounded-full' />
        <h2 className='text-2xl font-bold text-foreground uppercase tracking-tight'>{t('certificates.projects.title')}</h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Project 1 */}
        <div className='bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/40 transition-all shadow-sm'>
          <div className='h-48 relative'>
            <img
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuCw9wi-62u2GmgEf5Izoph3bJ3xJRyWvM63InfK-yvdH0b3s0zm8V-ptoMzaTrH8T5BGq08tsyXoIxZo1N7GccogHo4DHRev5DnGuvp6H5JNO0ZA30J189CobSz0bI5jTEasXoh2CuFFQfW9J7l57vL8RQQmTyMovgGkodmYSvIqWQ4TRktyrMN1JFhnhVTz-ni6cl8SlEQVWvvaMV3QDkUUqBR8Sj4qiu_D40oGwFkCqBEPhfVz1qkicB0M1V6I9tgE9eusZp15ClR'
              alt='AI Chatbot Preview'
              className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500'
            />
            <div className='absolute top-4 left-4 flex gap-2'>
              <span className='bg-card/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-primary uppercase border border-primary/20'>A.I.</span>
              <span className='bg-card/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-primary uppercase border border-primary/20'>Next.js</span>
            </div>
          </div>
          <div className='p-6'>
            <h3 className='text-xl font-bold text-foreground mb-2'>Trợ lý NeuralDesk</h3>
            <p className='text-muted-foreground text-sm mb-6 leading-relaxed'>
              Một giao diện hỗ trợ khách hàng bằng AI chuyên dụng sử dụng RAG (Retrieval Augmented Generation) để trả lời các câu hỏi kỹ thuật với độ chính xác 95%.
            </p>
            <div className='flex items-center justify-between'>
              <div className='flex -space-x-2'>
                <div className='w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden'>
                  <span className='material-symbols-outlined text-xs text-muted-foreground'>group</span>
                </div>
                <div className='w-8 h-8 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary'>+2</div>
              </div>
              <div className='flex gap-4'>
                <button type='button' className='text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-semibold'>
                  <span className='material-symbols-outlined text-base'>code</span> {t('certificates.projects.sourceCode')}
                </button>
                <button type='button' className='text-primary hover:underline transition-colors flex items-center gap-1 text-sm font-semibold'>
                  <span className='material-symbols-outlined text-base'>launch</span> {t('certificates.projects.liveDemo')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Project 2 */}
        <div className='bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/40 transition-all shadow-sm'>
          <div className='h-48 relative'>
            <img
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuBfEcN6IOEiZli6v580sp8L3PE9-3det0C8g5e2ceYikOuG9jl4jQy_ySoqCoWp24Nq7mLKGncXv07Ar5SllG6T0dscIt5Kk1p8ClnAG4F3XFoCwydSgUyRivJNqEKeqjwiSLAJ3o5aRo_ZF-3QO5GKxfneMYCKEA-l9I93tkYh9cPDyOFClsXMEheFz-_gM0AsExvHUYFrZuAzIiWF0jgSk9qWSZXtDbyP3mB0_rBxK-wU8gdkms6YHCGk_KN01guEeSyA3SzKIprw'
              alt='Cloud Infrastructure Preview'
              className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500'
            />
            <div className='absolute top-4 left-4 flex gap-2'>
              <span className='bg-card/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-primary uppercase border border-primary/20'>AWS</span>
              <span className='bg-card/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-primary uppercase border border-primary/20'>Terraform</span>
            </div>
          </div>
          <div className='p-6'>
            <h3 className='text-xl font-bold text-foreground mb-2'>Sentinel Cloud Core</h3>
            <p className='text-muted-foreground text-sm mb-6 leading-relaxed'>
              Triển khai Cơ sở hạ tầng dưới dạng mã (IaC) cho một cụm web đa vùng, có tính sẵn sàng cao với tính năng tự động chuyển đổi dự phòng và kiểm tra bảo mật.
            </p>
            <div className='flex items-center justify-between'>
              <div className='flex -space-x-2'>
                <div className='w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden'>
                  <span className='material-symbols-outlined text-xs text-muted-foreground'>person</span>
                </div>
              </div>
              <div className='flex gap-4'>
                <button type='button' className='text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-semibold'>
                  <span className='material-symbols-outlined text-base'>code</span> {t('certificates.projects.sourceCode')}
                </button>
                <button type='button' className='text-primary hover:underline transition-colors flex items-center gap-1 text-sm font-semibold'>
                  <span className='material-symbols-outlined text-base'>article</span> {t('certificates.projects.caseStudy')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
