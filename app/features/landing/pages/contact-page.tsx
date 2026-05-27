import { useTranslation } from 'react-i18next'

import { LandingFooter } from '../components/landing/landing-footer'
import { LandingNavbar } from '../components/landing/landing-navbar'
import { MarketingLayout } from '../components/landing/marketing-layout'

export function ContactPage() {
  const { t } = useTranslation('landing')

  return (
    <MarketingLayout>
      <div className='overflow-x-hidden selection:bg-primary selection:text-primary-foreground min-h-screen flex flex-col'>
        <LandingNavbar />

        <main className='flex-grow'>
          <section className='relative min-h-[80vh] flex flex-col items-center justify-center py-20 px-8 max-w-7xl mx-auto overflow-visible'>
            {/* Background Decorative Blobs */}
            <div className='absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse' />
            <div className='absolute bottom-20 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[80px] -z-10 animate-pulse' />

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full'>
              {/* Left: Lifestyle Imagery */}
              <div className='relative'>
                <div className='rounded-xl overflow-hidden aspect-[4/5] shadow-2xl shadow-primary/5 group'>
                  <img
                    alt='Sinh viên Edu-Bridge'
                    className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuBwCFspxYvHAMehG2zoU3TqYSmNoXVytIA386o9iatJbIMEEDjbXuX1fXvSfzTDUSsYyCOhY20JddNpOSBSnCKhAbzun-JpETwT_-eYA0046Et50oDwOOtq9V_8p0VxcPLl22VPI3ujH79LL4dQ0oE7MfZIvB2EQghJR1qCv0h0DIbKYjwb19692wU7ATq5SoWOhKxNvZt9bwuVj5sPAdT42qKlXO9GNaeZkbgqn20TcjhgCYqf_y4m542sZqm3h9_WgdvMZockHzlz'
                  />
                </div>
                {/* Floating Badge */}
                <div className='absolute -bottom-6 -right-6 bg-card p-6 rounded-lg shadow-2xl shadow-primary/5 border border-border flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                    <span className='material-symbols-outlined'>groups</span>
                  </div>
                  <div>
                    <p className='font-bold text-xl text-foreground'>10,000+</p>
                    <p className='text-xs uppercase tracking-wider text-muted-foreground'>{t('contact.students')}</p>
                  </div>
                </div>
              </div>

              {/* Right: Floating Contact Card */}
              <div className='bg-card rounded-xl p-10 lg:p-14 shadow-2xl shadow-primary/5 border border-border'>
                <div className='mb-10'>
                  <h1 className='text-4xl lg:text-5xl font-extrabold text-foreground mb-4'>{t('contact.title')}</h1>
                  <p className='text-lg text-muted-foreground leading-relaxed'>{t('contact.subtitle')}</p>
                </div>

                <div className='space-y-6'>
                  {/* Facebook */}
                  <a
                    className='group flex items-center justify-between p-6 rounded-lg bg-muted/50 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-300'
                    href='#'
                  >
                    <div className='flex items-center gap-6'>
                      <div className='w-14 h-14 rounded-full bg-info/10 flex items-center justify-center text-info'>
                        <svg className='w-8 h-8 fill-current' viewBox='0 0 24 24'>
                          <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                        </svg>
                      </div>
                      <div>
                        <h3 className='font-semibold text-lg text-foreground'>{t('contact.facebook')}</h3>
                        <p className='text-sm text-muted-foreground'>{t('contact.facebookSub')}</p>
                      </div>
                    </div>
                    <span className='material-symbols-outlined text-muted-foreground group-hover:translate-x-2 transition-transform'>
                      arrow_forward
                    </span>
                  </a>

                  {/* TikTok */}
                  <a
                    className='group flex items-center justify-between p-6 rounded-lg bg-muted/50 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-300'
                    href='#'
                  >
                    <div className='flex items-center gap-6'>
                      <div className='w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center text-foreground'>
                        <svg className='w-8 h-8 fill-current' viewBox='0 0 24 24'>
                          <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
                        </svg>
                      </div>
                      <div>
                        <h3 className='font-semibold text-lg text-foreground'>{t('contact.tiktok')}</h3>
                        <p className='text-sm text-muted-foreground'>{t('contact.tiktokSub')}</p>
                      </div>
                    </div>
                    <span className='material-symbols-outlined text-muted-foreground group-hover:translate-x-2 transition-transform'>
                      arrow_forward
                    </span>
                  </a>

                  {/* Email */}
                  <a
                    className='group flex items-center justify-between p-6 rounded-lg bg-muted/50 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-300'
                    href='mailto:hello@edu-bridge.vn'
                  >
                    <div className='flex items-center gap-6'>
                      <div className='w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                        <span className='material-symbols-outlined text-3xl'>mail</span>
                      </div>
                      <div>
                        <h3 className='font-semibold text-lg text-foreground'>{t('contact.email')}</h3>
                        <p className='text-sm text-muted-foreground'>{t('contact.emailSub')}</p>
                      </div>
                    </div>
                    <span className='material-symbols-outlined text-muted-foreground group-hover:translate-x-2 transition-transform'>
                      arrow_forward
                    </span>
                  </a>
                </div>

                <div className='mt-12 pt-8 border-t border-border'>
                  <p className='text-sm text-muted-foreground uppercase tracking-widest text-center'>
                    {t('contact.response')}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <LandingFooter />
      </div>
    </MarketingLayout>
  )
}
