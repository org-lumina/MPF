-- =====================================================================
--  Tabla de pedidos de simuladores — "¿Falta tu examen?"
--  Pegá este SQL en el editor SQL de Supabase y ejecutalo.
--  Lo escribe el endpoint server-side POST /api/pedidos con la SECRET KEY
--  (que bypassa RLS). No se expone ninguna credencial al cliente.
-- =====================================================================

create table if not exists public.pedidos_examen (
  id              bigint generated always as identity primary key,
  nombre_apellido text        not null,
  examen_pedido   text        not null,
  creado          timestamptz not null default now()
);

create index if not exists idx_pedidos_creado on public.pedidos_examen (creado desc);

-- Nota RLS: el acceso es solo desde el servidor con la secret key (service role),
-- por lo que RLS puede quedar deshabilitado. Si más adelante se consultara desde
-- el cliente, habría que habilitar RLS y políticas de lectura/escritura.
