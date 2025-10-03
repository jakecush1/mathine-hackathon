<template>
  <nav class="nav">
    <div class="nav-inner">
      <div class="nav-brand">
        <slot name="brand"><span class="brand-text">Mathiné</span></slot>
      </div>

      <ul class="nav-links" role="menubar">
        <li v-for="item in items" :key="item.href" role="none">
          <RouterLink
            v-if="useRouterLinks"
            :to="item.href"
            class="nav-link"
            :class="{ active: isActive(item.href) }"
            :aria-current="isActive(item.href) ? 'page' : undefined"
            role="menuitem"
          >
            {{ item.label }}
          </RouterLink>

          <a
            v-else
            :href="item.href"
            class="nav-link"
            :class="{ active: isActive(item.href) }"
            :aria-current="isActive(item.href) ? 'page' : undefined"
            role="menuitem"
          >
            {{ item.label }}
          </a>
        </li>

        <slot name="actions" />
      </ul>

      <button
        class="nav-toggle"
        :aria-expanded="open ? 'true' : 'false'"
        @click="open = !open"
        aria-label="Toggle navigation"
      >
        <span class="bar" /><span class="bar" /><span class="bar" />
      </button>
    </div>

    <transition name="fade">
      <div v-if="open" class="nav-drawer">
        <ul class="drawer-links">
          <li v-for="item in items" :key="item.href">
            <RouterLink
              v-if="useRouterLinks"
              :to="item.href"
              class="drawer-link"
              :class="{ active: isActive(item.href) }"
              :aria-current="isActive(item.href) ? 'page' : undefined"
              @click="open = false"
            >
              {{ item.label }}
            </RouterLink>

            <a
              v-else
              :href="item.href"
              class="drawer-link"
              :class="{ active: isActive(item.href) }"
              :aria-current="isActive(item.href) ? 'page' : undefined"
              @click="open = false"
            >
              {{ item.label }}
            </a>
          </li>

          <slot name="actions-mobile" />
        </ul>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

type Item = { label: string; href: string }
const props = defineProps<{
  items: Item[]
  useRouterLinks?: boolean
  exact?: boolean
}>()

const route = (() => {
  try { return useRoute() } catch { return null as any }
})()

const useRouterLinks = computed(() =>
  props.useRouterLinks ?? Boolean(route)
)

const open = ref(false)

function normalize(path: string) {
  // drop trailing slash except root
  return path !== '/' ? path.replace(/\/+$/, '') : '/'
}

function isActive(href: string) {
  const current = route ? normalize(route.path) : normalize(window.location.pathname)
  const target = normalize(href)
  if (props.exact) return current === target
  // prefix match but keep whole segment boundaries: /kanban matches /kanban/board, not /kanbanish
  return current === target || current.startsWith(target + '/')
}
</script>

<style>
:root {
  --nav-bg: #005493;
  --nav-ink: #fff;
  --nav-hover: rgba(255,255,255,.14);
}

nav.nav { background: var(--nav-bg); color: var(--nav-ink); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.nav-inner { max-width: 1120px; margin: 0 auto; padding: .75rem 1rem; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .75rem; }
.brand-text { font-weight: 800; letter-spacing: .2px; color: var(--nav-ink); font-size: 1.125rem; }

.nav-links { display: none; list-style: none; margin: 0; padding: 0; gap: .25rem; align-items: center; justify-self: end; }
.nav-link { display: inline-flex; align-items: center; padding: .5rem .75rem; border-radius: 8px; color: var(--nav-ink); text-decoration: none; font-weight: 600; opacity: .95; transition: background 160ms ease, opacity 160ms ease; }
.nav-link:hover { background: var(--nav-hover); opacity: 1; }
.nav-link.active, .nav-link[aria-current="page"] { background: rgba(255,255,255,.22); }

.nav-toggle { appearance: none; border: 0; background: transparent; padding: .25rem; border-radius: 8px; display: inline-flex; flex-direction: column; gap: 4px; cursor: pointer; }
.nav-toggle:hover { background: rgba(255,255,255,.12); }
.bar { width: 22px; height: 2px; background: var(--nav-ink); border-radius: 2px; display: block; }

.nav-drawer { border-top: 1px solid rgba(255,255,255,.15); background: var(--nav-bg); }
.drawer-links { list-style: none; margin: 0; padding: .5rem; display: grid; gap: .25rem; }
.drawer-link { display: block; color: var(--nav-ink); text-decoration: none; padding: .625rem .75rem; border-radius: 8px; font-weight: 600; }
.drawer-link:hover { background: var(--nav-hover); }
.drawer-link.active, .drawer-link[aria-current="page"] { background: rgba(255,255,255,.22); }

.fade-enter-active, .fade-leave-active { transition: opacity 160ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (min-width: 768px) {
  .nav-links { display: inline-flex; }
  .nav-toggle { display: none; }
}
</style>
