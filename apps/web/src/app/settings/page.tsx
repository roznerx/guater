import { getProfile, getPresets, getDiureticPresets } from '@/lib/water'
import Navbar from '@/components/layout/Navbar'
import { logout } from '@/app/(auth)/actions'
import PresetsManager from '@/components/water/PresetsManager'
import DiureticPresetsManager from '@/components/water/diuretics/DiureticPresetsManager'
import SettingsClient from './SettingsClient'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default async function SettingsPage() {
  const [profile, presets, diureticPresets] = await Promise.all([
    getProfile(),
    getPresets(),
    getDiureticPresets(),
  ])

  const theme = (profile?.theme ?? 'light') as 'light' | 'dark'

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <Navbar displayName={profile?.display_name ?? undefined} theme={theme} />

      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        <h2 className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">Settings</h2>

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
          <DiureticPresetsManager presets={diureticPresets} />
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