import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Güater',
  description: 'Track your daily water intake',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="h-16 border-b border-slate-200 flex items-center px-6">
          <span className="font-semibold text-slate-800">Güater</span>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}