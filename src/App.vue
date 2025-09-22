<script setup></script>

<template>
    <!-- <div>
        <nav class="p-4 bg-gray-100">
            <router-link to="/home" class="mr-4">Home</router-link>
            <router-link to="/login" class="mr-4">Login</router-link>
            <router-link to="/register">Register</router-link>
        </nav>
    </div> -->
    <router-view />
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
