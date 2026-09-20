<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import AuthorByline from "./AuthorByline.vue";
import { formatDate, readingMinutes, toParagraphs, type Post } from "../lib/api";

const props = defineProps<{ post: Post }>();

const excerpt = computed(() => toParagraphs(props.post.content)[0] ?? "");
</script>

<template>
  <li>
    <RouterLink class="card" :to="{ name: 'post', params: { slug: post.slug } }">
      <div class="card__meta">
        <AuthorByline :author="post.author" />
        <span class="dot">{{ formatDate(post.createdAt) }}</span>
        <span class="dot">{{ readingMinutes(post.content) }} min</span>
      </div>
      <h2 v-if="post.showTitle" class="card__title">{{ post.title }}</h2>
      <p class="card__excerpt">{{ excerpt }}</p>
    </RouterLink>
  </li>
</template>
