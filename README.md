# AI Chat Application

A modern AI chat application built with Next.js, featuring real-time streaming responses, GitHub OAuth authentication, and a modular AI provider architecture.

![AI Chat Screenshot](https://via.placeholder.com/800x400?text=AI+Chat+App)

## 🚀 Features

- **Real-time Streaming**: Watch AI responses appear in real-time as they're generated
- **GitHub OAuth**: Secure authentication with GitHub
- **Conversation Management**: Create, view, and delete conversations
- **Persistent Storage**: All chats stored in PostgreSQL
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modular AI Provider**: Easy to switch between AI providers (OpenRouter, OpenAI, Anthropic, etc.)
- **Neobrutalism UI**: Distinctive retro-styled interface

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 19 |
| Styling | TailwindCSS 4, Neobrutalism design |
| State Management | Zustand |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Authentication | NextAuth.js v5 (GitHub OAuth) |
| AI Provider | OpenRouter (modular architecture) |

## 📋 Prerequisites

Before running this project, you need:

1. **Node.js 18+** installed
2. **PostgreSQL database** (recommend [Neon](https://neon.tech) for serverless)
3. **GitHub OAuth App** for authentication
4. **OpenRouter API Key** for AI responses

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# GitHub OAuth (create at: Settings > Developer settings > OAuth Apps)
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# NextAuth (generate with: openssl rand -base64 32)
AUTH_SECRET=your_random_secret_here

# OpenRouter AI (get at: https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_openrouter_api_key

# App URL
NEXTAUTH_URL=http://localhost:3000
```

### Getting Credentials

#### GitHub OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: `AI Chat App`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

#### Neon Database
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard

#### OpenRouter API Key
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to Keys section
3. Create a new API key

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-chat-app.git
cd ai-chat-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Database Commands

```bash
# Push schema to database (recommended for development)
npm run db:push

# Generate migrations
npm run db:generate

# Open Drizzle Studio (database viewer)
npm run db:studio
```

## 📁 Project Structure

```
ai-chat-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── chat/          # Streaming chat endpoint
│   │   │   └── conversations/ # Conversation CRUD
│   │   ├── chat/              # Chat page (protected)
│   │   ├── login/             # Login page
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── auth/              # Auth components
│   │   ├── chat/              # Chat components
│   │   ├── providers/         # Context providers
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── ai/                # AI provider abstraction
│   │   │   ├── providers/     # Provider implementations
│   │   │   ├── types.ts       # TypeScript interfaces
│   │   │   └── index.ts       # Provider factory
│   │   ├── db/                # Database configuration
│   │   │   ├── schema.ts      # Drizzle schema
│   │   │   └── index.ts       # Database connection
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── utils.ts           # Utility functions
│   ├── stores/                # Zustand state stores
│   └── types/                 # TypeScript declarations
├── drizzle/                   # Database migrations
├── .env.example               # Environment template
├── drizzle.config.ts          # Drizzle configuration
└── package.json
```

## 🏗️ Architecture Decisions

### Database Schema

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   users     │───1:N─│  conversations  │───1:N─│  messages   │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (UUID)   │       │ id (UUID)       │       │ id (UUID)   │
│ github_id   │       │ user_id (FK)    │       │ conv_id(FK) │
│ email       │       │ title           │       │ role        │
│ name        │       │ created_at      │       │ content     │
│ avatar_url  │       │ updated_at      │       │ created_at  │
│ created_at  │       └─────────────────┘       └─────────────┘
│ updated_at  │
└─────────────┘
```

**Design Rationale:**
- **Normalized schema** prevents data duplication
- **Cascade deletes** ensure referential integrity
- **UUID primary keys** for security (no sequential IDs)
- **Timestamps** for sorting and auditing

### AI Provider Architecture

The AI layer uses a **provider interface pattern** for maximum flexibility:

```typescript
interface AIProvider {
  name: string;
  chat(messages: AIMessage[]): Promise<string>;
  chatStream(messages: AIMessage[]): AsyncIterable<string>;
}
```

**Benefits:**
1. **Single interface** for all AI interactions
2. **Easy provider swapping** - change one line in `src/lib/ai/index.ts`
3. **Testability** - use mock providers in tests
4. **Future-proof** - add new providers without changing consumer code

**To switch providers:**
```typescript
// src/lib/ai/index.ts
export function getAIProvider(): AIProvider {
  // Change this line to switch providers
  return createOpenRouterProvider(config);
  // Could be: createOpenAIProvider(config);
  // Or: createAnthropicProvider(config);
}
```

### Streaming Implementation

1. **Server**: OpenRouter API with `stream: true` returns SSE
2. **API Route**: Parses SSE, pipes chunks via `ReadableStream`
3. **Client**: Reads stream, updates Zustand store per chunk
4. **UI**: React components react to store changes

## 📈 Scaling Considerations

For thousands of users, consider:

1. **Database**
   - Add connection pooling (PgBouncer)
   - Consider read replicas for heavy read loads
   - Add Redis for frequently accessed data

2. **AI Provider**
   - Implement rate limiting per user
   - Add request queuing with retry logic
   - Consider multiple API keys for load distribution

3. **Infrastructure**
   - Deploy to edge locations (Vercel Edge)
   - Use CDN for static assets
   - Implement proper caching headers

4. **Monitoring**
   - Add error tracking (Sentry)
   - Set up performance monitoring
   - Track AI API usage and costs

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your production URL
5. Update GitHub OAuth callback URL

### Manual Deployment

```bash
# Build production version
npm run build

# Start production server
npm start
```

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/*` | NextAuth endpoints |
| GET | `/api/conversations` | List user's conversations |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations/[id]` | Get conversation with messages |
| DELETE | `/api/conversations/[id]` | Delete conversation |
| PATCH | `/api/conversations/[id]` | Update conversation title |
| POST | `/api/chat` | Send message (streaming response) |

## ⏱️ Development Time

Approximate time taken: **~3-4 hours**

Breakdown:
- Project setup & configuration: 30 min
- Database schema & ORM: 30 min
- Authentication (NextAuth): 30 min
- AI Provider architecture: 45 min
- UI Components: 60 min
- API Routes & Streaming: 45 min
- Testing & Polish: 30 min

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.
