<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { recipesService, type Recipe } from './';
import AppButton from '../../components/AppButton.vue';
import AppHeader from '../../components/AppHeader.vue';

const route = useRoute();
const id = String(route.params.id ?? '');


const recipe = ref<Recipe | null>(null);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const ingredients = computed(() => {
  const v = recipe.value?.ingredients;
  if (!v) return [] as string[];
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === 'string') {
    return v.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean);
  }
  return [] as string[];
});

const steps = computed(() => {
  const v = recipe.value?.prepMethod;
  if (!v) return [] as string[];
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === 'string') {
    return v.trim().split(/[.?!;\r\n]+/).map(s => s.trim()).filter(Boolean);
  }
  return [] as string[];
});

async function load() {
  if (!id) {
    errorMessage.value = 'ID de receita inválido.';
    return;
  }
  loading.value = true;
  errorMessage.value = null;
  try {
    recipe.value = await recipesService.getById(id);
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.error?.message ?? (err.message ?? 'Erro ao carregar a receita.');
  } finally {
    loading.value = false;
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return '–';
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

onMounted(load);
</script>

<template>
  <div class="min-h-screen bg-bg-page">
    <AppHeader title="Detalhes da receita" :show-back="true" />

    <main class="p-6 max-w-4xl mx-auto">
      <div v-if="loading" class="flex justify-center py-24">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="errorMessage" class="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <p class="text-destructive font-semibold">{{ errorMessage }}</p>
        <div>
          <AppButton class="!py-2 !px-4 text-sm" @click="load">Tentar novamente</AppButton>
        </div>
      </div>

      <article v-else-if="recipe" class="bg-bg-surface border border-border-primary rounded-xl p-6">
        <h2 class="text-2xl font-semibold text-text-primary">{{ recipe.name }}</h2>
        <div class="flex items-center gap-3 mt-3 text-sm text-text-secondary">
          <span class="px-2 py-0.5 rounded-full bg-bg-elevated">{{ recipe.category?.name ?? '–' }}</span>
          <span>• {{ recipe.prepTimeMinutes ?? '–' }} min</span>
          <span>• {{ recipe.servings ?? '–' }} porção{{ recipe.servings === 1 ? '' : 'es' }}</span>
        </div>

        <section class="mt-6">
          <h3 class="text-lg font-semibold text-text-primary">Ingredientes</h3>
          <ul class="list-disc pl-5 mt-2 text-text-secondary text-sm">
            <li v-for="(ing, idx) in ingredients" :key="idx">{{ ing }}</li>
          </ul>
        </section>

        <section class="mt-6">
          <h3 class="text-lg font-semibold text-text-primary">Modo de preparo</h3>
          <ol class="list-decimal pl-5 mt-2 text-text-secondary text-sm">
            <li v-for="(s, idx) in steps" :key="idx">{{ s }}</li>
          </ol>
        </section>

        <footer class="mt-6 text-text-tertiary text-xs">Criado em: {{ formatDate(recipe.createdAt) }} • Última atualização: {{ formatDate(recipe.updatedAt) }}</footer>
      </article>
    </main>
  </div>
</template>
