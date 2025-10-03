<template>
  <div class="form-group" :class="groupClasses">
    <label v-if="label" class="form-label" :for="id || name">{{ label }}</label>

    <!-- Toolbar -->
    <div class="rt-toolbar">
      <button
        type="button"
        class="rt-btn"
        :class="{ 'is-active': isBold }"
        :aria-pressed="isBold ? 'true' : 'false'"
        @mousedown.prevent
        @click="runCmd('bold')"
      >B</button>

      <button
        type="button"
        class="rt-btn"
        :class="{ 'is-active': isItalic }"
        :aria-pressed="isItalic ? 'true' : 'false'"
        @mousedown.prevent
        @click="runCmd('italic')"
      ><i>I</i></button>

      <button
        type="button"
        class="rt-btn"
        :class="{ 'is-active': isBulleted }"
        :aria-pressed="isBulleted ? 'true' : 'false'"
        @mousedown.prevent
        @click="runCmd('insertUnorderedList')"
      >• List</button>

      <button
        type="button"
        class="rt-btn"
        :class="{ 'is-active': isOrdered }"
        :aria-pressed="isOrdered ? 'true' : 'false'"
        @mousedown.prevent
        @click="runCmd('insertOrderedList')"
      >1. List</button>
    </div>

    <!-- Editor -->
    <div
      ref="editorEl"
      class="form-control rt-editor"
      :class="inputClasses"
      :id="id || name"
      contenteditable="true"
      spellcheck="true"
      @input="onInput"
      @keyup="refreshStates"
      @mouseup="refreshStates"
      @blur="onBlur"
      v-bind="editorAttrs"
    ></div>

    <input type="hidden" :name="name" :value="modelValue || ''" />

    <small v-if="hintText" class="form-text text-muted">
      <span v-html="hintText"></span>
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

type EditorAttrs = Record<string, any>

const props = defineProps<{
  name: string
  modelValue?: string
  id?: string
  label?: string
  hintText?: string
  groupClasses?: string
  inputClasses?: string
  editorAttrs?: EditorAttrs
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const editorEl = ref<HTMLDivElement | null>(null)

// Toolbar active states
const isBold = ref(false)
const isItalic = ref(false)
const isBulleted = ref(false)
const isOrdered = ref(false)

function withinEditorSelection(): boolean {
  const el = editorEl.value
  const sel = window.getSelection()
  if (!el || !sel || sel.rangeCount === 0) return false
  const nodeA = sel.anchorNode
  const nodeF = sel.focusNode
  return !!(nodeA && nodeF && el.contains(nodeA) && el.contains(nodeF))
}

function refreshStates() {
  if (!withinEditorSelection()) {
    isBold.value = false
    isItalic.value = false
    isBulleted.value = false
    isOrdered.value = false
    return
  }
  try {
    isBold.value = document.queryCommandState('bold')
    isItalic.value = document.queryCommandState('italic')
    isBulleted.value = document.queryCommandState('insertUnorderedList')
    isOrdered.value = document.queryCommandState('insertOrderedList')
  } catch { /* noop */ }
}

function runCmd(cmd: 'bold'|'italic'|'insertUnorderedList'|'insertOrderedList') {
  editorEl.value?.focus()
  try { document.execCommand(cmd, false) } catch { /* noop */ }
  refreshStates()
  emitSanitized()
}

function sanitize(raw: string): string {
  // small whitelist sanitizer (no attributes)
  const allowed = new Set(['P','BR','DIV','UL','OL','LI','STRONG','B','EM','I'])
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'text/html')
  ;[...doc.body.querySelectorAll('*')].forEach(el => {
    if (!allowed.has(el.tagName)) {
      el.replaceWith(...el.childNodes)
    } else {
      for (const a of el.getAttributeNames()) el.removeAttribute(a)
    }
  })
  const html = doc.body.innerHTML.trim()
  return html === '' ? '<p></p>' : html
}

function emitSanitized() {
  const html = editorEl.value?.innerHTML ?? ''
  emit('update:modelValue', sanitize(html))
}

function onInput() {
  emitSanitized()
}

function onBlur() {
  const el = editorEl.value
  if (!el) return
  const sanitized = sanitize(el.innerHTML)
  if (sanitized !== el.innerHTML) el.innerHTML = sanitized
}

function onSelectionChange() {
  refreshStates()
}

onMounted(() => {
  if (editorEl.value) {
    editorEl.value.innerHTML = props.modelValue || '<p></p>'
  }
  document.addEventListener('selectionchange', onSelectionChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
})

watch(
  () => props.modelValue,
  (next) => {
    const el = editorEl.value
    if (!el) return
    const target = next || '<p></p>'
    if (target !== el.innerHTML) el.innerHTML = target
  }
)
</script>

<style scoped>
.rt-toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.rt-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color, #d1d5db);
  background: #fff;
  border-radius: 0.375rem;
  cursor: pointer;
}
.rt-btn.is-active {
  background: #eef2ff;
  border-color: #6366f1;
  font-weight: 600;
}

.rt-editor {
  min-height: 9rem;
  line-height: 1.3;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 0.375rem;
  padding: 0.75rem;
  outline: none;
}
.rt-editor:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.15);
}

/* Basic type spacing */
.rt-editor :deep(p) { margin: 0; }
.rt-editor :deep(p + p) { margin-top: 0.25rem; }

.rt-editor :deep(ul),
.rt-editor :deep(ol) {
  margin: 0;
  padding-left: 1.25rem;
}
.rt-editor :deep(li) { margin: 0; }
.rt-editor :deep(li p) { margin: 0; }
</style>
