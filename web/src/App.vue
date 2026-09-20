<script setup lang="ts">
import { RouterView } from "vue-router";
import AppMasthead from "./components/AppMasthead.vue";
</script>

<template>
  <div class="shell">
    <AppMasthead />
    <hr class="rule" />
    <main>
      <RouterView />
    </main>
    <footer class="colophon">
      <span>API en NestJS · Frontend en Vue 3</span>
      <span>Desplegado con Podium</span>
    </footer>
  </div>
</template>
