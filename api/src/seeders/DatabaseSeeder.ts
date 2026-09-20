import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Post } from '../contexts/blog/post/domain/post.entity.js';

/**
 * Contenido de arranque del blog.
 *
 * Idempotente a propósito: corre en cada arranque de la aplicación (ver
 * main.ts) y no hace nada si ya hay posts. Un tenant de Podium no tiene forma
 * de ejecutar comandos aparte — el pod arranca y ya —, así que sembrar tiene
 * que ser parte del arranque y poder repetirse sin duplicar nada.
 */
export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    if ((await em.count(Post)) > 0) {
      return;
    }

    for (const post of POSTS) {
      em.create(Post, post);
    }

    await em.flush();
  }
}

const AUTHOR_ADRIAN = '0199a1f0-2222-7000-8000-000000000001';
const AUTHOR_MARTA = '0199a1f0-2222-7000-8000-000000000002';

const POSTS = [
  {
    id: '0199a1f0-1111-7000-8000-000000000001',
    title: 'Desplegar cualquier repo en 60 segundos',
    slug: 'desplegar-cualquier-repo-en-60-segundos',
    content: `Un hackathon se pierde en el último tramo: el proyecto funciona en el portátil y muere camino de la mesa del jurado.

La parte interesante no es construir la imagen, es todo lo demás: un dominio con TLS, aislamiento entre equipos que no se conocen, y que la URL siga viva doce horas después de que la escribieras en la libreta.

Este post recorre el camino completo: del commit al contenedor, del contenedor al Ingress, y del Ingress a un móvil cualquiera con datos móviles.`,
    author: 'Adrián Pastén',
    authorId: AUTHOR_ADRIAN,
    showTitle: true,
    status: 'published',
    createdAt: new Date('2026-09-18T09:00:00Z'),
    updatedAt: new Date('2026-09-18T09:00:00Z'),
  },
  {
    id: '0199a1f0-1111-7000-8000-000000000002',
    title: 'El mismo dominio, cinco lenguajes',
    slug: 'el-mismo-dominio-cinco-lenguajes',
    content: `Escribir la misma API en Go, Java, Python, Rust y TypeScript no es un ejercicio de estilo: es la forma más honesta de comprobar si un modelo de dominio se sostiene fuera del lenguaje donde nació.

Lo que sobrevive a la traducción —los nombres, los límites del agregado, qué decisión vive dónde— es el modelo de verdad. Lo que no sobrevive era andamiaje del framework.

Spoiler: los DTO sobreviven casi intactos. Los repositorios, casi nunca.`,
    author: 'Adrián Pastén',
    authorId: AUTHOR_ADRIAN,
    showTitle: true,
    status: 'published',
    createdAt: new Date('2026-09-15T18:30:00Z'),
    updatedAt: new Date('2026-09-16T08:10:00Z'),
  },
  {
    id: '0199a1f0-1111-7000-8000-000000000003',
    title: 'Worker mode no es gratis',
    slug: 'worker-mode-no-es-gratis',
    content: `FrankenPHP en worker mode mantiene el kernel vivo entre peticiones, y eso cambia las reglas: un servicio que guarda el usuario actual deja de ser un detalle y pasa a ser una fuga de datos entre visitantes.

La prueba más barata que conozco es un contador estático. En modo classic vuelve a uno en cada petición. En worker mode sube. Si sube, el estado persiste; y todo lo que persiste hay que mirarlo dos veces.`,
    author: 'Adrián Pastén',
    authorId: AUTHOR_ADRIAN,
    showTitle: true,
    status: 'published',
    createdAt: new Date('2026-09-12T11:45:00Z'),
    updatedAt: new Date('2026-09-12T11:45:00Z'),
  },
  {
    id: '0199a1f0-1111-7000-8000-000000000004',
    title: 'Aislar a desconocidos en tu propio clúster',
    slug: 'aislar-a-desconocidos-en-tu-propio-cluster',
    content: `Abrir un clúster a equipos que no conoces es un ejercicio de desconfianza bien organizada: un namespace por proyecto, cuota de CPU y memoria, políticas de red que cierran el tráfico lateral, y un TTL que lo borra todo cuando el evento acaba.

La parte que más se olvida es la salida: sin restringir el egress, cualquier contenedor puede hablar con el resto de tu red interna. Y eso no se nota hasta que se nota.`,
    author: 'Marta Ruiz',
    authorId: AUTHOR_MARTA,
    showTitle: true,
    status: 'published',
    createdAt: new Date('2026-09-08T16:20:00Z'),
    updatedAt: new Date('2026-09-09T07:00:00Z'),
  },
  {
    id: '0199a1f0-1111-7000-8000-000000000005',
    title: 'Un agente que ensaya tu demo',
    slug: 'un-agente-que-ensaya-tu-demo',
    content: `La idea es simple de contar y difícil de construir: describes tu demo en lenguaje natural, el agente la ejecuta contra la aplicación desplegada, lee logs y eventos cuando algo falla, arregla lo que puede arreglar y te dice exactamente qué está roto cuando no puede.

Este post es el diseño, no el anuncio: el contrato de herramientas, el bucle de tres intentos, y por qué el agente nunca escribe en el repositorio del equipo.`,
    author: 'Marta Ruiz',
    authorId: AUTHOR_MARTA,
    showTitle: true,
    status: 'published',
    createdAt: new Date('2026-09-05T10:05:00Z'),
    updatedAt: new Date('2026-09-05T10:05:00Z'),
  },
  {
    // En borrador a propósito: el repositorio sólo devuelve publicados, así que
    // sirve para comprobar que el filtro de estado se aplica de verdad.
    id: '0199a1f0-1111-7000-8000-000000000006',
    title: 'Borrador: notas sueltas sobre caché',
    slug: 'borrador-notas-sueltas-sobre-cache',
    content:
      'Notas a medio escribir. No debería verse en el frontend: su status es draft y el repositorio sólo devuelve los publicados.',
    author: 'Adrián Pastén',
    authorId: AUTHOR_ADRIAN,
    showTitle: true,
    status: 'draft',
    createdAt: new Date('2026-09-19T12:00:00Z'),
    updatedAt: new Date('2026-09-19T12:00:00Z'),
  },
];
