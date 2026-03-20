<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps<{
  modelValue?: string;
  categories?: { id: string; name: string }[];
  valueFilters?: Record<string, any>;
  debounce?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'search', q: string): void;
  (e: 'apply', filters: Record<string, any>): void;
  (e: 'clear'): void;
}>();

const q = ref(props.modelValue ?? '');
const showFilters = ref(false);
const root = ref<HTMLElement | null>(null);
function toggleFilters() {
  showFilters.value = !showFilters.value;
  console.debug('RecipeSearchFilters: showFilters ->', showFilters.value);
}
const localFilters = ref({
  categoryId: '',
  ingredient: '',
  minPrepTime: null as number | null,
  maxPrepTime: null as number | null,
  sortBy: '',
  order: 'desc',
  ...(props.valueFilters ?? {}),
});
const debounceMs = props.debounce ?? 450;
let timer: number | null = null;

watch(q, () => {
  emit('update:modelValue', q.value);
  if (timer) clearTimeout(timer as unknown as number);
  timer = window.setTimeout(() => emit('search', q.value), debounceMs) as unknown as number;
});

function onEnter() {
  if (timer) clearTimeout(timer as unknown as number);
  emit('search', q.value);
}

function apply() {
  emit('apply', localFilters.value);
  showFilters.value = false;
}

function clearAll() {
  q.value = '';
  localFilters.value = {
    categoryId: '',
    ingredient: '',
    minPrepTime: null,
    maxPrepTime: null,
    sortBy: '',
    order: 'desc',
  };
  emit('update:modelValue', '');
  emit('clear');
}

function removeFilter(key: string) {
  if (key === 'categoryId') localFilters.value.categoryId = '';
  if (key === 'ingredient') localFilters.value.ingredient = '';
  if (key === 'minPrepTime') localFilters.value.minPrepTime = null;
  if (key === 'maxPrepTime') localFilters.value.maxPrepTime = null;
  if (key === 'prepTime') {
    localFilters.value.minPrepTime = null;
    localFilters.value.maxPrepTime = null;
  }
  if (key === 'sortBy') localFilters.value.sortBy = '';
  if (key === 'order') localFilters.value.order = 'desc';
  emit('apply', localFilters.value);
}

const activeFilters = computed(() => {
  const list: { key: string; label: string }[] = [];
  if (localFilters.value.categoryId) {
    const cat = (props.categories ?? []).find((c: any) => c.id === localFilters.value.categoryId);
    list.push({ key: 'categoryId', label: `Categoria: ${cat?.name ?? localFilters.value.categoryId}` });
  }
  if (localFilters.value.ingredient) {
    list.push({ key: 'ingredient', label: `Ingrediente: ${localFilters.value.ingredient}` });
  }
  if (localFilters.value.minPrepTime != null || localFilters.value.maxPrepTime != null) {
    const min = localFilters.value.minPrepTime ?? '–';
    const max = localFilters.value.maxPrepTime ?? '–';
    list.push({ key: 'prepTime', label: `Tempo: ${min}–${max} min` });
  }
  if (localFilters.value.sortBy) {
    const order = localFilters.value.order === 'asc' ? 'Asc' : 'Desc';
    const map: Record<string, string> = {
      createdAt: 'Mais recentes',
      name: 'Nome',
      prepTimeMinutes: 'Tempo de preparo',
    };
    const label = map[localFilters.value.sortBy] ?? localFilters.value.sortBy;
    list.push({ key: 'sortBy', label: `Ordenar: ${label} (${order})` });
  }
  return list;
});

function onDocumentClick(e: MouseEvent) {
  const el = root.value;
  if (!el) return;
  const target = e.target as Node | null;
  if (showFilters.value && target && !el.contains(target)) {
    showFilters.value = false;
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));
</script>

