import Navbar from '@/components/layout/Navbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PresetsManager from '@/components/water/PresetsManager'
import DiureticPresetsManager from '@/components/water/diuretics/DiureticPresetsManager'
import SettingsClient from './SettingsClient'
import { getProfile } from '@/lib/supabase/queries/profile'
import { getPresets } from '@/lib/supabase/queries/presets'
import { getDiureticPresets } from '@/lib/supabase/queries/diuretics'
import { logout } from '@/app/actions/logout'
import DeleteAccountButton from '@/components/ui/DeleteAccountButton'

export default async function SettingsPage() {
  const [profile, presets, diureticPresets] = await Promise.all([
    getProfile(),
    getPresets(),
    getDiureticPresets(),
  ])

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <Navbar displayName={profile?.display_name ?? undefined} />
      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">
          Settings
        </h2>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-4">
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
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-4">
            Account
          </div>
          <div className="flex flex-col gap-3">
            <form action={logout}>
              <Button variant="ghost" type="submit" fullWidth>
                Log out
              </Button>
            </form>
            <DeleteAccountButton />
          </div>
        </Card>
      </main>
    </div>
  )
}
