const hasLocalAuth = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return Boolean(localStorage.getItem('token') || user?.isAuthenticated || user?.uid || user?.id)
  } catch {
    return Boolean(localStorage.getItem('token'))
  }
}

const openAuthDrawer = () => {
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
  })
}

const requireAuth = (redirectTo) => () => {
  if (hasLocalAuth()) return true

  openAuthDrawer()
  return redirectTo
}

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
    // redirect: '/crypto-trader',
  },
  {
    path: '/stocks-analysis',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/stocks-fundamentals'),
    children: [
      { path: '', component: () => import('pages/StocksPage.vue'), props: { route: 'analysis' } },
    ],
  },
  {
    path: '/stocks-analyzer',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/stocks-fundamentals'),
    children: [
      { path: '', component: () => import('pages/StocksPage.vue'), props: { route: 'analyzer' } },
    ],
  },
  {
    path: '/stocks-top100',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/stocks-fundamentals'),
    children: [
      { path: '', component: () => import('pages/StocksPage.vue'), props: { route: 'top100' } },
    ],
  },
  {
    path: '/stocks-trader',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/stocks-fundamentals'),
    children: [
      { path: '', component: () => import('pages/StocksPage.vue'), props: { route: 'trader' } },
    ],
  },
  {
    path: '/stocks-fundamentals',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/StocksPage.vue'),
        props: { route: 'fundamentals' },
      },
    ],
  },
  {
    path: '/stocks-resources',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/stocks-fundamentals'),
    children: [
      { path: '', component: () => import('pages/StocksPage.vue'), props: { route: 'resources' } },
    ],
  },
  {
    path: '/bonds-analysis',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/bonds-fundamentals'),
    children: [
      { path: '', component: () => import('pages/BondsPage.vue'), props: { route: 'analysis' } },
    ],
  },
  {
    path: '/bonds-fundamentals',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/BondsPage.vue'),
        props: { route: 'fundamentals' },
      },
    ],
  },
  {
    path: '/bonds-resources',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/bonds-fundamentals'),
    children: [
      { path: '', component: () => import('pages/BondsPage.vue'), props: { route: 'resources' } },
    ],
  },
  {
    path: '/math-analysis',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/math-fundamentals'),
    children: [
      { path: '', component: () => import('pages/MathPage.vue'), props: { route: 'analysis' } },
    ],
  },
  {
    path: '/math-fundamentals',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/MathPage.vue'),
        props: { route: 'fundamentals' },
      },
    ],
  },
  {
    path: '/math-resources',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/math-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/MathPage.vue'),
        props: { route: 'resources' },
      },
    ],
  },
  {
    path: '/math-examer',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/math-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/MathPage.vue'),
        props: { route: 'examer' },
      },
    ],
  },

  {
    path: '/trading-analysis',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/trading-fundamentals'),
    children: [
      { path: '', component: () => import('pages/TradingPage.vue'), props: { route: 'analysis' } },
    ],
  },
  {
    path: '/trading-fundamentals',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/TradingPage.vue'),
        props: { route: 'fundamentals' },
      },
    ],
  },
  {
    path: '/trading-resources',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/TradingPage.vue'), props: { route: 'resources' } },
    ],
  },

  {
    path: '/mindset-analysis',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MindsetPage.vue'), props: { route: 'analysis' } },
    ],
  },
  {
    path: '/mindset-fundamentals',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/MindsetPage.vue'),
        props: { route: 'fundamentals' },
      },
    ],
  },
  {
    path: '/mindset-resources',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MindsetPage.vue'), props: { route: 'resources' } },
    ],
  },
  {
    path: '/real-estate-analysis',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/real-estate-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/RealEstatePage.vue'),
        props: { route: 'analysis' },
      },
    ],
  },
  {
    path: '/real-estate-fundamentals',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/RealEstatePage.vue'),
        props: { route: 'fundamentals' },
      },
    ],
  },
  {
    path: '/real-estate-resources',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/real-estate-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/RealEstatePage.vue'),
        props: { route: 'resources' },
      },
    ],
  },

  {
    path: '/crypto-analysis',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/crypto-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'analysis' },
      },
    ],
  },
  {
    path: '/crypto-fundamentals',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'fundamentals' },
      },
    ],
  },
  {
    path: '/crypto-top100',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/crypto-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'top100' },
      },
    ],
  },
  {
    path: '/crypto-unlock-calendar',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/crypto-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'unlock-calendar' },
      },
    ],
  },
  {
    path: '/crypto-resources',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/crypto-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'resources' },
      },
    ],
  },
  {
    path: '/crypto-trader',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/crypto-watcher'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'trader' },
      },
    ],
  },
  {
    path: '/crypto-watcher',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'watcher' },
      },
    ],
  },
  {
    path: '/crypto-list',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/crypto-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'list' },
      },
    ],
  },
  {
    path: '/crypto-long-term',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth('/crypto-fundamentals'),
    children: [
      {
        path: '',
        component: () => import('pages/CryptoPage.vue'),
        props: { route: 'long-term' },
      },
    ],
  },

  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/DashboardPage.vue') }],
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/AdminPage.vue') }],
  },
  {
    path: '/profile',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/UserPage.vue'),
        props: { route: 'profile' },
      },
    ],
  },
  {
    path: '/daily',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/UserPage.vue'),
        props: { route: 'daily-pnl' },
      },
    ],
  },
  {
    path: '/achievements',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/UserPage.vue'),
        props: { route: 'achievements' },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
