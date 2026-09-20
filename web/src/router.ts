import { createRouter, createWebHistory } from "vue-router";
import PostListView from "./views/PostListView.vue";
import PostView from "./views/PostView.vue";

export const router = createRouter({
  // Historial real, no hash: la plantilla nodejs/vue de Podium sirve con
  // nginx y un try_files hacia index.html, así que una ruta profunda abierta
  // en frío también resuelve.
  history: createWebHistory(),
  routes: [
    { path: "/", name: "posts", component: PostListView },
    { path: "/posts/:slug", name: "post", component: PostView, props: true },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
