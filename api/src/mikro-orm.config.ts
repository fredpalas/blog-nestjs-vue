import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import { Post } from './contexts/blog/post/domain/post.entity.js';

/**
 * Configuración única, compartida por la aplicación (app.module.ts), el
 * arranque que migra y siembra (main.ts) y la CLI de MikroORM.
 *
 * Las variables de entorno son las que inyecta Podium cuando el podium.yaml
 * declara `database.enable: true` con los campos sueltos — ver el podium.yaml
 * de la raíz. En local las pone el .env contra el Postgres del compose.
 */
export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  user: process.env.DB_USER ?? 'app',
  password: process.env.DB_PASSWORD ?? '!ChangeMe!',
  dbName: process.env.DB_NAME ?? 'app',
  entities: [Post],
  allowGlobalContext: true,
  extensions: [Migrator, SeedManager],
  pool: {
    min: 1,
    max: 2,
  },
  driverOptions: {
    connection: {
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
      pool: { min: 1, max: 2 },
    },
  },
  migrations: {
    // Ruta del build: en producción corre el JS compilado, no el TS.
    path: './dist/migrations',
    pathTs: './src/migrations',
    // Transaccionales: si una migración falla a medias, no deja la base en un
    // estado intermedio del que nadie se acuerde luego.
    emit: 'ts',
    transactional: true,
    disableForeignKeys: false,
  },
  seeder: {
    path: './dist/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
    emit: 'ts',
  },
});
