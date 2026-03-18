import { ref } from 'vue';

const isDark = ref(true);

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('light', !dark);
}

export function useTheme() {
  function init() {
    const stored = localStorage.getItem('theme');
    isDark.value = stored !== 'light';
    applyTheme(isDark.value);
  }

  function toggleTheme() {
    isDark.value = !isDark.value;
    applyTheme(isDark.value);
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  }

  return { isDark, init, toggleTheme };
}
