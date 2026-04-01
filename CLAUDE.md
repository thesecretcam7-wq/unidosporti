# UnidosPorTi - Development Guide for AI Assistants

## Project Overview

**UnidosPorTi** is a free platform designed to help Latin American migrants in Spain navigate immigration, employment, and housing. The application provides comprehensive guides (particularly on Spanish immigration processes like "Arraigo"), job listings, housing listings, community features, and AI-powered tools like CV and contract generators.

**Primary Mission**: Empower migrant communities with accessible, multilingual resources and peer support.

**Target Audience**: Latin American migrants in Spain (hence Spanish language throughout)

---

## Tech Stack

### Core Framework
- **Next.js** (v14.2.5) - React framework with App Router
- **React** (v18) - UI library
- **TypeScript** (v5) - Type safety (strict mode disabled for flexibility)

### Backend & Database
- **Supabase** (@supabase/supabase-js v2.44.4) - PostgreSQL database + Auth + Storage
- **API Routes** - Next.js serverless functions in `/app/api`

### Payments
- **Stripe** (v20.4.1) - Payment processing for premium features and native ads

### Styling
- **Tailwind CSS** (v3.4.1) - Utility-first CSS framework
- **PostCSS** (v8) + **Autoprefixer** - CSS processing

### Development Tools
- **Next.js Linter** - Built-in ESLint
- **TypeScript Build Info** - Incremental compilation

---

## Project Structure

```
/home/user/unidosporti/
├── app/                          # Next.js App Router directory
│   ├── api/                       # API routes (serverless functions)
│   │   ├── admin/                 # Admin endpoints
│   │   │   ├── stats/route.ts     # Admin dashboard statistics
│   │   │   ├── pending/route.ts   # Pending listings for moderation
│   │   │   └── moderate/route.ts  # Moderation endpoints
│   │   ├── chat/route.ts          # AI chat endpoint
│   │   ├── cv/route.ts            # CV generator
│   │   ├── contrato/route.ts      # Contract generator
│   │   ├── nomina/route.ts        # Payslip generator
│   │   ├── stripe/                # Payment processing
│   │   │   ├── checkout/route.ts           # Subscription checkout
│   │   │   ├── checkout-ad/route.ts        # Ad campaign checkout
│   │   │   ├── checkout-b2b/route.ts       # B2B/ONG checkout
│   │   │   ├── donate/route.ts             # Donations
│   │   │   └── webhook/route.ts            # Stripe webhook handler
│   │   └── ...                    # Other API routes
│   ├── portal/                    # Nested route example
│   │   └── page.tsx               # Portal page
│   ├── page.tsx                   # Home page (main SPA)
│   ├── layout.tsx                 # Root layout with metadata
│   └── globals.css                # Global Tailwind styles
├── public/                        # Static assets
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
└── .gitignore                     # Git ignoring node_modules, .env files
```

### Key Directories Explained

- **`/app`** - All application code using Next.js App Router
  - Client components use `'use client'` directive
  - Server functions/API routes handle backend logic
  - Metadata and viewport config in `layout.tsx`

- **`/app/api`** - Serverless API endpoints
  - Each `route.ts` exports `GET`, `POST`, `PUT`, `DELETE` handlers
  - Authenticated requests validate user via Supabase bearer token
  - Request/response handled via `NextRequest` and `NextResponse`

- **`/public`** - Static assets (images, icons, etc.) served directly

---

## Development Setup

### Prerequisites
- Node.js (v18+)
- Git
- Environment variables configured (see below)

### Installation
```bash
cd /home/user/unidosporti
npm install
npm run dev  # Start development server at http://localhost:3000
```

### Build & Production
```bash
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run Next.js linter
```

