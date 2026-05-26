# Support AI Platform - Frontend

Next.js-based frontend for AI-powered customer support system with real-time chat, ticket management, and analytics dashboards.

## Architecture Overview

**Tech Stack:**
- **Framework:** Next.js 14 (App Router, SSR)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** SWR + Axios
- **Type Safety:** TypeScript
- **UI Components:** Lucide React, Custom Tailwind

**Key Pages:**

```
Frontend
├── (auth)
│   ├── login          → JWT authentication
│   ├── register       → Create account
│   └── reset-password → Password recovery
│
├── (customer)
│   ├── chat          → Real-time ticket chat
│   ├── tickets       → My support requests
│   └── knowledge-base → Search FAQ/docs
│
├── (agent)
│   ├── dashboard     → Queue & metrics
│   ├── ticket        → Agent work interface
│   └── ai-copilot    → AI-assisted responses
│
├── (admin)
│   ├── analytics     → Cost, SLA, quality metrics
│   ├── users         → User management
│   └── settings      → Organization config
│
└── (ai-ops)
    ├── dashboard     → Agent performance
    ├── evals         → Evaluation metrics
    └── prompts       → Prompt management
```

## Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Setup

1. **Navigate to frontend:**
```bash
cd project_frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

4. **Run development server:**
```bash
npm run dev
```

Frontend runs at: http://localhost:3000

5. **Build for production:**
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (customer)/
│   │   ├── chat/[id]/page.tsx
│   │   ├── tickets/page.tsx
│   │   └── layout.tsx
│   ├── (agent)/
│   │   ├── dashboard/page.tsx
│   │   ├── ticket/[id]/page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── analytics/page.tsx
│   │   ├── users/page.tsx
│   │   └── layout.tsx
│   └── (ai-ops)/
│       ├── dashboard/page.tsx
│       ├── evals/page.tsx
│       └── layout.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx        # Reusable button
│   │   ├── Input.tsx         # Form input
│   │   ├── Card.tsx          # Card container
│   │   └── Badge.tsx         # Status badge
│   ├── chat/
│   │   ├── ChatWindow.tsx    # Main chat area
│   │   ├── MessageList.tsx   # Message history
│   │   ├── MessageInput.tsx  # Input with streaming
│   │   └── SourceCard.tsx    # Citation display
│   ├── tickets/
│   │   ├── TicketList.tsx    # Ticket queue
│   │   ├── TicketCard.tsx    # Ticket preview
│   │   ├── TicketForm.tsx    # Create/edit form
│   │   └── StatusBadge.tsx   # Status indicator
│   ├── dashboards/
│   │   ├── AdminDash.tsx
│   │   ├── AgentDash.tsx
│   │   └── AIOpssDash.tsx
│   └── common/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── LoadingSpinner.tsx
│
├── services/
│   ├── api.ts                # Axios client
│   ├── auth.ts               # Auth service
│   ├── chat.ts               # Chat API calls
│   └── ticket.ts             # Ticket API calls
│
├── store/
│   ├── auth.ts               # Zustand auth store
│   ├── chat.ts               # Zustand chat store
│   └── ui.ts                 # UI state (modals, etc.)
│
├── types/
│   ├── index.ts              # Shared types
│   ├── api.ts                # API response types
│   └── models.ts             # Domain models
│
├── utils/
│   ├── cn.ts                 # Tailwind class merger
│   ├── format.ts             # Date/text formatting
│   └── api-error.ts          # Error handling
│
├── hooks/
│   ├── useAuth.ts            # Auth hook
│   ├── useChat.ts            # Chat hook
│   ├── useFetch.ts           # SWR wrapper
│   └── useWindowSize.ts      # Responsive hook
│
├── config/
│   └── constants.ts          # App constants
│
└── styles/
    └── variables.css         # CSS variables
```

## Key Features

### 1. Real-Time Chat (`chat/[id]/page.tsx`)
- Message streaming (Server-Sent Events)
- Confidence scores visualization
- Source citations
- Message timestamps
- Typing indicators

```typescript
// Usage:
// POST /api/tickets/{id}/messages
// { "content": "...", "stream": true }
// Returns SSE stream of tokens
```

### 2. Ticket Management (`tickets/page.tsx`)
- List with filtering (status, priority)
- Create new tickets
- View conversation history
- AI-generated summaries
- Status lifecycle (open → resolved → closed)

### 3. Authentication (`(auth)/`)
- Signup with email/password
- JWT token management
- Automatic token refresh
- Session persistence

### 4. Dashboards
- **Admin:** Cost analytics, SLA metrics, hallucination rates
- **Agent:** Queue, AI-assisted suggestions, handoff
- **AI-Ops:** Agent performance, evaluation scores, prompt variants

## State Management (Zustand)

**Auth Store** (`store/auth.ts`):
```typescript
// Manages: user, token, login, logout, restore session
const { user, token, login, logout } = useAuthStore()
```

**Chat Store** (future):
```typescript
// Manages: messages, loading, error, send, clear
const { messages, send, clear } = useChatStore()
```

**UI Store** (future):
```typescript
// Manages: modal open/close, sidebar visibility
const { isModalOpen, toggleSidebar } = useUIStore()
```

## API Integration

All API calls go through centralized `services/api.ts` with:
- Automatic JWT attachment
- 401 redirect (auto logout)
- Error handling
- Base URL configuration

**Usage:**
```typescript
import { chatService } from '@/services/chat'

// In component
const response = await chatService.sendMessage(ticketId, content)
```

## Styling with Tailwind

**Custom Color Scheme:**
```css
primary: blue (brand color)
success: green (positive actions)
warning: yellow (alerts)
danger: red (destructive actions)
```

**Responsive Breakpoints:**
- Mobile: default (< 640px)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## Development

### Running Tests
```bash
npm run test
```

### Code Quality
```bash
# Type check
npm run type-check

# Lint
npm run lint
```

### Build
```bash
npm run build
# Outputs to .next/
```

## Performance Optimizations

1. **Image Optimization:** Use `next/image`
2. **Code Splitting:** Automatic per-route
3. **SWR Caching:** Automatic request deduplication
4. **CSS-in-JS:** Minimal runtime with Tailwind
5. **Lazy Loading:** Dynamic imports for heavy components

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Support AI
```

Note: `NEXT_PUBLIC_*` variables are exposed to browser.

## Key Patterns

### Protected Routes (Future)
```typescript
// Middleware for auth checks
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}
```

### Server Components vs Client
- **Server:** Layouts, data fetching
- **Client:** "use client" for interactivity, state, hooks

### Error Handling
```typescript
try {
  const data = await apiClient.get(url)
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  }
}
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t support-ai-frontend .
docker run -p 3000:3000 support-ai-frontend
```

### Environment for Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

## Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf .next
npm install
npm run build
```

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### API Connection Issues
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on 8000
- Check CORS settings in backend

## Next Steps

### MVP Phase
- [x] Project structure
- [x] Auth pages
- [ ] Chat interface with streaming
- [ ] Ticket list/create
- [ ] Basic dashboard

### V1 Phase
- [ ] Real-time notifications
- [ ] Advanced chat features
- [ ] Analytics dashboards
- [ ] User management

### V2 Phase
- [ ] Voice support
- [ ] Mobile app
- [ ] Offline mode
- [ ] AI-powered search

## References

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [SWR](https://swr.vercel.app)
- [TypeScript](https://www.typescriptlang.org)
