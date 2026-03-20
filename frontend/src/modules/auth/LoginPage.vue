<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ login: '', password: '' });
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await authStore.login(form.value.login, form.value.password);
    router.push('/recipes');
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: { message?: string } } } };
    error.value = err.response?.data?.error?.message ?? 'Erro ao entrar. Tente novamente.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg-page flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 text-5xl">
          🍽️
        </div>
        <h1 class="text-2xl font-bold text-text-primary">Bem-vindo de volta</h1>
        <p class="text-text-secondary text-sm mt-1">Entre na sua conta para continuar</p>
      </div>

      <div class="bg-bg-surface border border-border-primary rounded-2xl p-6">
        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <AppInput v-model="form.login" label="Login" placeholder="Seu login" />
          <AppInput v-model="form.password" label="Senha" type="password" placeholder="Sua senha" />

          <p
            v-if="error"
            class="text-xs text-destructive text-center py-2 px-3 rounded-lg border border-destructive/20 bg-red-950/20"
          >
            {{ error }}
          </p>

          <AppButton type="submit" :loading="loading" :full-width="true" class="mt-1">
            Entrar
          </AppButton>
        </form>
      </div>

      <p class="text-center text-text-secondary text-sm mt-6">
        Não tem uma conta?
        <RouterLink to="/register" class="text-primary hover:opacity-80 transition-opacity font-medium">
          Criar conta
        </RouterLink>
      </p>
    </div>
  </div>
</template>
