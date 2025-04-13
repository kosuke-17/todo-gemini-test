import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import { NextAuthProvider } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Next.jsで構築されたTodoアプリケーション',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='ja'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <NextAuthProvider>
          <Header />
          <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  )
}
