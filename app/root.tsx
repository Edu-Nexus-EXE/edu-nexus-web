import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'

import { AppProviders, themeInitScript } from '~/providers/app-providers'
import { SITE } from '~/shared/config/site'

import type { Route } from './+types/root'
import './styles/app.css'

const appStylesReadyScript = `document.documentElement.classList.add('app-styles-ready');`

const appShellStyle = `
html:not(.app-styles-ready) body {
  opacity: 0;
}

html.app-styles-ready body {
  opacity: 1;
  transition: opacity 120ms ease;
}
`

export const links: Route.LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=2' },
  { rel: 'shortcut icon', href: '/favicon.ico?v=2' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=optional'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=optional'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/icon?family=Material+Icons&display=block'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block'
  }
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.defaultLocale} suppressHydrationWarning>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <style dangerouslySetInnerHTML={{ __html: appShellStyle }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: appStylesReadyScript }} />
        <noscript>
          <style>{'body { opacity: 1 !important; }'}</style>
        </noscript>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='container mx-auto p-4 pt-16'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full overflow-x-auto p-4'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
