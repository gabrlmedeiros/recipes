<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import AppButton from '../../components/AppButton.vue';
import { useTheme } from '../../composables/use-theme';

const router = useRouter();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();

// Will be populated when recipes CRUD is implemented
const recipes = ref([]);

async function handleLogout() {
  await authStore.logoutAsync();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-bg-page">
    <header class="flex items-center justify-between px-6 py-4 border-b border-border-primary bg-bg-surface">
      <span class="text-text-primary font-bold text-lg">🍽️ Receitas</span>
      <div class="flex items-center gap-2">
        <button
          @click="toggleTheme"
          class="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          :title="isDark ? 'Tema claro' : 'Tema escuro'"
        >
          <!-- sun -->
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
          <!-- moon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <AppButton variant="ghost" class="!py-2 !px-4 text-sm" @click="handleLogout">
          Sair
        </AppButton>
      </div>
    </header>

    <main class="p-6">
      <div v-if="recipes.length === 0" class="flex flex-col items-center justify-center py-24 gap-3">
        <span class="text-5xl">🍽️</span>
        <p class="text-text-secondary font-semibold text-base mt-3">Nenhuma receita ainda</p>
        <p class="text-text-tertiary text-sm">Suas receitas aparecerão aqui</p>
      </div>
    </main>
  </div>
</template>