### Environment Variables Required
Create a `.env.local` file (not committed to git):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://unidosporti.vercel.app  # or http://localhost:3000 for dev
```

**Note**: `NEXT_PUBLIC_*` variables are exposed to the client. Never put secrets in them.

---

## Core Concepts

### Main Application State & Screens

The main `page.tsx` is a **single-page application (SPA)** that renders different "pantallas" (screens) based on user state. Key screens include:

```typescript
type Pantalla = 
  | 'inicio' | 'empleo' | 'vivienda' | 'chat' | 'tramites' 
  | 'perfil' | 'premium' | 'comunidad' | 'foro' | 'citas'
  | 'admin' | 'publicar-empleo' | 'publicar-vivienda'
  | 'ong-dashboard' | 'cv-generador' | ...
```

**Screen Flow**:
1. User loads the app
2. Checks authentication with Supabase
3. Renders appropriate screen based on `pantalla` state
4. Navigation updates state to switch screens

### Data Models

**Key Types** (defined in `page.tsx`):

```typescript
// Job listings
type DbEmpleo = {
  id: string; user_id: string; empresa: string; sector: string;
  ciudad: string; salario: string; jornada: string;
  arraigo: boolean; precontrato: boolean; nie: boolean;
  desc: string; status: 'pending'|'approved'|'rejected';
  contacto_tipo: 'email'|'whatsapp'|'ambos';
}

// Housing listings
type DbVivienda = {
  id: string; user_id: string; tipo: 'Habitación'|'Piso';
  titulo: string; ciudad: string; barrio: string;
  precio: number; fianza: number;
  sin_nomina: boolean; extranjeros: boolean;
  status: 'pending'|'approved'|'rejected';
}

// Community chat messages
type ChatMsg = {
  id: string; user_id: string; nombre: string|null;
  mensaje: string; created_at: string;
}

// Private messages
type MensajePrivado = {
  id: string; from_user_id: string; to_user_id: string;
  from_nombre: string|null; mensaje: string;
  leido: boolean; created_at: string;
}

// Alerts (job/housing subscriptions)
type Alerta = {
  id: string; user_id: string; tipo: 'empleo'|'vivienda';
  sector?: string; ciudad?: string; precio_max?: number;
}

// Appointments
type Cita = {
  id: string; user_id: string; tipo: string;
  titulo: string; fecha: string; hora: string;
  completada: boolean;
}

// Forum posts
type ForoPost = {
  id: string; user_id: string; titulo: string;
  contenido: string; respuestas: number; created_at: string;
}
```

### Authentication & Authorization

- **Supabase Auth** handles user registration, login, session management
- **Bearer Token** verification in API routes using `Authorization: Bearer ${token}` header
- **Admin** identified by hardcoded email: `thesecretcam7@gmail.com`

Example API auth check:
```typescript
const token = req.headers.get('authorization')?.replace('Bearer ', '')
if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${token}` } }
})
const { data: { user } } = await adminClient.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

---

## API Routes & Endpoints

### Authentication
All routes requiring authentication expect a Supabase auth token in the `Authorization` header.

### Payment Routes (`/app/api/stripe/`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/stripe/checkout` | POST | Create subscription checkout for premium |
| `/stripe/checkout-ad` | POST | Checkout for native ad campaigns |
| `/stripe/checkout-b2b` | POST | Checkout for B2B/ONG subscriptions |
| `/stripe/donate` | POST | Handle donations |
| `/stripe/webhook` | POST | Stripe webhook for subscription events |

**Example Checkout Flow**:
```typescript
POST /api/stripe/checkout
Authorization: Bearer <token>
Content-Type: application/json
{ "email": "user@example.com" }

Response: { "sessionUrl": "https://checkout.stripe.com/..." }
```

### Moderation & Admin Routes (`/app/api/admin/`)

| Route | Purpose |
|-------|---------|
| `/admin/pending` | Get listings pending moderation |
| `/admin/moderate` | Approve/reject listings |
| `/admin/moderate-ad` | Approve/reject ad campaigns |
| `/admin/stats` | Dashboard statistics (users, messages, orgs, listings) |

