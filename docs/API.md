# VELOOP Rewards API Documentation

Base URL:

    http://localhost:5000

Authentication:

    Authorization: Bearer <JWT_TOKEN>

## Giveaway APIs

### Get All Giveaways

    GET /api/giveaways

Returns active, upcoming, and completed giveaways available to the frontend.

### Get Current Giveaway

    GET /api/giveaways/current

Returns the current active giveaway.

### Get Giveaway By ID

    GET /api/giveaways/:id

Returns a dedicated giveaway record including prize and lifecycle information.

### Get Giveaway By Slug

    GET /api/giveaways/slug/:slug

Returns a giveaway using its public slug.

### Get Previous Giveaways

    GET /api/giveaways/previous

Returns completed giveaway history.

### Get Previous Winners

    GET /api/giveaways/previous/winners

Returns previous winner history with public user IDs masked.

### Get Giveaway Winners

    GET /api/giveaways/:id/winners

For an active giveaway, the endpoint does not expose current winners before completion.

## Participation APIs

### Get My Participation Status

    GET /api/giveaways/:id/my-status

Authentication required.

Returns whether the authenticated user has already entered the giveaway.

### Join Giveaway

    POST /api/giveaways/:id/join

Authentication required.

Request body:

    {
      "giveawayId": "GW-IP15"
    }

The backend derives the authoritative prize, entry amount, and entry currency from the giveaway configuration.

Supported idempotency header:

    Idempotency-Key: unique-request-key

The backend prevents duplicate participation for the same user and giveaway.

### Get My Transaction History

    GET /api/giveaways/my-transactions

Authentication required.

Returns wallet entry transactions for the authenticated user.

## Winner APIs

### Get My Winner Status

    GET /api/giveaways/:id/my-winner-status

Authentication required.

Returns winner information for the authenticated user without exposing other users' private details.

## Claim APIs

### Submit Prize Claim

    POST /api/giveaways/:id/claim

Authentication required.

Physical prize fields:

    {
      "fullName": "...",
      "phone": "...",
      "address": "...",
      "city": "...",
      "state": "...",
      "pin": "..."
    }

Gift-card fields:

    {
      "email": "..."
    }

The backend verifies the authenticated user, giveaway, winner status, prize, and claim deadline.

### Get My Claim

    GET /api/giveaways/:id/my-claim

Authentication required.

Possible claim states:

    NOT_SUBMITTED
    SUBMITTED
    PROCESSING
    COMPLETED
    EXPIRED

## Authentication APIs

### Register

    POST /api/auth/register

Creates an eligible VELOOP user account.

### Login

    POST /api/auth/login

Returns a JWT token after successful authentication.

### Get Current User

    GET /api/auth/me

Authentication required.

Returns the authenticated user's public account, balances, status, and role.

## Admin APIs

### Select Winners

    POST /api/admin/giveaways/:id/select-winners

Authentication required.

Admin role required.

Winner selection is available only after the giveaway has ended and eligible participants exist.

### Get Claims

    GET /api/admin/claims

Authentication required.

Admin role required.

Returns prize claims for administrative processing.

### Process Claim

    POST /api/admin/claims/:id/process

Authentication required.

Admin role required.

Moves a submitted claim to PROCESSING.

### Complete Claim

    POST /api/admin/claims/:id/complete

Authentication required.

Admin role required.

Moves a processing claim to COMPLETED.

## Standard Error Format

Errors use a consistent response shape:

    {
      "success": false,
      "code": "ERROR_CODE",
      "message": "Human-readable message"
    }

Common giveaway/participation errors include:

    GIVEAWAY_NOT_FOUND
    GIVEAWAY_NOT_ACTIVE
    GIVEAWAY_ENDED
    ALREADY_PARTICIPATING
    INSUFFICIENT_VE_BALANCE
    INSUFFICIENT_SVE_BALANCE
    INSUFFICIENT_TOKEN_BALANCE
    LOGIN_REQUIRED
    PARTICIPATION_BLOCKED
    SUSPICIOUS_ACTIVITY
    RATE_LIMITED

## Security Rules

The backend remains authoritative for wallet and giveaway financial decisions.

Clients cannot choose:

- Entry amount
- Entry currency
- Prize
- Winner status
- Wallet balance

Authentication, authorization, validation, request limits, rate limiting, audit logging, and public winner-ID masking are enforced server-side.
