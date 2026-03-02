import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { supabase } from '@/lib/supabase'
import type { QuickPreset } from '@guater/types'
import { useAuth } from '@/lib/context/AuthContext'
import { useThemeColors } from '@/lib/hooks/useThemeColors'

const fieldLabel = {
  fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5,
  color: '#94A8BA', textTransform: 'uppercase' as const, marginBottom: 6,
}

const inputBase = {
  borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12,
  paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
}

interface PresetsManagerProps {
  presets: QuickPreset[]
  onRefresh: () => void
}

export default function PresetsManager({ presets, onRefresh }: PresetsManagerProps) {
  const { user } = useAuth()
  const c = useThemeColors()

  const [adding, setAdding]         = useState(false)
  const [label, setLabel]           = useState('')
  const [amount, setAmount]         = useState('')
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function resetForm() {
    setLabel('')
    setAmount('')
    setSaveError(null)
    setAdding(false)
  }

  async function handleAdd() {
    if (!user || !label.trim() || !amount) return
    const amountNum = parseInt(amount, 10)
    if (Number.isNaN(amountNum) || amountNum <= 0 || amountNum > 5000) return

    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await supabase.from('quick_presets').insert({
        user_id:    user.id,
        label:      label.trim(),
        amount_ml:  amountNum,
        sort_order: presets.length,
      })
      if (error) {
        setSaveError(error.message)
        return
      }
      resetForm()
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!user || deletingId) return
    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('quick_presets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) {
        setSaveError(error.message)
        return
      }
      onRefresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <View>
      <Text style={fieldLabel}>Quick add containers</Text>

      <View style={{ gap: 8, marginBottom: 16 }}>
        {presets.length === 0 && (
          <Text style={{ fontSize: 13, color: '#94A8BA' }}>
            No containers yet. Add one below.
          </Text>
        )}
        {presets.map((preset) => (
          <View
            key={preset.id}
            style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingHorizontal: 16, paddingVertical: 12,
              borderRadius: 12, borderWidth: 2, borderColor: c.border,
              backgroundColor: c.cardAlt,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontWeight: '600', fontSize: 14, color: c.selectedText }}>
                {preset.label}
              </Text>
              <Text style={{ fontSize: 13, color: c.textMuted }}>
                {preset.amount_ml} ml
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(preset.id)}
              disabled={deletingId === preset.id}
              accessibilityLabel={`Delete ${preset.label}`}
              style={{
                width: 24, height: 24,
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 6, borderWidth: 2, borderColor: c.border,
                backgroundColor: c.card,
                opacity: deletingId === preset.id ? 0.5 : 1,
              }}
            >
              {deletingId === preset.id
                ? <ActivityIndicator size="small" color={c.textMuted} />
                : <Text style={{ fontSize: 11, color: c.textMuted }}>✕</Text>
              }
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {adding ? (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={fieldLabel}>Name</Text>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="e.g. Contigo"
                placeholderTextColor="#94A8BA"
                style={{ ...inputBase, color: c.textPrimary, backgroundColor: c.inputBg }}
              />
            </View>
            <View style={{ width: 100 }}>
              <Text style={fieldLabel}>Amount (ml)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="591"
                placeholderTextColor="#94A8BA"
                keyboardType="numeric"
                style={{ ...inputBase, color: c.textPrimary, backgroundColor: c.inputBg }}
              />
            </View>
          </View>

          {saveError && (
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#D95F5F' }}>{saveError}</Text>
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={saving}
              style={{
                flex: 1, backgroundColor: '#0D4F78', borderRadius: 12,
                paddingVertical: 12, alignItems: 'center',
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving
                ? <ActivityIndicator color="white" />
                : <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Save</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetForm}
              disabled={saving}
              style={{
                flex: 1, borderWidth: 2, borderColor: c.border, borderRadius: 12,
                paddingVertical: 12, alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', fontSize: 14, color: c.textMuted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setAdding(true)}
          style={{
            borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12,
            paddingVertical: 12, alignItems: 'center',
            backgroundColor: c.card,
          }}
        >
          <Text style={{ fontWeight: '600', fontSize: 14, color: '#0D4F78' }}>+ Add container</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