**Admin Panel Behavior**:
- Only accessible to `ADMIN_EMAIL`
- Allows bulk moderation of jobs, housing, and ads
- Displays real-time stats from Supabase

### AI Generator Routes

| Route | Purpose |
|-------|---------|
| `/api/cv` | AI-powered CV generator |
| `/api/contrato` | Contract/precontrato template generator |
| `/api/nomina` | Payslip/nomina generator |
| `/api/chat` | Community AI chat (likely uses Claude API) |

---

## Frontend Architecture & Conventions

### Client Components
- Most of `page.tsx` uses `'use client'` for interactive features
- State managed with React hooks (`useState`, `useEffect`)
- Supabase JS client initialized with anon key for client-side queries

### Styling
- Tailwind CSS utility classes exclusively
- Responsive design with mobile-first approach
- Viewport optimized for mobile (iPhone safe area, max-scale: 1)

### Key UI Patterns

**Screen Navigation**:
```typescript
const [pantalla, setPantalla] = useState<Pantalla>('inicio')
// Clicking a button: setPantalla('empleo')
```

**Data Fetching**:
```typescript
useEffect(() => {
  const loadData = async () => {
    const { data, error } = await supabase
      .from('empleos')
      .select('*')
      .eq('status', 'approved')
    setListings(data || [])
  }
  loadData()
}, [])
```

**API Calls with Auth**:
```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email })
})
```

### Language
- **Spanish** throughout UI (variable names, content, labels)
- Multi-region support: Madrid, Barcelona, Valencia, Murcia, Sevilla, etc.
- Terminology reflects Spanish context (extranjería, padrón, precontrato, arraigo, etc.)

---

## Database Schema (Supabase)

**Tables** (inferred from code):

1. **`auth.users`** - Supabase built-in auth
   - `id`, `email`, `created_at`, `last_sign_in_at`

2. **`empleos`** - Job listings
   - `id`, `user_id`, `empresa`, `sector`, `ciudad`, `salario`, `jornada`
   - `arraigo`, `precontrato`, `nie`, `desc`
   - `contacto_tipo`, `contacto_whatsapp`, `contacto_email`
   - `status`, `destacado`, `created_at`

3. **`viviendas`** - Housing listings
   - `id`, `user_id`, `tipo`, `titulo`, `ciudad`, `barrio`
   - `precio`, `fianza`, `sin_nomina`, `extranjeros`, `m2`, `desc`
   - `status`, `destacado`, `created_at`

4. **`chat_mensajes`** - Community chat messages
   - `id`, `user_id`, `user_email`, `nombre`, `mensaje`, `created_at`

5. **`mensajes_privados`** - Private messages
   - `id`, `from_user_id`, `to_user_id`, `from_nombre`, `to_nombre`
   - `mensaje`, `leido`, `created_at`

6. **`alertas`** - Job/housing alerts
   - `id`, `user_id`, `tipo`, `sector`, `ciudad`, `precio_max`, `created_at`

7. **`citas`** - Appointments/reminders
   - `id`, `user_id`, `tipo`, `titulo`, `fecha`, `hora`, `lugar`, `notas`, `completada`

8. **`usuarios`** (inferred) - User profiles
   - Extended user data: `nombre`, `pais_origen`, `situacion_legal`, `foto_perfil`, etc.

9. **`foro`** - Forum posts
   - `id`, `user_id`, `titulo`, `contenido`, `respuestas`, `created_at`

10. **`anuncios`** - Native ads by organizations
    - `id`, `user_id`, `titulo`, `contenido`, `imagen`, `status`, `created_at`

---

## Key Conventions & Patterns

### Naming
- **Variables & Functions**: camelCase in TypeScript
- **Database Fields**: snake_case
- **Spanish Terminology**: Prefer Spanish terms in UI context (e.g., `tramites`, `extranjería`, `padrón`)

