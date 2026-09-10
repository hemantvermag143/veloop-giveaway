# VELOOP Rewards Giveaway Platform

A premium full-stack giveaway and rewards platform built with React, Vite, Bootstrap, CSS Modules, Node.js, Express, and MongoDB.

## Project Structure

    veloop-giveaway/
    ├── frontend/              # React + Vite application
    ├── backend/               # Express + MongoDB API
    └── README.md

## Project Concept

VELOOP Rewards is designed around a transparent giveaway journey:

```text
Discover Giveaway
      ↓
Review Prize & Entry Fee
      ↓
Check Eligibility & Wallet
      ↓
Confirm Participation
      ↓
Entry Recorded + Transaction Created
      ↓
Giveaway Ends
      ↓
Winner Selection
      ↓
Winner / Non-Winner Experience
      ↓
Prize Claim
```

The backend is the source of truth for giveaway status, prize configuration, entry fees, wallet balances, participation, winners, transactions, claims, eligibility, fraud signals, and audit records.

## Core Features

- Active, upcoming, and completed giveaways
- Dynamic giveaway countdowns
- Prize-focused cards and dedicated giveaway detail pages
- One participation per user per giveaway
- Backend-authoritative entry fee and currency validation
- Atomic wallet deductions with MongoDB transactions
- Idempotency protection for repeated participation requests
- Suspicious activity detection and audit logging
- Automatic winner selection after giveaway completion
- Public winner ID masking
- Winner claim workflow
- Physical prize and gift-card claim forms
- Claim lifecycle: NOT_SUBMITTED, SUBMITTED, PROCESSING, COMPLETED, EXPIRED
- User transaction history
- Admin claim processing dashboard
- Authentication and role-based admin authorization
- Helmet, CORS, rate limiting, validation, and centralized error handling
- Responsive reward-platform interface
- Custom giveaway loader and loading states

## Technology Stack

### Frontend

- React
- Vite
- Bootstrap
- CSS Modules
- React Hooks
- Lucide React

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- Zod validation
- Helmet
- express-rate-limit

## Local Setup

### Backend

    cd backend
    npm install
    node src/server.js

Backend:
http://localhost:5000

### Frontend

    cd frontend
    npm install
    npm run dev

Use the Vite development URL shown in the terminal.

## API Overview

### Giveaway APIs

    GET /api/giveaways
    GET /api/giveaways/current
    GET /api/giveaways/:id
    GET /api/giveaways/slug/:slug
    GET /api/giveaways/previous
    GET /api/giveaways/previous/winners
    GET /api/giveaways/:id/winners

### Authenticated APIs

    GET  /api/giveaways/my-transactions
    GET  /api/giveaways/:id/my-status
    POST /api/giveaways/:id/join
    GET  /api/giveaways/:id/my-winner-status
    POST /api/giveaways/:id/claim
    GET  /api/giveaways/:id/my-claim

### Authentication

    POST /api/auth/register
    POST /api/auth/login
    GET  /api/auth/me

### Admin APIs

    POST /api/admin/giveaways/:id/select-winners
    GET  /api/admin/claims
    POST /api/admin/claims/:id/process
    POST /api/admin/claims/:id/complete

## Demo Accounts

### Demo User

    Email: demo@veloop.test
    Password: Veloop@12345
    User ID: VE32484168

### Demo Admin

    Email: admin@veloop.test
    Password: VeloopAdmin@2026!
    User ID: VEADMIN01

These credentials are for local/demo use only and must not be used in production.

## Giveaway Lifecycle

    UPCOMING
        ↓
    ACTIVE
        ↓
    ENDED
        ↓
    Winner Selection
        ↓
    Winner Reveal / Claim

The backend lifecycle scheduler synchronizes giveaway states and automatically attempts winner selection for ended giveaways with eligible participants.

## Financial Integrity

The backend is the source of truth for entry amount, currency, prize, winner status, and wallet balance.

Each entry deduction is recorded in GiveawayEntryTransaction and wallet changes are performed atomically.

