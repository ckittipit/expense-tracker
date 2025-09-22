import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/config'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const routes = [
    { path: '/home', component: Home, meta: { requiresAuth: true } },
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const user = auth.currentUser

    to.meta.requiresAuth && !user ? next('/login') : next()
})

export default router
