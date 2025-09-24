# Self As System

Full-stack web application built with React, TypeScript, and Node.js.

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Redux Toolkit (state management)
- React Router (routing)
- Tailwind CSS (styling)
- Vitest + React Testing Library (testing)

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT authentication
- Jest + Supertest (testing)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build for production
- `npm test` - Run all tests
- `npm run lint` - Lint code
- `npm run typecheck` - Type check TypeScript

## Project Structure

```
src/                    # Frontend source
├── components/         # React components
├── pages/             # Page components
├── hooks/             # Custom hooks
├── services/          # API services
├── store/             # Redux store
└── utils/             # Utilities

server/                # Backend source
├── routes/            # API routes
├── controllers/       # Controllers
├── models/            # Database models
├── middleware/        # Middleware
└── services/          # Business logic

tests/                 # Test files
├── frontend/          # Frontend tests
├── backend/           # Backend tests
└── e2e/              # E2E tests
```