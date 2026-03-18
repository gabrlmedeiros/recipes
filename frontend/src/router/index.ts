import { createRouter, createWebHistory } from 'vue-router';

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
  const isAuthenticated = !!localStorage.getItem('token');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});