### Error Handling
- API routes return `NextResponse.json({ error: 'message' }, { status: code })`
- Client-side: Check `error` property from Supabase queries
- Network errors: Generally not caught, logs visible in browser console

### Security Notes
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to client
- ⚠️ Use anon key client-side only
- ⚠️ Bearer token validation critical in API routes
- ⚠️ RLS (Row-Level Security) policies should protect data in Supabase

### TypeScript Config
- `strict: false` - Not using strict mode for flexibility
- `ignoreBuildErrors: true` in Next.js config - Build succeeds even with TS errors
- Path alias: `@/*` points to project root

---

## Common Development Tasks

### Adding a New API Endpoint
1. Create `/app/api/feature/route.ts`
2. Export `POST` (or `GET`, `PUT`, `DELETE`) function
3. Accept `NextRequest`, return `NextResponse`
4. Validate auth token in header
5. Use Supabase client to query database
6. Return JSON response

Example:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  // Your logic here
  return NextResponse.json({ success: true })
}
```

### Adding a New Screen/Pantalla
1. Add new pantalla type to the `Pantalla` union type
2. Add rendering logic in the main component's screen selector
3. Add navigation button to reach the screen
4. Use state hooks to manage screen-specific data

### Styling New Components
- Use Tailwind CSS classes
- Mobile-first: design for mobile, add desktop overrides
- Check viewport padding for mobile safe area
- Colors/theme: Follow existing palette in globals.css

### Handling Stripe Payments
1. Create Stripe session via API route
2. Redirect user to Stripe Checkout URL
3. Handle success/cancel redirects
4. Listen to webhook for subscription events
5. Update user subscription status in database

### Testing Locally
```bash
npm run dev
# Visit http://localhost:3000
# Use Supabase local emulator if needed
npm run build  # Test production build
```

---

## Git Workflow

### Branches
- **`main`** - Production-ready code
- **Feature branches** - Named descriptively (e.g., `claude/add-claude-documentation-P39Fx`)

### Commits
- Write clear, imperative commit messages: "Add CV generator", "Fix chat reliability"
- One logical change per commit
- Include ticket reference if available

### Push & PR
1. Develop on feature branch
2. Commit work with clear messages
3. Push to remote: `git push -u origin branch-name`
4. Create PR with description of changes
5. Code review before merging to main

### Current Branch
You are currently on: `claude/add-claude-documentation-P39Fx`

---

## Important Notes for AI Assistants

### ✅ DO:
- Read existing code before making changes
- Follow TypeScript conventions even though strict mode is disabled
- Use Tailwind CSS for all styling
- Validate user auth in API routes
- Test changes locally with `npm run dev`
- Commit with clear, descriptive messages
- Ask for clarification on ambiguous requirements

### ❌ DON'T:
- Commit environment variables or secrets
- Push to `main` without explicit permission
- Ignore TypeScript type warnings (they may hide bugs)
- Create API endpoints without auth validation
- Skip database security checks (RLS policies)
- Add unnecessary complexity or abstractions
- Force-push or rewrite history

### Database Safety
- Never drop tables in production
- Always use migrations for schema changes
- Test SQL queries on dev environment first
- Verify RLS policies before deploying

### Performance Considerations
- Supabase queries can be slow - consider pagination
- Images should be stored in Supabase Storage, referenced by URL
- Chat messages: consider pagination for large communities
- Limit real-time subscriptions to necessary tables

---

## Resources & References

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe API**: https://stripe.com/docs/api
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

---

## Questions & Support

When working on this codebase:
1. Check `page.tsx` for state management patterns
2. Review existing API routes for authentication templates
3. Check Supabase console for table schema
4. Test in browser dev tools for client-side issues
5. Check server logs for API errors

---

*Last Updated: April 2026*
*For use by AI assistants and human developers maintaining UnidosPorTi*
