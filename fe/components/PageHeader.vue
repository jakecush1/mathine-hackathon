<template>
  <header>
    <AppNavbar :items="navItems">

    </AppNavbar>
  </header>
</template>

<script setup lang="ts">
import AppNavbar from './Navbar.vue'

const navItems = [
  { label: 'Kanban', href: '/kanban', active: true },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Braindump', href: '/braindump' }
]
</script>
