# Blog — NestJS + Vue 3

El blog de PHP Barcelona en dos servicios dentro de un mismo repo: la API en
NestJS y el frontend en Vue 3. Es la quinta traducción del mismo dominio —
[`php-barcelona`](../php-barcelona) ya lo tiene en Go, Java, Python y Rust — y
además sirve de banco de pruebas para las plantillas de monorepo de
[Podium](../podium): un `podium.yaml` con dos servicios, cada uno con su propia
plantilla de build y su propia URL pública.

```
api/    NestJS 11 + MikroORM (copiado de php-barcelona/ts-test)
web/    Vue 3 + Vite + vue-router
```

## Arrancarlo en local

**1. Base de datos** (Postgres vacío — el esquema y los datos los crea la propia
API al arrancar):

```bash
docker compose up -d
```

**2. API** en `http://localhost:3000`:

```bash
cd api
cp .env.example .env
npm install
npm run build
npm run start:prod
```

```bash
curl "http://localhost:3000/api/posts?limit=5&order=desc"
```

Al arrancar, la API aplica las migraciones pendientes y siembra el blog si está
vacío: cinco posts publicados y uno en borrador, que sirve para comprobar que el
filtro de estado funciona. Es idempotente —arrancar otra vez no duplica nada— y
se puede desactivar con `MIGRATE_ON_BOOT=false`.

**3. Frontend** en `http://localhost:5173`:

```bash
cd web
npm install
npm run dev
```

Si la API no está en el puerto 3000, pásaselo al frontend:
`VITE_API_URL=http://localhost:3100 npm run dev`.

## La API

Un único endpoint, el mismo contrato que el resto de traducciones:

```
GET /api/posts?limit=10&offset=0&sort=createdAt&order=asc
```

```json
{ "data": [ { "id": "...", "title": "...", "slug": "...", "content": "...",
             "author": "...", "authorId": "...", "showTitle": true,
             "status": "published", "createdAt": "...", "updatedAt": "..." } ],
  "total": 5, "page": 1, "per_page": 10 }
```

Sólo devuelve los posts con `status = 'published'`. No hay endpoint por slug: el
frontend pide una página amplia y busca ahí, en lugar de inventarse un contrato
que el backend no tiene.

## Cómo encuentra el frontend a la API

Sin configuración y sin variables de entorno en el build (`web/src/lib/api.ts`):

| Dónde corre | A dónde llama |
|---|---|
| `localhost` | `VITE_API_URL`, o `http://localhost:3000` |
| `web-{hash}.apperture.dev` | `api-{hash}.apperture.dev` — sustituye el prefijo |
| cualquier otro dominio | el mismo origen |

Los dos servicios de un proyecto de Podium comparten hash, así que el frontend
puede deducir dónde está su API sin saber el hash de antemano.

## Desplegarlo en Podium

`podium.yaml` declara los dos servicios. Al registrar el repo, Podium descubre
`api` y `web`, construye cada uno con su plantilla (`nodejs/nestjs` y
`nodejs/vue`) y publica dos URLs.

La base de datos la monta Podium: el bloque `database:` del `podium.yaml` declara
**dónde** quiere la aplicación recibir cada dato (`${DB_NAME}`, `${DB_USER}`…), y
el chart crea un `Cluster` de CNPG para el servicio e inyecta ahí las credenciales
que CNPG genera. El esquema y los datos los pone la propia API al arrancar, que es
la única ventana que hay: un tenant no puede ejecutar comandos aparte.

Una cosa que **hoy** no funciona todavía en un despliegue real, y que no es culpa
de este repo:

- **Las variables del bloque `environment:` no llegan al pod todavía**: el chart
  de tenant inyecta las de base de datos, pero no las demás. Por eso el frontend
  deriva la URL de la API del hostname en vez de leerla de una variable, y por
  eso los valores por defecto del código están elegidos para funcionar sin
  configuración.

Montar este repo destapó además un fallo en la plantilla `nodejs/nestjs` de
Podium, ya corregido allí: arrancaba con `npm start`, que en cualquier proyecto
generado por el CLI de Nest es `nest start` —el CLI recompilando dentro del
contenedor de producción en cada reinicio del pod—. Ahora usa
`npm run start:prod`.

## Qué se cambió respecto a `php-barcelona/ts-test`

El código de la API viene de ahí tal cual, con estos ajustes:

- **CORS** (`app.enableCors`): el frontend vive en otro dominio, así que sin esto
  el navegador descarta la respuesta aunque la API conteste 200.
- **Workers por defecto**: de 10 fijos a uno por CPU con tope de 2. Un tenant de
  Podium corre con 1 CPU y ~1 Gi, y diez workers se comen la memoria antes de
  servir la primera petición.
- **`.env.example`** en lugar de un `.env` con valores reales.
- **Migraciones y seeder** (`@mikro-orm/migrations`, `@mikro-orm/seeder`), con la
  configuración de MikroORM extraída a `src/mikro-orm.config.ts` para que la
  compartan la aplicación, el arranque y la CLI. El proceso primario prepara la
  base **antes** de levantar los workers: que varios migren a la vez es una
  carrera con final incierto.
