<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import PostCard from "../components/PostCard.vue";
import ApiError from "../components/ApiError.vue";
import { fetchPosts, type Post } from "../lib/api";

const PER_PAGE = 4;

const posts = ref<Post[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;

  try {
    const result = await fetchPosts(PER_PAGE, (page.value - 1) * PER_PAGE);
    posts.value = result.data;
    total.value = result.total;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(page, load);

const lastPage = () => Math.max(1, Math.ceil(total.value / PER_PAGE));
</script>

<template>
  <ApiError v-if="error" :message="error" />

  <ul v-else-if="loading" class="post-list">
    <li v-for="n in 3" :key="n" class="skeleton skeleton--card" />
  </ul>

  <template v-else>
    <p v-if="!posts.length" class="notice">Todavía no hay nada publicado.</p>

    <ul v-else class="post-list">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </ul>

    <nav v-if="total > PER_PAGE" class="pager" aria-label="Paginación">
      <button class="button" :disabled="page === 1" @click="page--">
        ← Anteriores
      </button>
      <span class="pager__status">Página {{ page }} de {{ lastPage() }}</span>
      <button class="button" :disabled="page >= lastPage()" @click="page++">
        Siguientes →
      </button>
    </nav>
  </template>
</template>
