import { getProfile, getPresets } from '@/lib/water'
import { Card, Button } from '@/components/ui'
import Navbar from '@/components/layout/Navbar'
import { logout } from '@/app/(auth)/actions'
import PresetsManager from '@/components/water/PresetsManager'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const [profile, presets] = await Promise.all([getProfile(), getPresets()])

  return (
    <div className="min-h-screen bg-surface">
      <Navbar displayName={profile?.display_name ?? undefined} />

      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        <h2 className="text-xl font-bold text-text-secondary">Settings</h2>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
            Profile
          </div>
          <SettingsClient profile={profile} />
        </Card>

        <Card>
          <PresetsManager presets={presets} />
        </Card>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
            Account
          </div>
          <form action={logout}>
            <Button variant="ghost" type="submit" fullWidth>
              Log out
            </Button>
          </form>
        </Card>

      </main>
    </div>
  )
}