<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  recipe: { type: Object as () => any, default: null },
});

const emit = defineEmits(['update:modelValue']);

function close() {
  emit('update:modelValue', false);
}

const parsedIngredients = computed(() => {
  const ings = props.recipe?.ingredients;
  if (Array.isArray(ings)) return ings;
  if (typeof ings === 'string') {
    return ings
      .split(/\r?\n|,|;/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [] as string[];
});

const parsedInstructions = computed(() => {
  const ins = props.recipe?.prepMethod;
  if (Array.isArray(ins)) return ins.filter(Boolean);
  if (typeof ins === 'string') {
    const trimmed = ins.trim();
    if (!trimmed) return [] as string[];
    return trimmed.split(/[.?!;,\r\n]+/).map(s => s.trim()).filter(Boolean);
  }
  return [] as string[];
});
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="close" />
    <div class="bg-bg-surface border border-border-primary rounded-lg p-6 z-10 w-full max-w-2xl mx-4 overflow-auto max-h-[80vh]">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold text-text-primary">{{ recipe?.name ?? 'Receita' }}</h2>
          <p class="text-text-secondary text-sm mt-1">{{ recipe?.category?.name ?? '—' }}</p>
        </div>
        <div class="flex items-center gap-3 text-sm text-text-tertiary">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            <span>{{ recipe?.prepTimeMinutes ?? '–' }} min</span>
          </div>
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2c1.1 0 2 .9 2 2v3h-4V4c0-1.1.9-2 2-2z"></path>
              <path d="M5 8h14v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8z"></path>
            </svg>
            <span>{{ recipe?.servings ?? '–' }} porção<span v-if="recipe?.servings !== 1">es</span></span>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <h3 class="text-sm font-semibold text-text-primary">Ingredientes</h3>
        <ul class="list-disc pl-5 mt-2 text-text-secondary text-sm">
          <li v-for="(ing, idx) in parsedIngredients" :key="idx">{{ ing }}</li>
          <li v-if="parsedIngredients.length === 0">Nenhum ingrediente informado</li>
        </ul>
      </div>

      <div class="mt-4">
        <h3 class="text-sm font-semibold text-text-primary">Modo de preparo</h3>
        <div class="mt-2 text-text-secondary text-sm">
          <template v-if="parsedInstructions.length">
            <p v-for="(p, idx) in parsedInstructions" :key="idx" class="mb-3 whitespace-pre-wrap">{{ p }}</p>
          </template>
          <p v-else class="text-text-secondary">Nenhuma instrução disponível.</p>
        </div>
      </div>

      <div class="mt-6 text-right">
        <button class="px-4 py-2 rounded-lg border border-border-primary text-text-secondary hover:bg-bg-elevated" @click="close">Fechar</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
