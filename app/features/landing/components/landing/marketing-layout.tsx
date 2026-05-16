export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-background text-foreground font-display antialiased min-h-screen flex flex-col'>
      {children}
    </div>
  )
}
