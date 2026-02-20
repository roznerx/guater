import type { Metadata } from 'next'
import { Fredoka } from 'next/font/google'
import './globals.css'
import { getProfile } from '@/lib/water'
import ThemeProvider from '@/components/ThemeProvider'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
})

export const metadata: Metadata = {
  title: 'Güater',
  description: 'Track your daily water intake',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()
  const theme = (profile?.theme ?? 'light') as 'light' | 'dark'

  return (
    <html lang="en" className={fredoka.variable}>
      <body className="font-sans">
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}