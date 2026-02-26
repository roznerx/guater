import ResetPasswordClient from './ResetPasswordClient'

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-deep dark:text-blue-light">
          New password
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
          Choose a new password for your account
        </p>
      </div>
      <ResetPasswordClient />
    </div>
  )
}
