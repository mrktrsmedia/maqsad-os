import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maqsad Life OS',
  description: 'Your private personal operating system.',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
    shortcut: '/logo.jpeg',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&family=Fraunces:ital,wght@0,300;0,600;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-os-bg text-os-text font-mono antialiased">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#17171c',
              color: '#e8e6e0',
              border: '1px solid #333340',
              fontFamily: 'DM Mono, monospace',
              fontSize: '12px',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
