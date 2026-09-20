<script setup lang="ts">
import { apiBaseUrl } from "../lib/api";

defineProps<{ message: string }>();
</script>

<template>
  <div class="notice" role="alert">
    <p style="margin: 0 0 8px"><strong>No se han podido cargar los posts.</strong></p>
    <p style="margin: 0">
      {{ message }} — se intentó contra <code>{{ apiBaseUrl() }}</code
      >. Comprueba que la API está levantada y que permite este origen.
    </p>
  </div>
</template>
