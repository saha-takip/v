import Vue from 'vue'
import Router from 'vue-router'

import layout from '../layout'


Vue.use(Router)

export default new Router({
  linkExactActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  mode: 'hash',
  base: '/',
  routes: [
    {
      path: '/',
      component: layout,
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
          name: 'transaction-detail',
          path: '/tahsilat-hareketleri/detay/:id',
          component: () => import('@/pages/transactions/detail')
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
      path: '/basic-ui',
      component: layout,
      children: [
        {
          path: 'buttons',
          name: 'buttons',
          component: () => import('@/pages/basic-ui/buttons')
        },
        {
          path: 'dropdowns',
          name: 'dropdowns',
          component: () => import('@/pages/basic-ui/dropdowns')
        },
        {
          path: 'typography',
          name: 'typography',
          component: () => import('@/pages/basic-ui/typography')
        }
      ]
    },
    {
      path: '/charts',
      component: layout,
      children: [
        {
          path: 'chartjs',
          name: 'chartjs',
          component: () => import('@/pages/charts/chartjs')
        },
      ]
    },
    {
      path: '/tables',
      component: layout,
      children: [
        {
          path: 'basic-tables',
          name: 'basic-tables',
          component: () => import('@/pages/tables/basic-tables')
        }
      ]
    },
    {
      path: '/auth',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/pages/samples/auth-pages/login')
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/pages/samples/auth-pages/register')
        }
      ]
    },
    {
      path: '/error-pages',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        {
          path: 'error-404',
          name: 'error-404',
          component: () => import('@/pages/samples/error-pages/error-404')
        },
        {
          path: 'error-500',
          name: 'error-500',
          component: () => import('@/pages/samples/error-pages/error-500')
        }
      ]
    },
    {
      path: '/icons',
      component: layout,
      children: [
        {
          path: 'mdi-icons',
          name: 'mdi-icons',
          component: () => import('@/pages/icons/mdi-icons')
        }
      ]
    },
    {
      path: '*',
      redirect: '/error-404',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        {
          path: 'error-404',
          component: () => import('@/pages/samples/error-pages/error-404')
        }
      ]
    }
  ]
})
