-- Esquema de `posts`, copiado del blog original (php-barcelona,
-- migrations/Version20250223194810.php) más las dos columnas que la entidad
-- de MikroORM espera: show_title y status.
CREATE TABLE IF NOT EXISTS posts (
    id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    author_id UUID NOT NULL,
    show_title BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(0) WITH TIME ZONE NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts (status, created_at);

-- Datos de ejemplo. `status = 'draft'` en el último a propósito: el
-- repositorio solo devuelve publicados, así que sirve para comprobar que el
-- filtro se aplica de verdad y no aparece en el frontend.
INSERT INTO posts (id, title, content, slug, author, author_id, show_title, status, created_at, updated_at) VALUES
('0199a1f0-1111-7000-8000-000000000001',
 'Desplegar cualquier repo en 60 segundos',
 E'Un hackathon se pierde en el último tramo: el proyecto funciona en el portátil y muere camino de la mesa del jurado.\n\nLa parte interesante no es construir la imagen, es todo lo demás: un dominio con TLS, aislamiento entre equipos que no se conocen, y que la URL siga viva doce horas después de que la escribieras en la libreta.\n\nEste post recorre el camino completo: del commit al contenedor, del contenedor al Ingress, y del Ingress a un móvil cualquiera con datos móviles.',
 'desplegar-cualquier-repo-en-60-segundos', 'Adrián Pastén', '0199a1f0-2222-7000-8000-000000000001', true, 'published',
 '2026-09-18 09:00:00+00', '2026-09-18 09:00:00+00'),

('0199a1f0-1111-7000-8000-000000000002',
 'El mismo dominio, cinco lenguajes',
 E'Escribir la misma API en Go, Java, Python, Rust y TypeScript no es un ejercicio de estilo: es la forma más honesta de comprobar si un modelo de dominio se sostiene fuera del lenguaje donde nació.\n\nLo que sobrevive a la traducción —los nombres, los límites del agregado, qué decisión vive dónde— es el modelo de verdad. Lo que no sobrevive era andamiaje del framework.\n\nSpoiler: los DTO sobreviven casi intactos. Los repositorios, casi nunca.',
 'el-mismo-dominio-cinco-lenguajes', 'Adrián Pastén', '0199a1f0-2222-7000-8000-000000000001', true, 'published',
 '2026-09-15 18:30:00+00', '2026-09-16 08:10:00+00'),

('0199a1f0-1111-7000-8000-000000000003',
 'Worker mode no es gratis',
 E'FrankenPHP en worker mode mantiene el kernel vivo entre peticiones, y eso cambia las reglas: un servicio que guarda el usuario actual deja de ser un detalle y pasa a ser una fuga de datos entre visitantes.\n\nLa prueba más barata que conozco es un contador estático. En modo classic vuelve a uno en cada petición. En worker mode sube. Si sube, el estado persiste; y todo lo que persiste hay que mirarlo dos veces.',
 'worker-mode-no-es-gratis', 'Adrián Pastén', '0199a1f0-2222-7000-8000-000000000001', true, 'published',
 '2026-09-12 11:45:00+00', '2026-09-12 11:45:00+00'),

('0199a1f0-1111-7000-8000-000000000004',
 'Aislar a desconocidos en tu propio clúster',
 E'Abrir un clúster a equipos que no conoces es un ejercicio de desconfianza bien organizada: un namespace por proyecto, cuota de CPU y memoria, políticas de red que cierran el tráfico lateral, y un TTL que lo borra todo cuando el evento acaba.\n\nLa parte que más se olvida es la salida: sin restringir el egress, cualquier contenedor puede hablar con el resto de tu red interna. Y eso no se nota hasta que se nota.',
 'aislar-a-desconocidos-en-tu-propio-cluster', 'Marta Ruiz', '0199a1f0-2222-7000-8000-000000000002', true, 'published',
 '2026-09-08 16:20:00+00', '2026-09-09 07:00:00+00'),

('0199a1f0-1111-7000-8000-000000000005',
 'Un agente que ensaya tu demo',
 E'La idea es simple de contar y difícil de construir: describes tu demo en lenguaje natural, el agente la ejecuta contra la aplicación desplegada, lee logs y eventos cuando algo falla, arregla lo que puede arreglar y te dice exactamente qué está roto cuando no puede.\n\nEste post es el diseño, no el anuncio: el contrato de herramientas, el bucle de tres intentos, y por qué el agente nunca escribe en el repositorio del equipo.',
 'un-agente-que-ensaya-tu-demo', 'Marta Ruiz', '0199a1f0-2222-7000-8000-000000000002', true, 'published',
 '2026-09-05 10:05:00+00', '2026-09-05 10:05:00+00'),

('0199a1f0-1111-7000-8000-000000000006',
 'Borrador: notas sueltas sobre caché',
 E'Notas a medio escribir. No debería verse en el frontend: su status es draft y el repositorio solo devuelve los publicados.',
 'borrador-notas-sueltas-sobre-cache', 'Adrián Pastén', '0199a1f0-2222-7000-8000-000000000001', true, 'draft',
 '2026-09-19 12:00:00+00', '2026-09-19 12:00:00+00')
ON CONFLICT (id) DO NOTHING;
