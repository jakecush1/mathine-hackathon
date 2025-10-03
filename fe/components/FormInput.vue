<template>
  <div class="fi">
    <label v-if="label" class="fi-label" :for="id">{{ label }}</label>

    <input
      :id="id"
      class="fi-input"
      :name="name"
      :type="type"
      :value="normalizedValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      :autocomplete="autocomplete"
      @input="onInput"
      @change="onChange"
      v-bind="$attrs"
    />

    <small v-if="hint" class="fi-hint">{{ hint }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type NativeTypes =
  | 'text' | 'date' | 'datetime-local' | 'time' | 'number'
  | 'email' | 'password' | 'url' | 'search' | 'tel' | 'color'

const props = defineProps<{
  modelValue?: string | number | null
  label?: string
  name?: string
  id?: string
  type?: NativeTypes
  placeholder?: string
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  autocomplete?: string
  hint?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number | null): void
  (e: 'change', v: string | number | null): void
}>()

const id = computed(() => props.id || props.name || `fi-${Math.random().toString(36).slice(2)}`)

const type = computed(() => props.type ?? 'text')

/**
 * Normalize value for special input types:
 * - date expects "YYYY-MM-DD"
 * - datetime-local expects "YYYY-MM-DDTHH:MM"
 * Otherwise pass through as-is.
 */
const normalizedValue = computed(() => {
  if (props.modelValue == null) return ''
  const v = String(props.modelValue)

  if (type.value === 'date') {
    // If a Date was passed (rare), coerce to yyyy-mm-dd
    // Otherwise assume caller passes yyyy-mm-dd already.
    const maybeDate = new Date(v)
    const isDateObject = Object.prototype.toString.call(props.modelValue) === '[object Date]'
    if (isDateObject && !isNaN(+maybeDate)) {
      const y = maybeDate.getFullYear()
      const m = String(maybeDate.getMonth() + 1).padStart(2, '0')
      const d = String(maybeDate.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    return v
  }

  if (type.value === 'datetime-local') {
    // If given an ISO string with Z, trim to local "YYYY-MM-DDTHH:MM"
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) return v.slice(0, 16)
  }

  return props.modelValue as any
})

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  let out: string | number | null = el.value

  // Coerce number type
  if (type.value === 'number') {
    out = el.value === '' ? null : Number(el.value)
  }

  emit('update:modelValue', out)
}

function onChange(e: Event) {
  const el = e.target as HTMLInputElement
  let out: string | number | null = el.value
  if (type.value === 'number') {
    out = el.value === '' ? null : Number(el.value)
  }
  emit('change', out)
}
</script>

<style scoped>
.fi { display: grid; gap: 6px; margin: 8px 0; }
.fi-label {
  font-weight: 600;
  color: #334e68;
  font-size: 0.9rem;
}
.fi-input {
  appearance: none;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: 1px solid #d9e2ec;
  border-radius: 8px;
  background: #fff;
  color: #0b1720;
  line-height: 1.2;
}
.fi-input:focus {
  outline: none;
  border-color: #97c4e6;
  box-shadow: 0 0 0 3px rgba(0,84,147,.18);
}
.fi-input:disabled { background: #f5f7fb; color: #8a96a3; }
.fi-hint { color: #5b6b79; font-size: .8rem; }
</style>
