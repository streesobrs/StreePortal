import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('@/views/HomeView.vue')
    },
    {
        path: '/tools',
        component: () => import('@/views/ToolsView.vue')
    },
    {
        path: '/about',
        component: () => import('@/views/AboutView.vue')
    },
    // 其他路由...
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 在 router/index.js 添加导航守卫
router.beforeEach((to, from, next) => {
    console.log(`Navigating to: ${to.path}`)
    next()
})

export default router
