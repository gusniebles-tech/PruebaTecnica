-- ================================================
-- HELP DESK ADSO - Script completo de base de datos
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- Habilitar extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ================================================
-- TABLA: profiles
-- Extiende los usuarios de Supabase Auth
-- ================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text not null,
  rol text not null default 'user' check (rol in ('user', 'agent')),
  creado_en timestamp with time zone default now()
);

-- Activar Row Level Security
alter table profiles enable row level security;

-- Política: cada usuario puede ver su propio perfil
create policy "ver_propio_perfil"
  on profiles for select
  using (auth.uid() = id);

-- Política: cada usuario puede actualizar su propio perfil
create policy "actualizar_propio_perfil"
  on profiles for update
  using (auth.uid() = id);

-- Política: los agentes pueden ver todos los perfiles
create policy "agentes_ven_todos"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and rol = 'agent'
    )
  );

-- ================================================
-- TABLA: tickets
-- ================================================
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

-- Activar Row Level Security
alter table tickets enable row level security;

-- Política: usuarios solo ven sus propios tickets
create policy "usuario_ve_sus_tickets"
  on tickets for select
  using (solicitante_id = auth.uid());

-- Política: agentes ven todos los tickets
create policy "agente_ve_todos_tickets"
  on tickets for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and rol = 'agent'
    )
  );

-- Política: usuarios pueden crear tickets
create policy "usuario_crea_tickets"
  on tickets for insert
  with check (solicitante_id = auth.uid());

-- Política: agentes pueden actualizar tickets
create policy "agente_actualiza_tickets"
  on tickets for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and rol = 'agent'
    )
  );

-- Política: solo se puede eliminar si el estado es 'cerrado'
create policy "eliminar_solo_cerrado"
  on tickets for delete
  using (
    estado = 'cerrado' and (
      solicitante_id = auth.uid() or
      exists (
        select 1 from profiles
        where id = auth.uid() and rol = 'agent'
      )
    )
  );

-- ================================================
-- TABLA: ticket_historial
-- Guarda los cambios de estado de cada ticket
-- ================================================
create table ticket_historial (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets(id) on delete cascade not null,
  estado_anterior text not null,
  estado_nuevo text not null,
  cambiado_por uuid references profiles(id) not null,
  nota text,
  creado_en timestamp with time zone default now()
);

-- Activar Row Level Security
alter table ticket_historial enable row level security;

-- Política: pueden ver el historial quien puede ver el ticket
create policy "ver_historial_ticket"
  on ticket_historial for select
  using (
    exists (
      select 1 from tickets
      where id = ticket_id and (
        solicitante_id = auth.uid() or
        exists (
          select 1 from profiles
          where id = auth.uid() and rol = 'agent'
        )
      )
    )
  );

-- Política: agentes pueden insertar historial
create policy "agente_inserta_historial"
  on ticket_historial for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and rol = 'agent'
    )
  );

-- ================================================
-- TABLAS PREPARADAS PARA MÓDULOS FUTUROS
-- (Chat en tiempo real e IA)
-- Estas tablas NO se usan en el Módulo 1
-- ================================================

-- Tabla de conversaciones (para chat futuro)
create table conversaciones (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  abierta boolean default true,
  creado_en timestamp with time zone default now()
);

-- Tabla de mensajes (para chat futuro)
create table mensajes (
  id uuid default uuid_generate_v4() primary key,
  conversacion_id uuid references conversaciones(id) on delete cascade not null,
  autor_id uuid references profiles(id) not null,
  contenido text not null,
  leido boolean default false,
  creado_en timestamp with time zone default now()
);

-- Activar realtime para mensajes (para el chat futuro)
alter publication supabase_realtime add table mensajes;

-- ================================================
-- FUNCIÓN: actualizar campo 'actualizado_en' automáticamente
-- ================================================
create or replace function actualizar_timestamp()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para actualizar el campo en tickets
create trigger trigger_actualizar_ticket
  before update on tickets
  for each row
  execute function actualizar_timestamp();

-- ================================================
-- DATOS DE PRUEBA
-- Después de crear usuarios en Supabase Auth,
-- ejecutar estos inserts con los IDs reales
-- ================================================

-- NOTA: Reemplaza los UUIDs con los IDs reales de tus usuarios de Supabase Auth
-- Primero crea los usuarios desde el panel de Supabase o via Auth API,
-- luego inserta sus perfiles aquí.

-- Ejemplo (reemplazar UUIDs):
-- insert into profiles (id, nombre, rol) values
--   ('UUID-DEL-USUARIO-1', 'Carlos Estudiante', 'user'),
--   ('UUID-DEL-AGENTE-1', 'Ana Agente', 'agent');