Supported transaction types:

    ENTRY_FEE
    REVERSAL

Idempotency keys protect retryable participation requests from duplicate processing. Stale processing keys are recoverable after the configured timeout.

## User States

The frontend supports the main giveaway states:

- Visitor
- Logged-in user not participating
- Participant
- Winner
- Non-winner
- Giveaway ended
- Upcoming giveaway

UI actions and messaging change according to authentication, participation, giveaway status, and winner status.

## Winner System

Winner selection is backend-controlled and is triggered after an eligible giveaway ends.

Active giveaways do not falsely display finalized winners. Completed giveaways expose winner history while public user identifiers remain masked, for example:

```text
VE****42
```

Previous winners remain associated with their original giveaway so historical records are preserved.

## Prize Claim System

Only an authenticated user whose backend-controlled identity matches a winner can access the claim flow.

Before submission, the user sees the prize, giveaway, winner status, claim deadline, and required information.

### Physical Prize

Physical prizes collect:

- Full Name
- Phone Number
- Complete Address
- City
- State
- PIN Code

### Amazon Gift Card

Amazon gift-card winners provide an email address for delivery rather than a physical shipping address.

Supported claim states:

```text
NOT_SUBMITTED
SUBMITTED
PROCESSING
COMPLETED
EXPIRED
```

## Responsive Design

The interface is designed for mobile, tablet, desktop, and large desktop layouts.

Validated responsive targets include:

- 320px mobile
- 768px tablet
- 1024px desktop
- 1440px+ large desktop

Responsive behavior includes stacked mobile hero layouts, touch-friendly controls, responsive statistics, mobile-safe prize cards, readable winner sections, compact wallet display, responsive claim forms, and a responsive footer.

## Animation & Interaction

Motion is intentionally restrained and reward-focused.

Implemented interactions include:

- Custom giveaway loading animation
- Countdown updates
- Smooth winner slider transitions
- Auto-rotating winner announcements
- Pause-on-hover behavior
- Join success feedback

The visual direction avoids excessive flashing, casino-style effects, and unnecessary heavy animation.

## Demo Data & Development Notes

The repository includes structured giveaway seed data for local development and testing. Giveaway configuration such as prize, currency, entry amount, status, and winner count is stored in the backend data model rather than being scattered across frontend components.

Demo data is intended for development and evaluation only and must not be presented as real VELOOP production statistics.

## Screenshots & Demo

Recommended final project evidence includes:

- Desktop giveaway home
- Tablet giveaway home
- Mobile giveaway home
- Active giveaway details
- Upcoming giveaway details
- Ended giveaway and winner results
- Previous winners
- Winner claim modal
- Amazon gift-card claim experience
- Non-winner experience
- Transaction history and wallet balances

Live demo URL can be added here after deployment.

## Security

- JWT authentication
- Password hashing
- Admin role authorization
- Zod request validation
- 10 KB JSON payload limit
- Global API rate limiting
- Join and claim rate limiting
- Helmet security headers
- Explicit CORS configuration
- Centralized error handling
- Audit logging
- Suspicious activity detection

## Build Verification

Frontend:

    cd frontend
    npm run build

Backend syntax:

    cd backend
    node --check src/server.js

## Deployment Notes

Before production deployment:

1. Configure production environment variables and secrets.
2. Use a managed MongoDB deployment.
3. Restrict CORS to the deployed frontend origin.
4. Replace demo credentials.
5. Use a strong production JWT secret.
6. Configure production logging and monitoring.
7. Deploy frontend and backend using the selected hosting architecture.
## GitHub

Repository:
https://github.com/hemantvermag143/veloop-giveaway

## Future Improvements

Potential production extensions include advanced fraud scoring, expanded admin analytics, automated prize fulfillment, production monitoring, CI/CD, and additional automated integration and end-to-end tests.

## Repository Status

The repository contains the implemented VELOOP Rewards giveaway frontend, backend, database models, API documentation, seed data, wallet and transaction flow, winner system, prize claim system, security controls, and responsive UI.
