export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  author: string;
  authorId: string;
  showTitle: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostList {
  data: Post[];
  total: number;
  page: number;
  per_page: number;
}

/**
 * Dónde vive la API.
 *
 * En Podium cada servicio del mismo repo se publica como
 * `{serviceName}-{hash}.apperture.dev`, con el mismo hash para todos. Este
 * frontend es el servicio `web` y la API es `api`, así que basta sustituir el
 * prefijo del propio hostname: no hace falta conocer el hash de antemano ni
 * inyectar variables de entorno en el build, que hoy Podium no hace.
 *
 * En local manda `VITE_API_URL`, y si no está, el puerto por defecto de Nest.
 */
export function apiBaseUrl(): string {
  const { hostname, protocol, origin } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  }

  if (hostname.startsWith("web-")) {
    return `${protocol}//${hostname.replace(/^web-/, "api-")}`;
  }

  // Desplegado en otro sitio (un dominio propio, o servido por el mismo
  // origen que la API): se asume mismo origen antes que adivinar.
  return origin;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`La API respondió ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchPosts(limit: number, offset: number): Promise<PostList> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    sort: "createdAt",
    order: "desc",
  });

  return getJson<PostList>(`/api/posts?${params}`);
}

/**
 * La API sólo expone el listado, no un endpoint por slug. Para el detalle se
 * pide una página amplia y se busca ahí: con el volumen de un blog es
 * suficiente, y evita inventar un contrato que el backend no tiene.
 */
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const { data } = await fetchPosts(100, 0);

  return data.find((post) => post.slug === slug) ?? null;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** El contenido llega en texto plano con párrafos separados por línea en blanco. */
export function toParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function readingMinutes(content: string): number {
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
}
