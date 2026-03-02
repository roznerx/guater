import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { supabase } from '@/lib/supabase'
import type { DiureticPreset } from '@guater/types'
import { useAuth } from '@/lib/context/AuthContext'
import { useThemeColors } from '@/lib/hooks/useThemeColors'

const PALETTE = [
  { label: 'Blue Pale',  value: '#C8DCEE' },
  { label: 'Blue Light', value: '#7FB8D8' },
  { label: 'Blue Mid',   value: '#3E8FC0' },
  { label: 'Blue Core',  value: '#1A6FA0' },
  { label: 'Blue Deep',  value: '#0D4F78' },
  { label: 'Teal Light', value: '#8DCFCA' },
  { label: 'Teal Core',  value: '#2AABA2' },
  { label: 'Teal Deep',  value: '#1A7A74' },
  { label: 'Slate Mid',  value: '#94A8BA' },
  { label: 'Slate Deep', value: '#4A6070' },
  { label: 'Warning',    value: '#E8A230' },
  { label: 'Error',      value: '#D95F5F' },
]

const DRINK_TYPES = [
  { label: 'Coffee',       amount_ml: 250, factor: 0.40, color: '#4A6070' },
  { label: 'Espresso',     amount_ml: 60,  factor: 0.50, color: '#0D4F78' },
  { label: 'Black tea',    amount_ml: 250, factor: 0.25, color: '#E8A230' },
  { label: 'Green tea',    amount_ml: 250, factor: 0.15, color: '#2AABA2' },
  { label: 'Mate',         amount_ml: 300, factor: 0.35, color: '#1A7A74' },
  { label: 'Energy drink', amount_ml: 250, factor: 0.45, color: '#3E8FC0' },
  { label: 'Soda',         amount_ml: 350, factor: 0.20, color: '#7FB8D8' },
  { label: 'Beer',         amount_ml: 330, factor: 0.50, color: '#E8A230' },
  { label: 'Wine',         amount_ml: 150, factor: 0.60, color: '#94A8BA' },
  { label: 'Sparkling',    amount_ml: 250, factor: 0.10, color: '#8DCFCA' },
  { label: 'Custom',       amount_ml: 250, factor: 0.30, color: '#94A8BA' },
]

const sectionLabel = {
  fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5,
  color: '#94A8BA', textTransform: 'uppercase' as const, marginBottom: 6,
}

const fieldLabel = {
  fontSize: 13, fontWeight: '600' as const, color: '#4A6070', marginBottom: 6,
}

const inputBase = {
  borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12,
  paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
}

interface DiureticPresetsManagerProps {
  presets: DiureticPreset[]
  onRefresh: () => void
}

