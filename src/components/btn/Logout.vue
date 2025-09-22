<template>
    <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded">
        Logout
    </button>
</template>

<script setup>
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

const logout = async () => {
    await signOut(auth)
    alert('Logged out!')
}
</script>
