<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/use-theme';
import { useAuthStore } from '../store/auth';
import AppButton from './AppButton.vue';

defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  showTheme: { type: Boolean, default: true },
  showLogout: { type: Boolean, default: true },
});

const emit = defineEmits(['back']);
const router = useRouter();
const auth = useAuthStore();
const { isDark, toggleTheme } = useTheme();

function onBack() {
  emit('back');
  router.back();
}

async function onLogout() {
  await auth.logoutAsync();
  router.push('/login');
}
</script>

<template>
  <header class="border-b border-border-primary bg-bg-surface">
    <div class="px-6 py-2 max-w-4xl mx-auto w-full grid grid-cols-3 items-center">
      <div class="flex items-center">
        <div v-if="showBack">
          <AppButton variant="ghost" class="!py-2" @click="onBack">←</AppButton>
        </div>
      </div>

      <div class="flex justify-center">
        <h1 class="text-text-primary font-bold text-lg text-center">{{ title }}</h1>
      </div>

      <div class="flex items-center justify-end gap-2">
        <button
          v-if="showTheme"
          class="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          :title="isDark ? 'Tema claro' : 'Tema escuro'"
          @click="toggleTheme"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <AppButton v-if="showLogout" variant="ghost" class="!py-2 !px-4 text-sm" @click="onLogout">Sair</AppButton>
      </div>
    </div>
  </header>
</template>