export default function DiureticPresetsManager({ presets, onRefresh }: DiureticPresetsManagerProps) {
  const { user } = useAuth()
  const c = useThemeColors()

  const [adding, setAdding]         = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [selectedType, setSelectedType] = useState(DRINK_TYPES[0])
  const [nameValue, setNameValue]       = useState(DRINK_TYPES[0].label)
  const [amountValue, setAmountValue]   = useState(String(DRINK_TYPES[0].amount_ml))
  const [color, setColor]               = useState(DRINK_TYPES[0].color)
  const [showTypePicker, setShowTypePicker] = useState(false)

  function handleTypeChange(type: typeof DRINK_TYPES[0]) {
    setSelectedType(type)
    setColor(type.color)
    setNameValue(type.label === 'Custom' ? '' : type.label)
    setAmountValue(type.label === 'Custom' ? '' : String(type.amount_ml))
    setShowTypePicker(false)
  }

  function resetForm() {
    setSelectedType(DRINK_TYPES[0])
    setNameValue(DRINK_TYPES[0].label)
    setAmountValue(String(DRINK_TYPES[0].amount_ml))
    setColor(DRINK_TYPES[0].color)
    setShowTypePicker(false)
    setSaveError(null)
    setAdding(false)
  }

  async function handleAdd() {
    if (!user || !nameValue.trim() || !amountValue) return
    const amountNum = parseInt(amountValue, 10)
    if (Number.isNaN(amountNum) || amountNum <= 0 || amountNum > 2000) return

    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await supabase.from('diuretic_presets').insert({
        user_id:         user.id,
        label:           nameValue.trim(),
        amount_ml:       amountNum,
        diuretic_factor: selectedType.factor,
        color,
        sort_order:      presets.length,
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
        .from('diuretic_presets')
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
      <Text style={sectionLabel}>Diuretic drink presets</Text>

      <View style={{ gap: 8, marginBottom: 16 }}>
        {presets.length === 0 && (
          <Text style={{ fontSize: 13, color: '#94A8BA' }}>
            No custom presets. Default drinks are used.
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: preset.color, borderWidth: 1, borderColor: c.border }} />
              <Text style={{ fontWeight: '600', fontSize: 14, color: c.selectedText }}>
                {preset.label}
              </Text>
              <Text style={{ fontSize: 12, color: c.textMuted }}>
                {preset.amount_ml} ml · {Math.round(preset.diuretic_factor * 100)}% diuretic
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
        <View style={{ gap: 14 }}>

          {/* Drink type picker */}
          <View>
            <Text style={fieldLabel}>Drink type</Text>
            <TouchableOpacity
              onPress={() => setShowTypePicker(v => !v)}
              style={{
                borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12,
                paddingHorizontal: 12, paddingVertical: 10,
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: c.card,
                shadowColor: '#0D4F78', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
              }}
            >
              <Text style={{ fontSize: 14, color: c.textPrimary, fontWeight: '600' }}>
                {selectedType.label}
              </Text>
              <Text style={{ color: c.textMuted, fontSize: 12 }}>{showTypePicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showTypePicker && (
              <View style={{ borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
                {DRINK_TYPES.map((type, i) => (
                  <TouchableOpacity
                    key={type.label}
                    onPress={() => handleTypeChange(type)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 11,
                      backgroundColor: selectedType.label === type.label ? c.selectedBg : c.card,
                      borderTopWidth: i > 0 ? 1 : 0,
                      borderTopColor: c.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: c.selectedText, fontWeight: selectedType.label === type.label ? '700' : '400' }}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Name + Amount */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={fieldLabel}>Name</Text>
              <TextInput
                value={nameValue}
                onChangeText={setNameValue}
                placeholder="e.g. My morning coffee"
                placeholderTextColor="#94A8BA"
                style={{ ...inputBase, color: c.textPrimary, backgroundColor: c.inputBg }}
              />
            </View>
            <View style={{ width: 100 }}>
              <Text style={fieldLabel}>Amount (ml)</Text>
              <TextInput
                value={amountValue}
                onChangeText={setAmountValue}
                placeholder="250"
                placeholderTextColor="#94A8BA"
                keyboardType="numeric"
                style={{ ...inputBase, color: c.textPrimary, backgroundColor: c.inputBg }}
              />
            </View>
          </View>

          {/* Color picker */}
          <View>
            <Text style={fieldLabel}>Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PALETTE.map((swatch) => (
                <TouchableOpacity
                  key={swatch.value}
                  onPress={() => setColor(swatch.value)}
                  accessibilityLabel={swatch.label}
                  style={{
                    width: 32, height: 32,
                    borderRadius: 8,
                    backgroundColor: swatch.value,
                    borderWidth: color === swatch.value ? 3 : 2,
                    borderColor: color === swatch.value ? '#0D4F78' : c.border,
                  }}
                />
              ))}
            </View>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: c.textMuted, marginTop: 4 }}>
              {color}
            </Text>
          </View>

          {saveError && (
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#D95F5F' }}>{saveError}</Text>
          )}

          {/* Actions */}
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
          <Text style={{ fontWeight: '600', fontSize: 14, color: '#0D4F78' }}>+ Add drink</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
