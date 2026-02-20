import { getProfile } from '@/lib/water'
import { updateProfile } from '@/app/actions'
import { Button, Input, Card } from '@/components/ui'
import Navbar from '@/components/layout/Navbar'
import { logout } from '@/app/(auth)/actions'

export default async function SettingsPage() {
  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-surface">
      <Navbar displayName={profile?.display_name ?? undefined} />

      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        <h2 className="text-xl font-bold text-text-secondary">Settings</h2>

        {/* Profile */}
        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
            Profile
          </div>
          <form action={updateProfile} className="flex flex-col gap-4">
            <Input
              id="display_name"
              name="display_name"
              type="text"
              label="Name"
              defaultValue={profile?.display_name ?? ''}
              placeholder="Your name"
            />
            <Input
              id="daily_goal_ml"
              name="daily_goal_ml"
              type="number"
              label="Daily goal (ml)"
              defaultValue={profile?.daily_goal_ml ?? 2500}
              placeholder="2500"
              min={100}
              max={10000}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="preferred_unit" className="text-sm font-semibold text-text-secondary">
                Unit
              </label>
              <select
                id="preferred_unit"
                name="preferred_unit"
                defaultValue={profile?.preferred_unit ?? 'ml'}
                className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all cursor-pointer"
              >
                <option value="ml">ml</option>
                <option value="oz">oz</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="timezone" className="text-sm font-semibold text-text-secondary">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={profile?.timezone ?? 'UTC'}
                className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all cursor-pointer"
              >
                <option value="UTC">UTC</option>
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (ART)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="America/Chicago">Chicago (CST)</option>
                <option value="America/Denver">Denver (MST)</option>
                <option value="America/Los_Angeles">Los Angeles (PST)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
              </select>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Save changes
            </Button>
          </form>
        </Card>

        {/* Danger zone */}
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