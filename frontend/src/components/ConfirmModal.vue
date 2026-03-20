<script setup lang="ts">

defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Confirmação' },
  message: { type: String, default: 'Tem certeza?' },
  confirmLabel: { type: String, default: 'Confirmar' },
  cancelLabel: { type: String, default: 'Cancelar' },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

function close() {
  emit('update:modelValue', false);
}

function onConfirm() {
  emit('confirm');
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="close" />
    <div class="bg-bg-surface border border-border-primary rounded-lg p-6 z-10 w-full max-w-md">
      <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
      <p class="text-text-secondary mt-3">{{ message }}</p>

      <div class="mt-6 flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-lg border border-border-primary text-text-secondary hover:bg-bg-elevated"
          :disabled="loading"
          @click="close"
        >
          {{ cancelLabel }}
        </button>
        <button
          class="px-4 py-2 rounded-lg hover:opacity-95 flex items-center gap-2"
          :style="{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }"
          :disabled="loading"
          @click="onConfirm"
        >
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <svg v-else class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.3" />
            <path d="M22 12a10 10 0 0 1-10 10" />
          </svg>
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* minimal scoped styles; rely on tailwind for look */
</style>
