import Vue from 'vue'
import Router from 'vue-router'
import { supabase } from "@/supabase"
import layout from '../layout'

Vue.use(Router)

const router = new Router({
  linkExactActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/v/' : '/',
  routes: [
    {
      path: '/',
      component: layout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/dashboard')
        },
        {
          path: '/musteriler',
          name: 'customers',
          component: () => import('@/pages/customers')
        },
        {
          name: 'transactions',
          path: '/tahsilat-hareketleri',
          component: () => import('@/pages/transactions')
        },
        {
          path: '/bolge-yonetimi',
          name: 'group-management',
          component: () => import('@/pages/group-management')
        },
        {
          path: '/profil-bilgileri',
          name: 'profile-information',
          component: () => import('@/pages/profile-information')
        }
      ]
    },
    {
      path: '/auth',
      component: {
        render(c) { return c('router-view') }
      },
      children: [
        {
          path: 'giris',
          name: 'login',
          component: () => import('@/pages/auth-pages/login')
        },
        {
          path: 'sifremi-unuttum',
          name: 'forgot-password',
          component: () => import('@/pages/auth-pages/forgot-password')
        },
        {
          path: 'sifre-sifirlama',
          name: 'reset-password',
          component: () => import('@/pages/auth-pages/reset-password')
        }
      ]
    },
    {
      path: '*',
      redirect: '/404',
      component: {
        render(c) { return c('router-view') }
      },
      children: [
        {
          path: '404',
          component: () => import('@/pages/error-pages/404')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const user = supabase.auth.user();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // 1. Eğer kullanıcı giriş yapmışsa
  if (user) {
    // Şifre sıfırlama sayfasındaysa, giriş yapmış olsa bile kovma (şifresini değiştirsin)
    if (to.name === 'reset-password') {
      return next();
    }

    // Diğer auth sayfalarına (login/register) gitmeye çalışıyorsa dashboard'a at
    if (to.name === 'login' || to.name === 'register') {
      return next({ name: 'dashboard' });
    }
  }

  // 2. Auth gereken sayfaya giriş yapmış mı kontrolü
  if (requiresAuth && !user) {
    return next({ name: 'login' });
  }

  next();
});

export default router;
