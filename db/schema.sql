-- =====================================================================
--  Esquema de base de datos — Exámenes MPF (Supabase / Postgres)
--  Pegá este SQL en el editor SQL de Supabase y ejecutalo.
--  Modelo de cobro: pago único que habilita acceso por 6 MESES.
--  Al vencer, el usuario paga de nuevo (NO es suscripción automática).
-- =====================================================================

-- Pagos: un registro por pago aprobado de Mercado Pago.
create table if not exists public.pagos (
  id            bigint generated always as identity primary key,
  user_email    text        not null,
  fecha_pago    timestamptz not null default now(),
  -- vence = fecha_pago + 6 meses (lo setea el webhook al aprobar el pago)
  vence         timestamptz not null,
  estado        text        not null default 'aprobado',
  mp_payment_id text        unique,
  creado_en     timestamptz not null default now()
);

create index if not exists idx_pagos_user_email on public.pagos (user_email);
create index if not exists idx_pagos_vence       on public.pagos (vence);

-- Exámenes completados: histórico por usuario (para no repetir y para stats).
create table if not exists public.examenes_completados (
  id         bigint generated always as identity primary key,
  user_email text        not null,
  examen_id  integer     not null,
  fecha      timestamptz not null default now()
);

create index if not exists idx_completados_user_email
  on public.examenes_completados (user_email);

-- Nota sobre RLS:
-- El acceso a estas tablas se hace desde el servidor con la SECRET KEY
-- (service role), que bypassa RLS. Si más adelante se consulta desde el
-- cliente con la publishable key, habrá que activar RLS y políticas:
--   alter table public.pagos enable row level security;
--   alter table public.examenes_completados enable row level security;
-- y crear políticas por user_email = auth.jwt() ->> 'email'.
