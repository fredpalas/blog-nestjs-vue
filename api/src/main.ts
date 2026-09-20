// main.ts
import './tracing.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cluster from 'cluster';
import * as os from 'os';
import { MikroORM } from '@mikro-orm/postgresql';
import mikroOrmConfig from './mikro-orm.config.js';
import { DatabaseSeeder } from './seeders/DatabaseSeeder.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // El frontend se sirve desde otro dominio (web-{hash} vs api-{hash} en
  // Podium, puertos distintos en local), así que sin CORS el navegador
  // descarta la respuesta aunque la API conteste 200.
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? '*' });

  const shutdown = async (signal: string) => {
    console.log(`Worker ${process.pid} received ${signal}. Shutting down...`);
    await app.close();
    process.exit(0);
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ Worker ${process.pid} started on port ${process.env.PORT ?? 3000}`);
}

// Clustering logic
/**
 * Deja la base lista antes de servir: aplica las migraciones pendientes y
 * siembra si está vacía.
 *
 * Corre en el proceso primario y antes de levantar los workers, por dos
 * razones: que N workers migren a la vez es una carrera con final incierto, y
 * un tenant de Podium no tiene forma de ejecutar comandos aparte — el pod
 * arranca y punto, así que esto es la única ventana que hay.
 *
 * Se puede desactivar con MIGRATE_ON_BOOT=false para quien prefiera gestionar
 * su esquema a mano.
 */
async function prepareDatabase(): Promise<void> {
  if (process.env.MIGRATE_ON_BOOT === 'false') {
    console.log('⏭️  MIGRATE_ON_BOOT=false: no se toca la base de datos');
    return;
  }

  const orm = await MikroORM.init(mikroOrmConfig);

  try {
    const pending = await orm.getMigrator().getPendingMigrations();
    if (pending.length > 0) {
      console.log(`🗃️  Aplicando ${pending.length} migración(es) pendiente(s)...`);
      await orm.getMigrator().up();
    }

    await orm.getSeeder().seed(DatabaseSeeder);
    console.log('✅ Base de datos lista');
  } finally {
    await orm.close(true);
  }
}

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  // Por defecto, uno por CPU con tope de 2: un tenant de Podium corre con
  // 1 CPU y ~1 Gi, y diez workers ahí se comen la memoria antes de servir
  // la primera petición.
  const workers = parseInt(
    process.env.CLUSTER_WORKERS ?? String(Math.min(numCPUs, 2)),
    10,
  );

  console.log(`🚀 Master ${process.pid} starting`);
  console.log(`📊 CPU Info:`);
  console.log(`   - Total CPUs/threads: ${numCPUs}`);
  console.log(`   - Starting workers: ${workers}`);
  console.log(`   - OTEL enabled: ${process.env.OTEL_ENABLED !== 'false'}`);
  console.log('─'.repeat(50));

  // Fork workers — sólo cuando la base está lista, para que ningún worker
  // reciba tráfico contra un esquema que todavía no existe.
  prepareDatabase()
    .then(() => {
      for (let i = 0; i < workers; i++) {
        cluster.fork();
      }
    })
    .catch((error) => {
      console.error('❌ No se pudo preparar la base de datos:', error);
      process.exit(1);
    });

  // Handle worker exits
  cluster.on('exit', (worker, code, signal) => {
    console.log(`❌ Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    cluster.fork();
  });

  // Handle worker online
  cluster.on('online', (worker) => {
    console.log(`📍 Worker ${worker.process.pid} is online`);
  });

  // Handle master shutdown
  const shutdownMaster = async (signal: string) => {
    console.log(`\n🛑 Master received ${signal}. Shutting down all workers...`);

    for (const id in cluster.workers) {
      cluster.workers[id]?.kill('SIGTERM');
    }

    // Give workers time to shutdown gracefully
    setTimeout(() => {
      console.log('👋 Master exiting');
      process.exit(0);
    }, 5000);
  };

  process.once('SIGTERM', () => void shutdownMaster('SIGTERM'));
  process.once('SIGINT', () => void shutdownMaster('SIGINT'));

} else {
  // Worker process
  bootstrap().catch((error) => {
    console.error(`❌ Worker ${process.pid} bootstrap error:`, error);
    process.exit(1);
  });
}
