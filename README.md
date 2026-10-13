# IBA ProBattle

A services marketplace built with **Next.js** and **Payload CMS**. Users can post services, browse listings, and book jobs. The project was developed in three stages, each adding a layer of functionality on top of the last.

## Overview

IBA ProBattle connects people who offer services with people who need them. Providers post and manage listings, customers browse and send booking requests, and the platform handles authentication, access control, and (in the final stage) live communication between both sides.

## Stages

The repository holds all three stages as separate, runnable projects.

| Stage | Folder | Focus |
| --- | --- | --- |
| 1 | `Stage-1/` | Core marketplace: auth, service listings, posting services, bookings, products |
| 2 | `Stage-2/` | Service editing, "My Jobs" view, availability slots, geocoding, spatial search, role-based access control, rate limiting |
| 3 | `Stage-3/` | Real-time chat rooms, Redis-backed messaging, theme toggle |

### Stage 1: Core Marketplace
- User sign up and login
- Browse and view service listings
- Post a new service
- Booking requests and a bookings list
- Products listing and purchase action
- Per-user data storage
- Payload admin panel with collections for Services, Bookings, Products, Users, and Media

### Stage 2: Smart Matching and Access Control
- Edit existing service listings
- "My Jobs" page for providers
- Availability slots collection
- Address geocoding and H3 spatial indexing for location-based features
- Role-based access control (RBAC)
- Throttling middleware to limit abusive requests

### Stage 3: Real-Time Communication
- Chat rooms with message history
- Real-time message delivery through a realtime API route
- Redis integration for realtime messaging
- Dark / light theme toggle

## Tech Stack

- **Framework:** Next.js (App Router) with React and TypeScript
- **CMS / Backend:** Payload CMS (admin panel, REST and GraphQL APIs)
- **Styling:** Tailwind CSS with shadcn-style UI components
- **Realtime:** Redis (Stage 3)
- **Spatial:** H3 geospatial indexing (Stages 2 and 3)
- **Testing:** Vitest (integration) and Playwright (end-to-end)
- **Tooling:** pnpm, ESLint, Prettier, Docker, Docker Compose

## Project Structure

Each stage follows the same layout:

```
Stage-X/
  src/
    app/
      (frontend)/    # Public site: services, bookings, login, signup, chat
      (payload)/     # Payload admin and API routes
    collections/     # Services, Bookings, Products, Slots, Users, ...
    access/          # Access control and RBAC helpers
    components/      # UI components
    lib/             # Geocoding, spatial, Redis, realtime helpers
    middleware/      # Throttling
    payload.config.ts
  tests/
    e2e/             # Playwright tests
    int/             # Vitest tests
  Dockerfile
  docker-compose.yml
  package.json
```

## Getting Started

### Prerequisites

- Node.js (see `engines` in each stage's `package.json`)
- pnpm
- Docker (optional)
- Redis (required for Stage 3 chat)

### Installation

```bash
# Clone the repository
git clone https://github.com/MayorEmpror/IBA-ProBattle.git
cd IBA-ProBattle

# Pick a stage
cd Stage-3

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database URI, Payload secret, and Redis URL

# Start the dev server
pnpm dev
```

The site runs at `http://localhost:3000` and the admin panel at `http://localhost:3000/admin`.

### Docker

```bash
docker-compose up
```

### Seeding demo data

After starting the app, open the admin panel and use the **Seed** button on the dashboard to load sample pages, posts, and services.

### Tests

```bash
pnpm test        # Run integration and e2e tests
```

## Notes

- Stages 2 and 3 include a `MIGRATION_INSTRUCTIONS.md` with notes for moving from the previous stage.
- Each stage includes an `AGENTS.md` and `.cursor/rules` folder documenting Payload conventions used in the project.

## Acknowledgements

- Built on the [Payload CMS website template](https://github.com/payloadcms/payload/tree/main/templates/website)
- [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
