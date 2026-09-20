<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ author: string }>();

const initials = computed(() =>
  props.author
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(""),
);
</script>

<template>
  <span class="byline">
    <span class="avatar" aria-hidden="true">{{ initials }}</span>
    {{ author }}
  </span>
</template>
