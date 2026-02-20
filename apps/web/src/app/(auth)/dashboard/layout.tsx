export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="h-16 border-b border-slate-200 flex items-center px-6">
        <span className="font-semibold text-slate-800">Güater</span>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}