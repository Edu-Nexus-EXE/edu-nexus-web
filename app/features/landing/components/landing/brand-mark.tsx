export interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg aria-hidden='true' className={className} viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='2.25' fill='currentColor' />
      <circle cx='5.5' cy='12' r='2' fill='currentColor' />
      <circle cx='18.5' cy='12' r='2' fill='currentColor' />
      <circle cx='12' cy='5.5' r='2' fill='currentColor' />
      <circle cx='12' cy='18.5' r='2' fill='currentColor' />
      <path
        d='M7.3 12h9.4M12 7.3v9.4M7 10.9l3.2-3.2M13.8 16.3l3.2-3.2M13.8 7.7l3.2 3.2M7 13.1l3.2 3.2'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
      />
    </svg>
  )
}
