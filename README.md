# Help Desk ADSO — Módulo 1: Gestión de Tickets

Sistema de soporte técnico desarrollado como prueba técnica para prácticas ADSO.

## Tecnologías usadas

- **Next.js 14** — Framework de React con App Router
- **TypeScript** — Tipado estático
- **Tailwind CSS** — Estilos utilitarios
- **Supabase** — Base de datos, autenticación y preparación para realtime
- **PostgreSQL** — Base de datos relacional (gestionada por Supabase)
- **Vercel** — Deploy en producción

---

## Estructura del proyecto

```
helpdesk-adso/
├── app/                        # Páginas y rutas (Next.js App Router)
│   ├── auth/login/             # Página de login
│   ├── dashboard/              # Panel principal
│   ├── tickets/                # Páginas del usuario normal
│   │   ├── nuevo/              # Crear ticket
│   │   └── [id]/               # Detalle de ticket
│   └── admin/tickets/          # Páginas del agente
│       └── [id]/               # Detalle con acciones de agente
│
├── components/                 # Componentes reutilizables
│   ├── ui/                     # Componentes base (Badge, Boton)
│   ├── tickets/                # Componentes de tickets
│   └── layout/                 # Navbar y estructura
│
├── lib/                        # Configuración de clientes Supabase
│   ├── supabase-cliente.ts     # Cliente para el navegador
│   └── supabase-servidor.ts    # Cliente para el servidor
│
├── services/                   # Lógica de acceso a datos
│   ├── auth-servicio.ts        # Login, logout, sesión
│   └── tickets-servicio.ts     # CRUD de tickets e historial
│
├── types/                      # Tipos TypeScript
│   └── index.ts                # Todos los tipos del proyecto
│
├── hooks/                      # Custom hooks de React
│   └── useAuth.ts              # Estado de autenticación
│
├── utils/                      # Funciones de utilidad
│   └── formato.ts              # Fechas, etiquetas, colores
│
└── supabase/                   # Scripts de base de datos
    └── schema.sql              # Todas las tablas y políticas
```

---

## Instalación paso a paso

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd helpdesk-adso
npm install
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que termine de iniciarse (~2 minutos)

### 3. Ejecutar el script SQL

1. En Supabase, ve a **SQL Editor**
2. Copia todo el contenido de `supabase/schema.sql`
3. Pégalo en el editor y haz clic en **Run**
4. Verifica que no haya errores

### 4. Crear usuarios de prueba

En Supabase, ve a **Authentication > Users > Add user**:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| usuario@helpdesk.com | 123456 | user |
| agente@helpdesk.com | 123456 | agent |

Después de crear cada usuario, **anota el UUID** que le asigna Supabase.

### 5. Insertar perfiles en la base de datos

En **SQL Editor**, reemplaza los UUIDs con los reales y ejecuta:

```sql
INSERT INTO profiles (id, nombre, rol) VALUES
  ('UUID-DEL-USUARIO', 'Carlos Estudiante', 'user'),
  ('UUID-DEL-AGENTE', 'Ana Agente', 'agent');
```

### 6. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
- Ve a **Settings > API** en tu proyecto de Supabase
- Copia la **Project URL** y la **anon public key**

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 7. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Usuarios de prueba

| Rol | Email | Contraseña | Puede hacer |
|-----|-------|-----------|-------------|
| Usuario | usuario@helpdesk.com | 123456 | Crear tickets, ver sus tickets |
| Agente | agente@helpdesk.com | 123456 | Ver todos los tickets, cambiar estados |

---

## Funcionalidades del Módulo 1

- **Login/Logout** con email y contraseña
- **Crear ticket** con título, descripción, categoría y prioridad
- **Listar tickets** con filtros por estado y categoría
- **Ver detalle** de un ticket
- **Cambiar estado** (Abierto → En Progreso → Resuelto → Cerrado)
- **Historial automático** de cambios de estado con nota opcional
- **Protección de rutas** según el rol

---

## Deploy en Vercel

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Hacer deploy
vercel

# Configurar variables de entorno en el panel de Vercel:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Módulos futuros (preparados pero no implementados)

### Módulo 2 — Chat en tiempo real
Las tablas `conversaciones` y `mensajes` ya están creadas en el SQL.
Supabase Realtime ya está habilitado para la tabla `mensajes`.

### Módulo 3 — Asistente de IA
El tipo `SugerenciaIA` ya está definido en `types/index.ts`.
Se puede integrar con la API de Claude (Anthropic) o similares.

---

## Preguntas frecuentes para entrevista

**¿Por qué Next.js App Router?**
Permite usar Server Components para obtener datos en el servidor directamente, simplificando el código y mejorando el rendimiento.

**¿Qué son las RLS (Row Level Security) de Supabase?**
Son políticas de seguridad que se aplican directamente en la base de datos. Garantizan que cada usuario solo vea y modifique sus propios datos, incluso si alguien intenta acceder directamente a la API.

**¿Por qué separar `services` de los componentes?**
Para mantener el principio de responsabilidad única: los componentes se encargan de la UI, y los servicios de comunicarse con la base de datos. Si cambias la base de datos, solo tocas los servicios.

**¿Cómo funciona el historial de cambios?**
Cada vez que un agente cambia el estado, la función `actualizarEstadoTicket` hace dos operaciones: actualiza el ticket y además inserta un registro en `ticket_historial` con el estado anterior y el nuevo.
