<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" :id="id" class="neur-modal-backdrop" @mousedown.self="onBackdrop">
        <div
          class="neur-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descId"
          ref="dialogEl"
          @keydown.esc.prevent="onEsc"
        >
          <header class="neur-modal-header">
            <h2 class="neur-modal-title" :id="titleId">{{ title }}</h2>
            <button class="neur-modal-close" type="button" aria-label="Close" @click="close">×</button>
          </header>

          <section class="neur-modal-body" :id="descId">
            <slot />
          </section>

          <footer v-if="showFooter" class="neur-modal-footer">
            <slot name="footer">
              <button type="button" class="btn" @click="close">Close</button>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onBeforeUnmount, nextTick, watch, toRef, computed } from 'vue';

const props = defineProps<{
  id?: string
  title?: string
  showFooter?: boolean
  dismissible?: boolean
  openOnMount?: boolean
}>();

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
  (e: 'after-close'): void
}>();

const id = props.id ?? 'modal-' + Math.random().toString(36).slice(2);
const title = props.title ?? '';
const showFooter = props.showFooter ?? true;
const dismissible = props.dismissible ?? true;

const isOpen = ref(!!props.openOnMount);
const dialogEl = ref<HTMLElement | null>(null);

const titleId = `${id}-title`;
const descId = `${id}-desc`;

function lockScroll(lock: boolean) {
  const cls = 'modal-no-scroll';
  if (lock) document.documentElement.classList.add(cls);
  else document.documentElement.classList.remove(cls);
}

function focusFirstElement() {
  nextTick(() => {
    const el = dialogEl.value;
    if (!el) return;
    const focusable = el.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (focusable ?? el).focus();
  });
}

function open() {
  if (isOpen.value) return;
  isOpen.value = true;
  lockScroll(true);
  emit('open');
  focusFirstElement();
}

function close() {
  if (!isOpen.value) return;
  isOpen.value = false;
  lockScroll(false);
  emit('close');
  nextTick(() => emit('after-close'));
}

function toggle() {
  isOpen.value ? close() : open();
}

function onBackdrop() {
  if (dismissible) close();
}

function onEsc() {
  if (dismissible) close();
}

onMounted(() => {
  if (isOpen.value) {
    lockScroll(true);
    focusFirstElement();
  }
});

onBeforeUnmount(() => {
  lockScroll(false);
});

defineExpose({ open, close, toggle });
</script>

<style scoped>
/* Backdrop */
.neur-modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1050; /* higher than Bootstrap’s backdrop (usually 1050). If theirs is 1050, set 1060 */
}

/* Dialog */
.neur-modal {
  display: block; /* avoid Bootstrap’s display:none */
  width: min(92vw, 560px);
  max-height: 85vh;
  overflow: auto;
  background: var(--modal-bg, #fff);
  color: var(--modal-fg, #111);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  outline: none;
  z-index: 1060; /* above the backdrop */
}

.neur-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.125rem; border-bottom: 1px solid rgba(0,0,0,.08);
}
.neur-modal-title { font-size: 1.1rem; margin: 0; }
.neur-modal-close { border: 0; background: transparent; font-size: 1.5rem; line-height: 1; cursor: pointer; padding: .25rem .5rem; }
.neur-modal-body { padding: 1rem 1.125rem; }
.neur-modal-footer { padding: .75rem 1.125rem; border-top: 1px solid rgba(0,0,0,.08); display: flex; gap: .5rem; justify-content: flex-end; }

/* Animation (unchanged) */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

</style>
