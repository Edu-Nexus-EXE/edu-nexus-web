import { useTranslation } from 'react-i18next'

export function PricingFaq() {
  const { t } = useTranslation('pricing')

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1'), defaultOpen: true },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ]

  return (
    <div className='w-full max-w-[800px] mt-24'>
      <h2 className='text-foreground text-2xl font-bold text-center mb-10'>
        {t('faq.title')}
      </h2>

      <div className='flex flex-col gap-4'>
        {faqs.map((faq, i) => (
          <details
            key={i}
            className='group bg-card rounded-lg border border-border overflow-hidden'
            open={faq.defaultOpen}
          >
            <summary className='flex items-center justify-between p-5 cursor-pointer list-none'>
              <span className='text-foreground font-semibold'>{faq.q}</span>
              <span className='material-symbols-outlined transition-transform group-open:rotate-180 text-muted-foreground'>
                expand_more
              </span>
            </summary>
            <div className='px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4'>
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
