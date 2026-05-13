
-- HELP DESK ADSO
-- Ejecutar en Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text not null,
  rol text not null default 'user' check (rol in ('user', 'agent')),
  creado_en timestamp with time zone default now()
);

alter table profiles disable row level security;

-- tickets
create table tickets (
  id uuid default uuid_generate_v4() primary key,
  titulo text not null,
  descripcion text not null,
  categoria text not null check (categoria in ('hardware', 'software', 'red', 'acceso', 'otro')),
  prioridad text not null default 'media' check (prioridad in ('baja', 'media', 'alta', 'urgente')),
  estado text not null default 'abierto' check (estado in ('abierto', 'en_progreso', 'resuelto', 'cerrado')),
  solicitante_id uuid references profiles(id) not null,
  asignado_a uuid references profiles(id),
  creado_en timestamp with time zone default now(),
  actualizado_en timestamp with time zone default now()
);

alter table tickets disable row level security;

-- ticket_historial
create table ticket_historial (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets(id) on delete cascade not null,
  estado_anterior text not null,
  estado_nuevo text not null,
  cambiado_por uuid references profiles(id) not null,
  nota text,
  creado_en timestamp with time zone default now()
);

alter table ticket_historial disable row level security;

-- conversaciones
create table conversaciones (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  abierta boolean default true,
  creado_en timestamp with time zone default now()
);

alter table conversaciones disable row level security;

-- mensajes
create table mensajes (
  id uuid default uuid_generate_v4() primary key,
  conversacion_id uuid references conversaciones(id) on delete cascade not null,
  autor_id uuid references profiles(id) not null,
  contenido text not null,
  leido boolean default false,
  es_ia boolean default false,
  creado_en timestamp with time zone default now()
);

alter table mensajes disable row level security;

-- Habilitar escucha en tiempo real para el chat
alter publication supabase_realtime add table mensajes;
alter publication supabase_realtime add table conversaciones;

-- Actualizar campo actualizado_en en tickets
create or replace function actualizar_timestamp()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_actualizar_ticket
  before update on tickets
  for each row
  execute function actualizar_timestamp();
