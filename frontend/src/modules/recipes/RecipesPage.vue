<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '../../components/AppButton.vue';
import AppHeader from '../../components/AppHeader.vue';
import { recipesService, type Recipe } from './';
import RecipeFormModal from './RecipeFormModal.vue';
import ConfirmModal from '../../components/ConfirmModal.vue';

const router = useRouter();

const recipes = ref<Recipe[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const page = ref(1);
const totalPages = ref(1);
const modalOpen = ref(false);
const editingRecipe = ref<Recipe | null>(null);
const deletingId = ref<string | null>(null);
const confirmOpen = ref(false);
const confirmTargetId = ref<string | null>(null);
const confirmLoading = ref(false);
const confirmTitle = ref('Excluir receita');
const confirmMessage = ref('Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.');
function goToRecipe(id: string) {
  router.push({ name: 'RecipeDetails', params: { id } });
}

const servingsText = (servings?: number | null) => {
  if (servings == null) return '–';
  return `${servings} porção${servings === 1 ? '' : 'es'}`;
};

void servingsText;

async function loadRecipes() {
  loading.value = true;
  errorMessage.value = null;
  try {
    const result = await recipesService.list(page.value);
      const raw = result.recipes ?? [];
      const valid = raw.filter((r) => r && typeof (r as any).id === 'string');
      const invalidCount = raw.length - valid.length;
      if (invalidCount > 0) {
        console.warn('Receitas inválidas recebidas da API (serão descartadas):', raw.filter((r) => !r || typeof (r as any).id !== 'string'));
      }
    recipes.value = valid;
    totalPages.value = result.pagination.totalPages;
  } catch (err: unknown) {
    const message = (err as any)?.response?.data?.error?.message ?? (err as Error).message ?? 'Erro ao carregar receitas.';
    errorMessage.value = message;
    recipes.value = [];
    totalPages.value = 1;
    console.error('loadRecipes error', err);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingRecipe.value = null;
  modalOpen.value = true;
}

function openEdit(recipe: Recipe) {
  editingRecipe.value = recipe;
  modalOpen.value = true;
}

async function onSaved(saved: Recipe) {
  modalOpen.value = false;
  if (editingRecipe.value) {
    const idx = recipes.value.findIndex(r => r.id === saved.id);
    if (idx !== -1) recipes.value[idx] = saved;
  } else {
    page.value = 1;
    await loadRecipes();
  }
}

function deleteRecipe(id: string) {
  confirmTargetId.value = id;
  confirmOpen.value = true;
}

async function onConfirmDelete() {
  const id = confirmTargetId.value;
  if (!id) return;
  confirmLoading.value = true;
  deletingId.value = id;
  try {
    await recipesService.delete(id);
    recipes.value = recipes.value.filter(r => r.id !== id);
  } catch (err) {
    console.error('deleteRecipe error', err);
  } finally {
    confirmLoading.value = false;
    deletingId.value = null;
    confirmOpen.value = false;
    confirmTargetId.value = null;
  }
}

onMounted(loadRecipes);
</script>

<template>
  <div class="min-h-screen bg-bg-page">
    <AppHeader title="🍽️ Receitas" :show-back="false" />

    <main class="p-6 max-w-4xl mx-auto">
      <!-- Toolbar -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-text-primary font-bold text-xl">Minhas receitas</h1>
        <AppButton class="!py-2 !px-4 text-sm" @click="openCreate">
          + Nova receita
        </AppButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="errorMessage" class="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <p class="text-destructive font-semibold">{{ errorMessage }}</p>
        <div>
          <AppButton class="!py-2 !px-4 text-sm" @click="loadRecipes">Tentar novamente</AppButton>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="recipes.length === 0" class="flex flex-col items-center justify-center py-24 gap-3">
        <span class="text-5xl">🍽️</span>
        <p class="text-text-secondary font-semibold text-base mt-3">Nenhuma receita ainda</p>
        <p class="text-text-tertiary text-sm">Clique em "Nova receita" para começar</p>
      </div>

      <!-- Recipe list -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="recipe in recipes"
          :key="recipe.id"
          class="bg-bg-surface border border-border-primary rounded-xl p-5 flex flex-col gap-2"
        >
          <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0 cursor-pointer" @click="goToRecipe(recipe.id)">
                <h2 class="text-text-primary font-semibold text-base truncate">{{ recipe.name }}</h2>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-text-secondary bg-bg-elevated px-2 py-0.5 rounded-full">
                  {{ recipe.category?.name ?? '–' }}
                </span>
                  <span class="text-xs text-text-tertiary flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-tertiary">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                    <span> {{ recipe.prepTimeMinutes ?? '–' }} min</span>
                  </span>
                  <span class="text-xs text-text-tertiary flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-tertiary">
                      <path d="M12 2c1.1 0 2 .9 2 2v3h-4V4c0-1.1.9-2 2-2z"></path>
                      <path d="M5 8h14v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8z"></path>
                    </svg>
                    <span> {{ servingsText(recipe.servings) }} </span>
                  </span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                class="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                title="Editar"
                @click="openEdit(recipe)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
              </button>
              <button
                :disabled="deletingId === recipe.id"
                class="p-2 rounded-lg text-text-tertiary hover:text-destructive hover:bg-bg-elevated transition-colors disabled:opacity-40"
                title="Excluir"
                @click="deleteRecipe(recipe.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
          <button
            :disabled="page === 1"
            class="px-3 py-1.5 rounded-lg text-sm text-text-secondary border border-border-primary hover:bg-bg-elevated disabled:opacity-40 transition-colors"
            @click="page--; loadRecipes()"
          >
            ← Anterior
          </button>
          <span class="text-text-tertiary text-sm">{{ page }} / {{ totalPages }}</span>
          <button
            :disabled="page === totalPages"
            class="px-3 py-1.5 rounded-lg text-sm text-text-secondary border border-border-primary hover:bg-bg-elevated disabled:opacity-40 transition-colors"
            @click="page++; loadRecipes()"
          >
            Próxima →
          </button>
        </div>
      </div>
    </main>

    <RecipeFormModal
      :open="modalOpen"
      :recipe="editingRecipe"
      @close="modalOpen = false"
      @saved="onSaved"
    />
    <ConfirmModal
      v-model:model-value="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-label="Excluir"
      cancel-label="Cancelar"
      :loading="confirmLoading"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

