<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import AuthorByline from "../components/AuthorByline.vue";
import ApiError from "../components/ApiError.vue";
import {
  fetchPostBySlug,
  formatDate,
  readingMinutes,
  toParagraphs,
  type Post,
} from "../lib/api";

const props = defineProps<{ slug: string }>();

const post = ref<Post | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    post.value = await fetchPostBySlug(props.slug);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <RouterLink class="back" to="/">← Todos los posts</RouterLink>

  <ApiError v-if="error" :message="error" />

  <div v-else-if="loading" class="skeleton skeleton--card" />

  <p v-else-if="!post" class="notice">
    No existe ningún post publicado con ese enlace.
  </p>

  <article v-else class="article">
    <h1 v-if="post.showTitle" class="article__title">{{ post.title }}</h1>
    <div class="article__meta">
      <AuthorByline :author="post.author" />
      <span class="dot">{{ formatDate(post.createdAt) }}</span>
      <span class="dot">{{ readingMinutes(post.content) }} min de lectura</span>
    </div>
    <div class="article__body">
      <p v-for="(paragraph, index) in toParagraphs(post.content)" :key="index">
        {{ paragraph }}
      </p>
    </div>
  </article>
</template>
