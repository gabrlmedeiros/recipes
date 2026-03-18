<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    loading?: boolean;
    variant?: 'primary' | 'ghost';
    fullWidth?: boolean;
  }>(),
  { type: 'button', loading: false, variant: 'primary', fullWidth: false },
);
</script>

<template>
  <button
    :type="type"
    :disabled="loading"
    :class="[
      'px-6 py-3 rounded-lg font-semibold text-sm transition-all focus:outline-none cursor-pointer disabled:cursor-not-allowed',
      fullWidth && 'w-full',
      variant === 'ghost'
        ? 'text-text-secondary border border-border-primary hover:border-primary hover:text-primary'
        : 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50',
    ]"
  >
    <span v-if="loading" class="flex items-center justify-center gap-2">
      <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      Carregando...
    </span>
    <slot v-else />
  </button>
</template>
