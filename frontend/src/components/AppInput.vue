<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  label?: string;
  modelValue: string;
  type?: string;
  placeholder?: string;
  error?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const showPassword = ref(false);

const isPassword = computed(() => props.type === 'password');
const inputType = computed(() => {
  if (isPassword.value) return showPassword.value ? 'text' : 'password';
  return props.type ?? 'text';
});
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        class="w-full px-4 py-3 rounded-lg bg-bg-input border border-border-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors text-sm"
        :class="{ 'pr-11': isPassword }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center px-3 text-text-tertiary hover:text-text-secondary transition-colors"
        @click="showPassword = !showPassword"
      >
        <!-- Eye open -->
        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <!-- Eye closed -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
          <line x1="2" x2="22" y1="2" y2="22"/>
        </svg>
      </button>
    </div>
    <span v-if="error" class="text-xs text-destructive">{{ error }}</span>
  </div>
</template>
