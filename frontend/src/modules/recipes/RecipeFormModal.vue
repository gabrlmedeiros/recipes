<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { recipesService, type Recipe, type Category, type RecipeInput } from './';
import AppButton from '../../components/AppButton.vue';
import AppInput from '../../components/AppInput.vue';

const props = defineProps<{
  open: boolean;
  recipe?: Recipe | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [recipe: Recipe];
}>();

const categories = ref<Category[]>([]);
const loading = ref(false);
const errors = ref<string[]>([]);

const form = reactive<RecipeInput>({
  categoryId: '',
  name: '',
  prepTimeMinutes: 0,
  servings: 0,
  prepMethod: '',
  ingredients: '',
});

onMounted(async () => {
  categories.value = await recipesService.getCategories();
});

watch(() => props.open, (open) => {
  if (!open) return;
  errors.value = [];
  if (props.recipe) {
    form.categoryId = props.recipe.category.id;
    form.name = props.recipe.name;
    form.prepTimeMinutes = props.recipe.prepTimeMinutes;
    form.servings = props.recipe.servings;
    form.prepMethod = props.recipe.prepMethod;
    form.ingredients = props.recipe.ingredients;
  } else {
    form.categoryId = '';
    form.name = '';
    form.prepTimeMinutes = 0;
    form.servings = 0;
    form.prepMethod = '';
    form.ingredients = '';
  }
});

async function handleSubmit() {
  errors.value = [];
  loading.value = true;
  try {
    const requestPromise = props.recipe
      ? recipesService.update(props.recipe.id, form)
      : recipesService.create(form);

    const timeoutMs = 15000;
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs));

    const saved = await Promise.race([requestPromise, timeoutPromise]);
    if (!saved) throw new Error('Resposta inválida do servidor');
    const savedRecipe = saved as Recipe;
    emit('saved', savedRecipe);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: { message?: string; details?: { field?: string; message?: string; code?: string }[] } } } };
    const apiError = err.response?.data?.error;
    if (Array.isArray(apiError?.message) && apiError.message.length > 0) {
      errors.value = (apiError.message as any).map((m: any) => (typeof m === 'string' ? m : String(m)));
    } else if ((e as Error).message === 'timeout') {
      errors.value = ['Tempo de espera esgotado ao salvar receita. Tente novamente.'];
    } else {
      errors.value = [apiError?.message ?? 'Erro ao salvar receita.'];
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60" />

      <!-- Modal -->
      <div class="relative w-full max-w-lg bg-bg-surface border border-border-primary rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-border-primary">
          <h2 class="text-text-primary font-bold text-lg">
            {{ recipe ? 'Editar receita' : 'Nova receita' }}
          </h2>
          <button
            class="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form class="p-6 flex flex-col gap-5" @submit.prevent="handleSubmit">
          <AppInput
            v-model="form.name"
            label="Nome da receita"
            placeholder="Ex: Bolo de cenoura"
          />

          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
              Categoria
            </label>
            <select
              v-model="form.categoryId"
              class="w-full px-4 py-3 rounded-lg bg-bg-input border border-border-primary text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
            >
              <option :value="0" disabled>Selecione uma categoria</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <AppInput
              v-model="form.prepTimeMinutes as unknown as string"
              label="Tempo de preparo (min)"
              type="number"
              placeholder="Ex: 60"
            />
            <AppInput
              v-model="form.servings as unknown as string"
              label="Porções"
              type="number"
              placeholder="Ex: 4"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
              Ingredientes
            </label>
            <textarea
              v-model="form.ingredients"
              placeholder="Liste os ingredientes..."
              rows="3"
              class="w-full px-4 py-3 rounded-lg bg-bg-input border border-border-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors text-sm resize-none"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
              Modo de preparo
            </label>
            <textarea
              v-model="form.prepMethod"
              placeholder="Descreva o passo a passo..."
              rows="4"
              class="w-full px-4 py-3 rounded-lg bg-bg-input border border-border-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors text-sm resize-none"
            />
          </div>

          <div v-if="errors.length" class="text-xs text-destructive text-center">
            <p class="font-semibold">{{ errors[0] }}</p>
            <ul class="mt-1 list-disc list-inside">
              <li v-for="(e, i) in errors.slice(1)" :key="i">{{ e }}</li>
            </ul>
          </div>

          <div class="flex gap-3 pt-1">
            <AppButton
              type="button"
              variant="ghost"
              class="flex-1"
              @click="emit('close')"
            >
              Cancelar
            </AppButton>
            <AppButton
              type="submit"
              class="flex-1"
              :loading="loading"
            >
              {{ recipe ? 'Salvar' : 'Criar receita' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
