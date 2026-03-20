import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/recipes',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../modules/auth/LoginPage.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../modules/auth/RegisterPage.vue'),
    },
    {
      path: '/recipes',
      name: 'Recipes',
      component: () => import('../modules/recipes/RecipesPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const isAuthenticated = !!auth.user;
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});
