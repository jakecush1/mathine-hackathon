<template>
  <div class="time-spinner" :class="{ disabled }">
    <input
      ref="inputEl"
      class="time-input"
      :name="name"
      :placeholder="placeholder"
      :disabled="disabled"
      inputmode="numeric"
      autocomplete="off"
      spellcheck="false"
      v-model="display"
      @keydown="onKey"
      @blur="commit"
    />
    <div class="buttons">
      <button type="button" class="btn up" :disabled="disabled" @click="stepUp" aria-label="Increase time">▲</button>
      <button type="button" class="btn down" :disabled="disabled" @click="stepDown" aria-label="Decrease time">▼</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' }, // 'HH:mm'
  step: { type: Number, default: 5 },        // minutes per tick
  min: { type: String, default: null },      // optional 'HH:mm'
  max: { type: String, default: null },      // optional 'HH:mm'
  disabled: { type: Boolean, default: false },
  name: { type: String, default: '' },
  placeholder: { type: String, default: 'HH:mm' },
  wrap: { type: Boolean, default: true },    // wrap 23:59 -> 00:00 when stepping
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'change', v: string): void
}>();

const inputEl = ref<HTMLInputElement | null>(null);
const display = ref(props.modelValue || '');

watch(() => props.modelValue, v => {
  if ((v || '') !== display.value) display.value = v || '';
});

function parseTime(str: string): number | null {
  if (!str) return null;
  const s = str.trim();
  let h: number, m: number;
  if (s.includes(':')) {
    const [hs, ms = '0'] = s.split(':');
    h = Number(hs);
    m = Number(ms);
  } else {
    const digits = s.replace(/[^\d]/g, '');
    if (!digits) return null;
    if (digits.length <= 2) { h = Number(digits); m = 0; }
    else {
      const mm = digits.slice(-2);
      const hh = digits.slice(0, -2);
      h = Number(hh); m = Number(mm);
    }
  }
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}
function fmt(mins: number): string {
  const h = ((Math.floor(mins / 60) % 24) + 24) % 24;
  const m = ((mins % 60) + 60) % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}
function parseOpt(str: string | null): number | null {
  return str ? parseTime(str) : null;
}

const minMins = computed(() => parseOpt(props.min));
const maxMins = computed(() => parseOpt(props.max));

function clampOrWrap(mins: number, direction: 1 | -1): number {
  const day = 24 * 60;
  if (props.wrap) {
    // wrap around the 24h clock
    mins = ((mins % day) + day) % day;
    // if min/max provided, clamp within them
    if (minMins.value != null && mins < minMins.value) return minMins.value;
    if (maxMins.value != null && mins > maxMins.value) return maxMins.value;
    return mins;
  }
  // clamp strictly
  if (minMins.value != null && mins < minMins.value) return minMins.value;
  if (maxMins.value != null && mins > maxMins.value) return maxMins.value;
  // otherwise clamp to 0..1439 bounds
  if (mins < 0) return 0;
  if (mins > 1439) return 1439;
  return mins;
}

function commit() {
  const mins = parseTime(display.value);
  if (mins == null) {
    // revert to the last valid external value
    display.value = props.modelValue || '';
    return;
  }
  const out = fmt(clampOrWrap(mins, 1));
  if (out !== props.modelValue) {
    emit('update:modelValue', out);
    emit('change', out);
  }
  display.value = out;
}

function stepUp() {
  const cur = parseTime(props.modelValue || display.value) ?? 0;
  const next = clampOrWrap(cur + props.step, 1);
  const out = fmt(next);
  emit('update:modelValue', out);
  emit('change', out);
  display.value = out;
}

function stepDown() {
  const cur = parseTime(props.modelValue || display.value) ?? 0;
  const next = clampOrWrap(cur - props.step, -1);
  const out = fmt(next);
  emit('update:modelValue', out);
  emit('change', out);
  display.value = out;
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') { e.preventDefault(); stepUp(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); stepDown(); }
  else if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement)?.blur(); }
}
</script>

<style scoped>
.time-spinner {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid #d9e2ec;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.time-spinner.disabled { opacity: .6; pointer-events: none; }

.time-input {
  width: 6.5ch; /* "HH:mm" */
  padding: 8px 10px;
  border: 0;
  outline: none;
  font: inherit;
}
.time-input:focus {
  box-shadow: inset 0 0 0 2px rgba(0,84,147,.2);
}

.buttons {
  display: grid;
  grid-auto-rows: 1fr 1fr;
  border-left: 1px solid #d9e2ec;
}
.btn {
  border: 0;
  background: #fff;
  width: 28px;
  padding: 0;
  cursor: pointer;
  line-height: 1;
  font-size: 12px;
}
.btn:hover { background: #f7fbff; }
.btn:active { background: #eef6ff; }
.btn.up { border-bottom: 1px solid #d9e2ec; }
</style>