<template>
  <div ref="root" class="relative w-full mb-6">
    <div class="w-full flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
      <input v-model="q" type="text" placeholder="Buscar receitas, ingredientes ou modo de preparo" aria-label="Buscar receitas" class="search-input w-full bg-bg-surface border border-border-primary rounded-lg px-10 py-2 focus:outline-none placeholder:text-text-tertiary" @keydown.enter.prevent="onEnter" />
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
        <circle cx="11" cy="11" r="7"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <button v-if="q" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1" @click="(q = '', emit('update:modelValue', ''), emit('search', ''))">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      </div>

      <div class="flex w-full sm:w-auto items-center justify-end sm:justify-start gap-2">
      <button type="button" title="Filtros" class="p-2 w-full sm:w-auto rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors" @click="toggleFilters">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l7 9v7l6 2v-9z"/></svg>
      </button>
      <button type="button" title="Buscar" class="p-2 w-full sm:w-auto rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors" @click="emit('search', q)">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>
    </div>

    </div>

    <!-- Active filter chips (visible under the search input) -->
    <div v-if="activeFilters.length" class="mt-2 w-full">
      <div class="flex flex-wrap gap-2">
        <template v-for="f in activeFilters" :key="f.key">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-elevated text-text-secondary text-sm">
            <span>{{ f.label }}</span>
            <button type="button" class="ml-1 text-text-tertiary hover:text-text-primary" @click="removeFilter(f.key)" :aria-label="`Remover filtro ${f.label}`">✕</button>
          </span>
        </template>
      </div>
    </div>

    <div v-show="showFilters" :class="['mt-2 w-full sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-64 bg-bg-surface border border-border-primary rounded-lg p-3 z-50 transform origin-top-right transition-transform transition-opacity duration-150 ease-out shadow-lg', showFilters ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none']">
      <div class="grid grid-cols-1 gap-3 items-start">
        <div>
          <label class="sr-only">Categoria</label>
          <select v-model="localFilters.categoryId" :class="['w-full bg-bg-surface border border-border-primary rounded-lg px-3 py-2', localFilters.categoryId ? 'text-text-primary' : 'text-text-tertiary']">
            <option value="">Categoria</option>
            <option v-for="c in props.categories ?? []" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="sr-only">Ingrediente</label>
          <input v-model="localFilters.ingredient" type="text" placeholder="Ingrediente" class="w-full bg-bg-surface border border-border-primary rounded-lg px-3 py-2 placeholder:text-text-tertiary" />
        </div>

        <div class="min-w-0">
          <label class="text-sm font-semibold text-text-secondary mb-1">Tempo de preparo (min)</label>
          <div class="flex gap-2">
            <input v-model.number="localFilters.minPrepTime" type="number" min="0" placeholder="Min" class="flex-1 min-w-0 bg-bg-surface border border-border-primary rounded-lg px-3 py-2" />
            <input v-model.number="localFilters.maxPrepTime" type="number" min="0" placeholder="Max" class="flex-1 min-w-0 bg-bg-surface border border-border-primary rounded-lg px-3 py-2" />
          </div>
        </div>

        <div>
          <label class="text-sm font-semibold text-text-secondary mb-1">Ordenar por</label>
          <select v-model="localFilters.sortBy" :class="['w-full bg-bg-surface border border-border-primary rounded-lg px-3 py-2', localFilters.sortBy ? 'text-text-primary' : 'text-text-tertiary']">
            <option value="">Ordenar</option>
            <option value="createdAt">Mais recentes</option>
            <option value="name">Nome</option>
            <option value="prepTimeMinutes">Tempo de preparo</option>
          </select>
        </div>

        <div>
          <label class="text-sm font-semibold text-text-secondary mb-1">Ordem</label>
          <select v-model="localFilters.order" :class="['w-full bg-bg-surface border border-border-primary rounded-lg px-3 py-2', localFilters.order ? 'text-text-primary' : 'text-text-tertiary']">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        <div class="flex justify-end items-center gap-2">
          <button class="px-3 py-2 rounded-lg text-sm border border-border-primary" @click="clearAll">Limpar</button>
          <button class="px-4 py-2 rounded-lg bg-primary text-primary-foreground" @click="apply">Aplicar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-input::placeholder {
  color: var(--color-text-tertiary);
  opacity: 0.55;
}
</style>
