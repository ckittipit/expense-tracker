<template>
    <div class="max-w-sm mx-auto mt-20">
        <h2 class="text-xl font-bold mb-4">Login</h2>
        <form @submit.prevent="login">
            <input
                v-model="email"
                type="email"
                placeholder="Email"
                class="border p-2 w-full mb-2"
            />
            <input
                v-model="password"
                type="password"
                placeholder="Password"
                class="border p-2 w-full mb-2"
            />
            <button class="bg-blue-500 text-white px-4 py-2 rounded">
                LOGIN
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useRouter } from 'vue-router'
const router = useRouter()

const email = ref('')
const password = ref('')

const login = async () => {
    try {
        await signInWithEmailAndPassword(auth, email.value, password.value)

        router.push('/home')
    } catch (err) {
        alert(err.message)
    }
}
</script>
<style scoped></style>
