export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-full max-w-md px-6 py-12">
        <div className="mb-10">
          <span className="font-serif text-2xl text-blue-deep">Güater</span>
        </div>
        {children}
      </div>
    </div>
  )
}