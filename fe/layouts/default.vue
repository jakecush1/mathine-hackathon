<template>
	<PageHeader />
	<slot />
	<PageFooter />
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'

</script>


<style lang="scss">
	#__nuxt {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		.uv-main {
			flex: 1 1 auto;
		}
	}
</style>