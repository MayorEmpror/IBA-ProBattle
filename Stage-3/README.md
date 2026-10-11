# Neighbourly: Full-Stack Hyper-Local Marketplace Platform

## Project Overview

**Neighbourly** is a hyper-local marketplace platform designed to bridge physical community engagement by allowing neighbors to exchange skills, tools, and services. This package.json represents the complete tech stack for building a system that evolves from a single-community MVP (Stage 1) to a nationwide, high-concurrency marketplace (Stage 3).

### Core Mission
Transform digital connectivity into meaningful physical community engagement through a robust, scalable platform for skill and service exchange across neighborhoods.

### Key Challenges Being Solved
✅ **Trust & Verification** - User profiles, ratings, and reputation systems  
✅ **Scalability** - From dozens to hundreds of thousands of users across multiple cities  
✅ **Real-Time Coordination** - Live messaging and booking synchronization  
✅ **Data Integrity** - Immutable audit logs for all transactions and state changes  
✅ **Geospatial Intelligence** - Location-based discovery within 5km, 10km, 25km radius  

### Technology Stack
- **Backend**: Payload CMS 3.70.0 + Next.js 15.4.10 (Full-stack framework)
- **Database**: PostgreSQL (multi-city scalability)
- **Real-Time**: WebSockets, Upstash Redis + Realtime
- **Geospatial**: H3 hexagonal hierarchical indexing (Uber's spatial library)
- **Caching**: Upstash Redis (distributed caching for high-traffic queries)
- **Frontend**: React 19.2.1 + Tailwind CSS (role-adaptive UI)
- **Language**: TypeScript 5.7.3 (type-safe marketplace logic)
- **Testing**: Vitest + Playwright (reliability at scale)

---

## How This Tech Stack Addresses Neighbourly's Evolution

### Stage 1: The Neighborhood Pilot (Single Community MVP)
**Goal**: Test core marketplace logic with a single neighborhood  
**Tech in Use**:
- **Payload CMS** - Content management for service listings
- **Next.js + React** - Simple listing and booking interface
- **PostgreSQL** - Store Users, ServiceListings, Bookings
- **TypeScript** - Prevent booking validation errors (user can't book their own service)

### Stage 2: The Urban Expansion (Multi-City Network, 500+ Neighborhoods)
**Goal**: Regional scalability with geospatial precision  
**Tech in Use**:
- **H3-JS (Uber's geospatial library)** - Radius-based discovery (5km, 10km, 25km queries)
- **PostgreSQL + Advanced Indexing** - Handle regional variations, filter by category/neighborhood/price
- **Redis (Upstash)** - Cache frequently searched categories and neighborhood listings
- **Payload Plugin Architecture** - RBAC (Role-Based Access Control) via custom permissions
- **ESLint/Prettier** - Code quality for expanding team

### Stage 3: National Scale & Real-Time
**Goal**: Thousands of concurrent operations, nationwide service exchange  
**Tech in Use**:
- **@upstash/realtime + WebSockets** - In-app messaging between Seekers and Providers
- **@upstash/redis + Pub/Sub** - Message queue for persistence and offline push notifications
- **React 19 + Motion (animations)** - Real-time UI updates for message delivery status
- **Vitest + Playwright** - Comprehensive testing for high-concurrency scenarios
- **Payload Plugin System** - Audit logging of all status changes and financial transactions
- **GraphQL** - Efficient querying for complex relationship data (users ↔ ratings ↔ services)

---

| Field | Value |
|-------|-------|
| **Name** | `payload-project` |
| **Version** | `1.0.0` |
| **License** | MIT (Open Source) |
| **Type** | `module` (ES Modules) |
| **Description** | Website template for Payload |

---

## Project Metadata

| Field | Value |
|-------|-------|
| **Name** | `payload-project` (Neighbourly backend) |
| **Version** | `1.0.0` |
| **License** | MIT (Open Source) |
| **Type** | `module` (ES Modules) |
| **Purpose** | Hyper-local marketplace platform (skills, tools, services exchange) |

---

```json
{
  "node": "^18.20.2 || >=20.9.0",
  "pnpm": "^9 || ^10"
}
```

### Key Requirements:
- **Node.js**: Supports v18.20.2+ or v20.9.0+
- **Package Manager**: `pnpm` v9 or v10 (NOT npm or yarn)
  - pnpm is used for its efficiency and workspace support
  - Configuration: Only builds native dependencies (`sharp`, `esbuild`, `unrs-resolver`) to optimize installation

---

## NPM Scripts

### Development & Building

| Command | Purpose | Notes |
|---------|---------|-------|
| `dev` | Start development server | Hot-reload enabled via Next.js |
| `build` | Create production build | Suppresses deprecation warnings with NODE_OPTIONS |
| `postbuild` | Generate sitemap after build | Uses next-sitemap for SEO optimization |
| `dev:prod` | Simulate production locally | Cleans .next, builds, then starts |
| `start` | Run production server | Must run `build` first |

### Code Quality

| Command | Purpose |
|---------|---------|
| `lint` | Check code with ESLint |
| `lint:fix` | Auto-fix ESLint violations |

### Testing

| Command | Purpose | Framework |
|---------|---------|-----------|
| `test` | Run all tests (integration + E2E) | Runs both commands sequentially |
| `test:int` | Integration tests only | Vitest with jsdom |
| `test:e2e` | End-to-end browser tests | Playwright |

### CMS & Type Generation

| Command | Purpose | Description |
|---------|---------|-------------|
| `payload` | Payload CLI entry point | Access all Payload commands |
| `generate:types` | Generate TypeScript types from schema | Creates payload-types.ts from Payload config |
| `generate:importmap` | Generate Payload import map | Required for Payload plugin resolution |

### Utilities

| Command | Purpose |
|---------|---------|
| `ii` | Install dependencies ignoring workspaces | `pnpm --ignore-workspace install` |
| `reinstall` | Clean install (remove node_modules & lock file) | Use if dependencies are corrupted |

### Common Usage Flow:

```bash
# Initial setup
pnpm install                    # Install all dependencies
pnpm run generate:types         # Generate TypeScript types
pnpm run dev                    # Start development server (http://localhost:3000)

# Development workflow
pnpm run lint:fix              # Fix any linting issues
pnpm run test:int              # Run integration tests
pnpm run build                 # Build for production

# Production deployment
pnpm run start                 # Run production server
```

---

## Core Dependencies (v3.70.0)

All Payload CMS packages are pinned to **version 3.70.0** for consistency.

### Payload CMS Ecosystem: Neighbourly's Data & Content Layer

```json
{
  "payload": "3.70.0",                          // Core framework for managing Users, ServiceListings, Bookings, Reviews
  "@payloadcms/db-postgres": "3.70.0",         // PostgreSQL adapter (handles multi-city data scaling)
  "@payloadcms/next": "3.70.0",                // Next.js integration for hybrid rendering
  "@payloadcms/admin-bar": "3.70.0",           // Moderator dashboard for community safety
  "@payloadcms/live-preview-react": "3.70.0",  // Real-time preview for service listing drafts
  "@payloadcms/plugin-form-builder": "3.70.0", // Dynamic forms for service requests and bookings
  "@payloadcms/plugin-nested-docs": "3.70.0",  // Hierarchical structure (City → Neighborhood → Category)
  "@payloadcms/plugin-redirects": "3.70.0",    // Handle URL changes when services are archived
  "@payloadcms/plugin-search": "3.70.0",       // Full-text search for services (Stage 2: multi-city search)
  "@payloadcms/plugin-seo": "3.70.0",          // SEO for neighborhood landing pages
  "@payloadcms/richtext-lexical": "3.70.0",    // Rich descriptions for service listings
  "@payloadcms/ui": "3.70.0"                   // Admin dashboard for content management
}
```

**Why Payload?** Provides flexible content schemas for Users (with ratings), Services, Bookings, and Audit Logs without building a custom CMS. Built-in access control supports RBAC evolution.

### Frontend & UI Framework: Building Role-Adaptive Interfaces

```json
{
  "next": "15.4.10",              // Meta-framework: hybrid rendering for seeker vs. provider views
  "react": "19.2.1",              // Component-based UI for dynamic role-based views
  "react-dom": "19.2.1",          // DOM rendering for both server and client
  "tailwindcss": "^3.4.3",        // Utility CSS for responsive design across devices
  "tailwind-merge": "^2.3.0",     // Smart class merging (essential for dynamic role-based theming)
  "tailwindcss-animate": "^1.0.7" // Smooth animations for real-time notifications
}
```

**Neighbourly Use Cases**:
- **Provider Dashboard**: Real-time booking requests with live notification animations
- **Seeker Search**: Map-based interface showing services within 5km/10km/25km radius
- **Responsive Design**: Works seamlessly on mobile (primary use case for local discovery)

### Component Libraries & Accessibility: Trust Through Design

```json
{
  "@radix-ui/react-checkbox": "^1.0.4",  // Verify terms and conditions during signup
  "@radix-ui/react-label": "^2.0.2",     // Accessible form labels for trust-building (license, verification)
  "@radix-ui/react-select": "^2.0.0",    // Accessible dropdowns (category, city, skill filters)
  "@radix-ui/react-slot": "^1.0.2",      // Flexible component composition for role-based rendering
  "class-variance-authority": "^0.7.0",  // Component variants (e.g., "pending booking" vs. "confirmed")
  "clsx": "^2.1.1",                      // Conditional styling (disabled buttons for unverified users)
  "lucide-react": "^0.378.0",            // Icons for service categories and status indicators
  "geist": "^1.3.0",                     // Vercel's design system (professional marketplace feel)
  "motion": "^12.25.0"                   // Animations for real-time booking status changes
}
```

**Why These Matter**:
- **Accessibility**: Radix UI ensures WCAG compliance (trust requires inclusive design)
- **Role-Based UI**: CVA makes it easy to render different states for verified/unverified users
- **Real-Time Feedback**: Motion library animates booking confirmations and message arrivals

### Form & Data Management: Validation & Trust

```json
{
  "react-hook-form": "7.45.4",  // Lightweight form state (booking requests, service listings)
  "zod": "^4.3.6"               // Runtime schema validation (ensure valid booking times, user ratings)
}
```

**Neighbourly Application**:
```typescript
// Example: Validate booking request with Zod
const bookingSchema = z.object({
  serviceId: z.string(),
  providerId: z.string(),
  seekerId: z.string(),
  startTime: z.date().refine(d => d > new Date(), "Cannot book in past"),
  endTime: z.date(),
}).refine(data => data.endTime > data.startTime, "End time must be after start time")
  .refine(data => data.providerId !== data.seekerId, "Cannot book own service");
```

### Data, Location & Real-Time: The Neighbourly Engine

```json
{
  "graphql": "^16.8.2",              // Efficient querying for user ratings, service history
  "h3-js": "^4.4.0",                 // CRITICAL: Hexagonal geospatial indexing for radius-based discovery
  "@upstash/redis": "^1.36.1",       // Distributed caching + Pub/Sub for message queue
  "@upstash/realtime": "^1.0.2"      // WebSocket connection for real-time messaging
}
```

**H3-JS: The Secret Sauce for Geospatial Discovery**
```typescript
// Stage 2: Find all services within 10km of user's location
const userH3Index = latLngToCell(latitude, longitude, RESOLUTION_10KM);
const nearbyIndexes = gridDisk(userH3Index, radius); // H3 grid expansion
// Query services in all nearby hexagons → dramatically faster than lat/lng radius math
```

**Upstash Redis for Multi-Stage Scaling**:
- **Stage 1**: Cache service listings by neighborhood
- **Stage 2**: Cache popular categories across cities
- **Stage 3**: Pub/Sub message queue for booking notifications + offline message persistence

**Upstash Realtime for Stage 3 Messaging**:
```typescript
// Live messaging between Seeker and Provider
const channel = realtime.subscribe(`booking:${bookingId}`);
channel.on('message', (msg) => {
  // Both users see updates instantly (WebSocket)
  // Falls back to polling for unstable connections
});
```

### Content & Utilities: Supporting Core Features

```json
{
  "sharp": "0.34.2",                   // Image processing for user avatars + service photos (Stage 2+)
  "prism-react-renderer": "^2.3.1",    // Code syntax highlighting for technical skill listings
  "react-toastify": "^11.0.5",         // Toast notifications for booking confirmations, messages
  "dotenv": "16.4.7",                  // Environment secrets (DB, Redis, API keys)
  "cross-env": "^7.0.3",               // Cross-platform env variable handling
  "next-sitemap": "^4.2.3"             // Sitemap for SEO (neighborhood landing pages)
}
```

**Neighbourly Examples**:
- **Sharp**: Resize provider avatars to 100x100 for trust badges
- **Toastify**: "Booking confirmed!", "New message from @john", "Your service expires in 24h"
- **Sitemap**: Help users find "babysitting in Brooklyn" via Google search

---

## Development Dependencies: Quality & Reliability at Scale

### Testing & Quality Assurance: Stage 3 Readiness

```json
{
  "vitest": "3.2.3",                     // Fast unit tests for marketplace logic
  "@testing-library/react": "16.3.0",    // Component testing (booking flows, messaging UI)
  "@playwright/test": "1.56.1",          // End-to-end tests for critical user journeys
  "playwright": "1.56.1",                // Cross-browser automation
  "playwright-core": "1.56.1",           // Core Playwright engine
  "jsdom": "26.1.0"                      // DOM simulation for Node.js tests
}
```

**Critical Test Scenarios**:
- ✅ User cannot book their own service (Stage 1)
- ✅ Radius-based search returns correct neighborhoods (Stage 2, H3-dependent)
- ✅ No double-booking on concurrent requests (Stage 3, concurrency testing)
- ✅ Messages persist when user is offline (Stage 3, Pub/Sub testing)
- ✅ Audit logs capture all financial transactions (Stage 3)

**Example: E2E Test for Booking Atomicity**
```typescript
// Ensure two seekers can't book the same slot simultaneously
test('prevents double-booking with concurrent requests', async () => {
  const slot = await createAvailableSlot(providerId, '2pm-3pm');
  
  const [result1, result2] = await Promise.all([
    seeker1.bookSlot(slot.id),
    seeker2.bookSlot(slot.id)
  ]);
  
  expect(result1.success).toBe(true);
  expect(result2.error).toBe('SLOT_ALREADY_BOOKED');
});
```

### Code Quality & Linting: Team Collaboration

```json
{
  "eslint": "^9.16.0",                 // Enforce code standards (important for expanding team)
  "eslint-config-next": "15.4.7",      // Next.js-specific best practices
  "@eslint/eslintrc": "^3.2.0",        // ESLint configuration management
  "prettier": "^3.4.2"                 // Automatic code formatting
}
```

**Why This Matters**: As Neighbourly scales from single-community to nationwide, consistent code standards ensure onboarded engineers can quickly understand the codebase.

### Build Tools & CSS: Production Optimization

```json
{
  "tailwindcss": "^3.4.3",            // CSS framework with tree-shaking (only styles used = smaller bundle)
  "autoprefixer": "^10.4.19",         // Browser vendor prefixes (-webkit, -moz, etc.)
  "postcss": "^8.4.38",               // CSS processing pipeline
  "@tailwindcss/typography": "^0.5.13" // Beautiful typography for service descriptions
}
```

### Type Checking & Compilation: Safety First

```json
{
  "typescript": "5.7.3",              // Type safety for booking logic, user validation
  "@types/node": "22.5.4",            // Node.js API types
  "@types/react": "19.2.1",           // React component types
  "@types/react-dom": "19.2.1",       // DOM types
  "@types/escape-html": "^1.0.2",     // HTML sanitization types (prevent XSS in user bios)
  "vite-tsconfig-paths": "5.1.4",     // Module path resolution
  "@vitejs/plugin-react": "4.5.2"     // Vite React plugin
}
```

**Type Safety Benefits for Neighbourly**:
- Prevents passing wrong user IDs (Provider ID vs. Seeker ID)
- Ensures booking dates are valid dates, not strings
- Validates rating scores are 1-5, not 0 or 10
- Catches typos in geospatial queries before runtime

### Build & File Utilities

```json
{
  "copyfiles": "^2.4.1"  // Copy files during build process
}
```

---

## Plugin Configuration

### pnpm Setup

```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "sharp",
      "esbuild",
      "unrs-resolver"
    ]
  }
}
```

**Explanation**: Only these packages need native compilation. This speeds up installation for other dependencies.

---

## Technology Stack Summary: Neighbourly's Architecture Across Stages

### Stage 1: Single Community MVP
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js + React | Simple listing and booking interface |
| **Backend** | Payload CMS | User, ServiceListing, Booking schemas |
| **Database** | PostgreSQL | Relational storage (can start with local SQLite, migrate to PG) |
| **Validation** | Zod + React Hook Form | Prevent invalid bookings (user can't book own service) |
| **Language** | TypeScript | Type safety for marketplace logic |

### Stage 2: Multi-City Expansion (500+ Neighborhoods)
| Addition | Technology | Purpose |
|----------|-----------|---------|
| **Location Engine** | H3-JS | Radius-based discovery (5km, 10km, 25km) |
| **Caching** | Upstash Redis | Cache popular categories, neighborhood listings |
| **Search** | Payload Search Plugin | Full-text search across cities |
| **Access Control** | Payload RBAC | Role-Based Access Control (moderators, verified providers) |
| **API Quality** | ESLint + Prettier | Team scaling with code standards |

### Stage 3: National Scale & Real-Time
| Addition | Technology | Purpose |
|----------|-----------|---------|
| **Real-Time Messaging** | Upstash Realtime (WebSockets) | Instant communication between Seeker and Provider |
| **Message Queue** | Redis Pub/Sub | Persistent queue for offline users, push notifications |
| **High-Concurrency Testing** | Playwright | Prevent double-booking, test race conditions |
| **Audit Logging** | Payload Hooks | Immutable logs of all status changes, transactions |
| **UI Animations** | Motion | Real-time notification animations |

---

## How Dependencies Evolve with Project Stages

```
Stage 1 (MVP)
├── Core: Payload + Next.js + PostgreSQL
├── Validation: Zod + React Hook Form
└── Testing: Vitest basics

        ↓ (Scale from dozens to 500+ neighborhoods)

Stage 2 (Multi-City)
├── + H3-JS for geospatial queries
├── + Redis (Upstash) for caching
├── + Payload Search plugin
├── + Extended ESLint/Prettier (team grows)
└── + Playwright for booking concurrency tests

        ↓ (Scale to national, thousands of concurrent users)

Stage 3 (National Scale)
├── + Upstash Realtime for WebSockets messaging
├── + Redis Pub/Sub for message persistence
├── + Comprehensive audit logging via Payload hooks
├── + Motion library for real-time UI feedback
└── + Full E2E test coverage for race conditions
```

### Backend & CMS
- **Framework**: Payload CMS v3.70.0 (Headless CMS)
- **Database**: PostgreSQL
- **Plugins**: Form Builder, Nested Docs, Redirects, Search, SEO, Live Preview

### Frontend
- **Framework**: Next.js 15.4.10 (React meta-framework)
- **UI Library**: React 19.2.1
- **Styling**: Tailwind CSS v3.4.3
- **Components**: Radix UI primitives + custom components

### Development
- **Language**: TypeScript 5.7.3
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Linting**: ESLint 9 + Prettier
- **Forms**: React Hook Form + Zod validation

### Additional Features
- **Geospatial**: H3 hexagonal indexing
- **Caching & Realtime**: Upstash Redis + Realtime
- **Code Highlighting**: Prism React Renderer
- **Icons**: Lucide React
- **Animations**: Motion library

---

## Installation & Setup

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Generate Types
```bash
pnpm run generate:types
```

### Step 3: Start Development
```bash
pnpm run dev
```

The application will start at `http://localhost:3000`

### Step 4: Access Payload Admin (if configured)
The Payload CMS admin panel is typically at `/admin` (configure in payload.config.ts)

---

## Environment Variables

Look for a `.env.local` file (not in version control) that should contain:
- Database connection string (PostgreSQL)
- Payload secret key
- Upstash Redis credentials
- Any third-party API keys

See `test.env` in the project root for example variables.

---

## Critical Database Schemas (Implemented via Payload Collections)

```typescript
// User (Provider or Seeker)
{
  id: string;
  email: string;
  name: string;
  role: 'provider' | 'seeker' | 'moderator';
  verified: boolean;
  verificationMethod?: 'email' | 'phone' | 'idPhoto';
  avatar?: Image;
  
  // Reputation Engine (Stage 2+)
  averageRating: number;  // 1-5, weighted by recency
  totalReviews: number;
  trustScore: number;     // Composite metric
  
  // Location
  h3Index?: string;       // Stage 2: geospatial hex index
  latitude?: number;
  longitude?: number;
  neighborhood?: string;  // City/neighborhood string
  
  // Audit trail (Stage 3)
  createdAt: Date;
  lastActiveAt: Date;
}

// ServiceListing
{
  id: string;
  providerId: string;     // Reference to User
  title: string;
  description: string;
  category: 'tutoring' | 'equipment_rental' | 'repairs' | ...;
  hourlyRate: number;
  availability: TimeSlot[]; // [{day: 'Mon', startTime: '9am', endTime: '5pm'}, ...]
  
  // Location (Stage 2)
  h3Index: string;
  neighborhood: string;
  maxServiceRadius: number; // in km
  
  // Trust & Verification
  verified: boolean;
  tags: string[];
  
  // Audit (Stage 3)
  createdAt: Date;
  updatedAt: Date;
}

// Booking
{
  id: string;
  serviceId: string;      // Reference to ServiceListing
  providerId: string;     // Indexed for queries
  seekerId: string;       // Cannot equal providerId
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  
  // Real-time coordination (Stage 3)
  lastStatusChangeAt: Date;
  statusChangeLog: {timestamp: Date; from: string; to: string}[];
  
  // Messaging (Stage 3)
  conversationId: string; // Reference to Message thread
}

// Review & Rating (Stage 2+)
{
  id: string;
  bookingId: string;      // Reference to Booking
  reviewerId: string;     // Reference to User
  revieweeId: string;     // Reference to User
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  
  // Reputation Engine
  recencyScore: number;   // Newer reviews weighted higher
  reliabilityScore: number; // Based on booking history
  createdAt: Date;
}

// Audit Log (Stage 3 - immutable)
{
  id: string;
  entityType: 'booking' | 'user' | 'serviceListing';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'statusChanged';
  userId: string;         // Who made the change
  changes: Record<string, {before: any; after: any}>;
  timestamp: Date;
}
```

✅ **Live Preview** - Real-time content preview in the CMS  
✅ **Form Builder** - No-code form creation in the admin  
✅ **SEO Management** - Built-in SEO field configurations  
✅ **Search** - Full-text search with indexing  
✅ **Redirects** - URL redirect management system  
✅ **Nested Documents** - Hierarchical document structures  
✅ **Accessibility** - Radix UI ensures WCAG compliance  
✅ **Type Safety** - Full TypeScript support with generated types  
✅ **Image Processing** - Sharp for optimized images  
✅ **Geospatial** - H3 geospatial indexing for location-based features

---

## Build & Production

### Development Build
```bash
pnpm run dev          # Auto-reloading dev server
```

### Production Build
```bash
pnpm run build        # Optimize for production
pnpm run start        # Run production server
```

### Build Process:
1. TypeScript compilation
2. Next.js optimization
3. Sitemap generation
4. Output ready for deployment

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `sharp` installation fails | Already handled via pnpm `onlyBuiltDependencies` |
| Node version mismatch | Use Node 18.20.2+ or 20.9.0+ with pnpm v9/v10 |
| Type errors after changes | Run `pnpm run generate:types` |
| Stale dependencies | Run `pnpm run reinstall` to clean install |
| ESLint errors | Run `pnpm run lint:fix` for auto-fixes |

---

## Scripts Breakdown by Category

### 🚀 **Server Management**
- `dev` - Development server with hot reload
- `start` - Production server (requires build first)
- `dev:prod` - Test production build locally

### 🔨 **Building**
- `build` - Create optimized production bundle
- `postbuild` - Auto-runs after build (generates sitemap)

### 🔍 **Code Quality**
- `lint` - Check for issues
- `lint:fix` - Auto-fix issues

### ✅ **Testing**
- `test` - Run all tests
- `test:int` - Unit/integration tests only
- `test:e2e` - Browser automation tests

### ⚙️ **CMS & Types**
- `payload` - Access Payload CLI directly
- `generate:types` - Create TypeScript types from schema
- `generate:importmap` - Generate module resolution map

### 📦 **Dependencies**
- `ii` - Install ignoring workspaces
- `reinstall` - Clean install from scratch

---

## File Structure Context

Based on the project structure, key files include:

| File | Purpose |
|------|---------|
| `payload.config.ts` | Payload CMS configuration |
| `next.config.js` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.mjs` | Tailwind CSS configuration |
| `.env.local` | Environment secrets (not in repo) |
| `src/collections/` | Payload document schemas |
| `src/app/` | Next.js app directory |
| `src/components/` | React components |
| `src/blocks/` | Reusable content blocks |

---

## Performance Optimizations

- **Image Optimization**: Sharp for WebP conversion and resizing
- **CSS**: Tailwind CSS with tree-shaking
- **Code Splitting**: Next.js automatic route-based splitting
- **Type Safety**: TypeScript prevents runtime errors
- **Form Performance**: React Hook Form minimizes re-renders
- **Caching**: Upstash Redis for distributed caching

---

## Deployment Considerations

Before deploying to production:

1. ✅ Set all environment variables
2. ✅ Run `pnpm run build` and verify success
3. ✅ Test with `pnpm run dev:prod`
4. ✅ Run `pnpm run test` to ensure tests pass
5. ✅ Configure PostgreSQL database
6. ✅ Set up Upstash Redis (if using realtime features)
7. ✅ Configure CDN for image delivery
8. ✅ Set up SSL/HTTPS

---

## Version Notes

- **Payload CMS**: Locked to 3.70.0 (careful when upgrading)
- **Next.js**: 15.4.10 (latest stable)
- **React**: 19.2.1 (latest major version)
- **Other deps**: Most use caret ranges (^) allowing minor updates

---

## Support & Documentation

- **Payload CMS Docs**: https://payloadcms.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs