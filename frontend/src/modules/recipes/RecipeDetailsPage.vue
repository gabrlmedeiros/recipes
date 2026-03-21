<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { recipesService, type Recipe } from './';
import { recipesPrint } from './services/recipes.service';
import AppButton from '../../components/AppButton.vue';
import AppHeader from '../../components/AppHeader.vue';
import RecipeFormModal from './RecipeFormModal.vue';

const route = useRoute();
const id = String(route.params.id ?? '');


const recipe = ref<Recipe | null>(null);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const modalOpen = ref(false);
const printing = ref(false);
let pollingHandle: number | null = null;

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

function openEdit() {
  if (!recipe.value) return;
  modalOpen.value = true;
}

async function handlePrint() {
  if (!recipe.value?.id) return;
  try {
    printing.value = true;
    const { jobId } = await recipesPrint.print(recipe.value.id);
    const base = import.meta.env.VITE_API_URL ?? '';
    pollingHandle = window.setInterval(async () => {
      try {
        const statusResp = await recipesPrint.status(jobId);
        if (statusResp.status === 'DONE') {
          if (pollingHandle) {
            clearInterval(pollingHandle);
            pollingHandle = null;
          }
          printing.value = false;
          try {
            const url = `${base}/prints/${jobId}/download`;
            const resp = await fetch(url);
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            const w = window.open('about:blank');
            if (w) {
              const htmlStart = `<!doctype html><html><head><title>Imprimir</title><style>html,body{height:100%;margin:0}</style></head><body><embed src="${blobUrl}" type="application/pdf" width="100%" height="100%"></embed><script>window.onload=function(){setTimeout(function(){window.focus();window.print();},500);};`;
              const htmlEnd = '</scr' + 'ipt></body></html>';
              const html = htmlStart + htmlEnd;
              w.document.open();
              w.document.write(html);
              w.document.close();
            } else {
              window.open(url, '_blank');
            }
          } catch (e) {
            window.open(`${base}/prints/${jobId}/download`, '_blank');
          }
        } else if (statusResp.status === 'FAILED') {
          if (pollingHandle) {
            clearInterval(pollingHandle);
            pollingHandle = null;
          }
          printing.value = false;
          alert('Falha ao preparar impressão');
        }
      } catch (e) {
        // ignore and retry
      }
    }, 1500);
  } catch (err) {
    printing.value = false;
    alert('Falha ao enviar para impressão');
  }
}

async function onSaved(saved: Recipe) {
  recipe.value = saved;
  modalOpen.value = false;
}
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
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-2xl font-semibold text-text-primary">{{ recipe.name }}</h2>
            <div class="flex-shrink-0 flex items-center gap-2">
              <AppButton class="!py-1 !px-3 text-sm" :disabled="printing" variant="ghost" @click="handlePrint">{{ printing ? 'Preparando...' : 'Imprimir' }}</AppButton>
              <AppButton class="!py-1 !px-3 text-sm" variant="ghost" @click="openEdit">Editar</AppButton>
            </div>
        </div>

        <div class="flex items-center gap-3 mt-3 text-sm text-text-secondary">
          <div class="flex items-center gap-3 flex-1">
            <span class="px-2 py-0.5 rounded-full bg-bg-elevated">{{ recipe.category?.name ?? '–' }}</span>
            <span>• {{ recipe.prepTimeMinutes ?? '–' }} min</span>
            <span>• {{ recipe.servings ?? '–' }} porção{{ recipe.servings === 1 ? '' : 'es' }}</span>
          </div>
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
    <RecipeFormModal :open="modalOpen" :recipe="recipe" @close="modalOpen = false" @saved="onSaved" />
  </div>
</template>
