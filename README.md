# VELOOP Rewards Giveaway Platform

A premium full-stack giveaway and rewards platform built with React, Vite, Bootstrap, CSS Modules, Node.js, Express, and MongoDB.

## Project Structure

    veloop-giveaway/
    ├── frontend/              # React + Vite application
    ├── backend/               # Express + MongoDB API
    └── README.md

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
