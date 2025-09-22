<template>
    <div class="max-w-sm mx-auto mt-20">
        <h2 class="text-xl font-bold mb-4">Register</h2>
        <form @submit.prevent="register">
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
                Register
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'

const email = ref('')
const password = ref('')

const register = async () => {
    try {
        await createUserWithEmailAndPassword(auth, email.value, password.value)
        alert('Register success!')
    } catch (err) {
        alert(err.message)
    }
}
</script>
<style scoped></style>
