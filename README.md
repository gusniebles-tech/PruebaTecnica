# Help Desk ADSO

Sistema de soporte técnico desarrollado como prueba técnica para EduLabs.
Incluye gestión de tickets, asistente de IA y chat en tiempo real.

**[Ver sistema en producción](https://prueba-tecnica-five-wine.vercel.app/dashboard)**

Usuarios de prueba:
- **Usuario:** usuario@helpdesk.com / 123456
- **Agente:** agente@helpdesk.com / 123456

---

## ¿Qué hace el sistema?

El sistema tiene tres módulos integrados:

**Gestión de tickets** — el usuario crea tickets describiendo su problema,
el agente los atiende, cambia estados y el sistema guarda un historial
automático de cada cambio.

**Asistente de IA (Gemini)** — al crear un ticket, la IA sugiere la categoría
y prioridad según la descripción. En el panel del agente, analiza el sentimiento
del ticket, sugiere una respuesta inicial y responde preguntas libres del agente
sobre el caso.

**Chat en tiempo real** — el usuario puede abrir un chat desde su ticket.
Si no hay agente disponible, la IA responde automáticamente. Cuando un agente
se conecta, toma la conversación. Todo el historial queda guardado en la base
de datos.

---

## Stack

- **Next.js 14 App Router** — elegido porque permite mezclar Server Components
  y Client Components, lo que simplifica mucho el manejo de autenticación y
  las consultas a la base de datos
- **TypeScript** — tipado en todo el proyecto
- **Tailwind CSS** — estilos
- **Supabase** — base de datos PostgreSQL, autenticación, y Realtime para el chat
- **Gemini API** — modelo `gemini-1.5-flash` para las funciones de IA
- **Vercel** — deploy

---

## Estructura del proyecto
helpdesk-adso/
├── app/                        # Rutas (Next.js App Router)
│   ├── auth/login/             # Login
│   ├── dashboard/              # Panel principal
│   ├── tickets/                # Vista del usuario
│   ├── admin/tickets/          # Vista del agente
│   ├── chat/[ticketId]/        # Chat del usuario
│   ├── admin/chat/             # Chat del agente
│   └── api/ia/                 # API routes de IA
│       ├── chat/               # Respuestas automáticas en chat
│       ├── analizar/           # Análisis de ticket nuevo
│       ├── preguntar/          # Preguntas libres del agente
│       └── respuesta/          # Respuesta sugerida al agente
│
├── components/                 # Componentes de UI
├── services/                   # Acceso a datos y lógica de IA
├── hooks/                      # useAuth
├── lib/                        # Clientes de Supabase
├── types/                      # Tipos TypeScript
├── utils/                      # Formato de fechas y etiquetas
└── supabase/
└── schema.sql              # Tablas, políticas RLS y triggers

---

## Instalación local

### 1. Clonar e instalar

```bash
git clone <url-del-repo>
cd helpdesk-adso
npm install
```

### 2. Crear proyecto en Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto y esperar ~2 minutos
3. Ir a **SQL Editor**, pegar el contenido de `supabase/schema.sql` y ejecutar

### 3. Crear usuarios de prueba

En **Authentication > Users > Add user**:

| Email | Contraseña |
|-------|-----------|
| usuario@helpdesk.com | 123456 |
| agente@helpdesk.com | 123456 |

Después de crearlos, ir a **SQL Editor** y ejecutar (reemplazando los UUIDs):

```sql
INSERT INTO profiles (id, nombre, rol) VALUES
  ('UUID-DEL-USUARIO', 'Carlos Estudiante', 'user'),
  ('UUID-DEL-AGENTE', 'Ana Agente', 'agent');
```

### 4. Variables de entorno

```bash
cp .env.example .env.local
```

Completar con las credenciales de **Settings > API** en Supabase,
y con la API key de Gemini desde [aistudio.google.com](https://aistudio.google.com):
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
GEMINI_API_KEY=tu-gemini-key

### 5. Correr en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Funcionalidades por módulo

### Módulo 1 — Tickets
- Crear ticket con título, descripción, categoría y prioridad
- Listar con filtros por estado y categoría
- Ver detalle de un ticket
- Cambiar estado: Abierto → En Progreso → Resuelto → Cerrado
- Historial automático de cambios (fecha, estado anterior, estado nuevo)
- Eliminar ticket solo si está en estado Cerrado

### Módulo 2 — Asistente de IA
- Al crear un ticket: sugiere categoría, prioridad, y mejoras al título o descripción
- En el panel del agente: detecta sentimiento, sugiere respuesta inicial y permite
  hacerle preguntas libres al asistente sobre el ticket
- Usa Gemini como API principal; si no hay API key, usa un fallback con reglas
  simples para que el sistema siga funcionando

### Módulo 3 — Chat en tiempo real
- El usuario abre el chat desde su ticket
- Si no hay agente, la IA responde automáticamente
- El agente ve las conversaciones activas y puede unirse
- Comunicación en tiempo real con Supabase Realtime (sin recargar la página)
- El historial queda guardado en la base de datos

---