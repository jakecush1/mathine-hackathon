<template>
	<NuxtLayout>
		<PageMain :title="`Error ${error.statusCode}`" :layout="pageLayout">
			<PageSection>
				<p>{{error.message}}</p>
				<p v-html="error.description"></p>
			</PageSection>
		</PageMain>
	</NuxtLayout>
</template>

<script setup lang="ts">
  const pageTitle = 'Error'
  const pageLayout = "info"


  const props = defineProps({
    error: Object
  })

  const handleError = () => clearError({ redirect: '/' })
</script>