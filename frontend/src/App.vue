<script setup lang="ts">
import { onMounted } from 'vue';
import { useTheme } from './composables/use-theme';

const { init } = useTheme();
onMounted(init);
</script>

<template>
  <RouterView />
</template>
