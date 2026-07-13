type AdminInsightTableProps = {
  title: string
  headers: string[]
  rows: string[][]
  empty: string
  searchLabel: string
  searchPlaceholder: string
  query: string
  onQueryChange: (value: string) => void
  filter?: {
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
  }
}

export function AdminInsightTable({
  title,
  headers,
  rows,
  empty,
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  filter
}: AdminInsightTableProps) {
  return (
    <section className='flex h-[440px] min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm'>
      <div className='grid gap-3 border-b border-border p-4'>
        <h2 className='text-lg font-bold text-foreground'>{title}</h2>
        <div className='grid gap-2 sm:grid-cols-2'>
          <label className='grid gap-1 text-xs font-semibold text-muted-foreground'>
            <span>{searchLabel}</span>
            <input
              type='search'
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={searchPlaceholder}
              className='h-10 min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
            />
          </label>
          {filter ? (
            <label className='grid gap-1 text-xs font-semibold text-muted-foreground'>
              <span>{filter.label}</span>
              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className='h-10 min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>
      <div className='min-h-0 flex-1 overflow-auto'>
        <table className='w-full min-w-[420px] table-fixed text-left text-sm'>
          <thead className='sticky top-0 z-10 bg-card'>
            <tr className='border-b border-border text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-sm'>
              {headers.map((header) => (
                <th key={header} className='px-5 py-3'>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.join('|')} className='align-top hover:bg-muted/20'>
                  {row.map((cell, index) => (
                    <td
                      key={`${cell}-${index}`}
                      className='break-words px-5 py-4 font-semibold leading-6 text-foreground'
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className='px-5 py-6 text-center text-sm text-muted-foreground'>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
