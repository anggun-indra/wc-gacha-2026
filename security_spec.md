# Security Specification - World Cup Prediction & Team Gacha

This document defines the security specification for our Firestore database, ensuring that our client-side serverless architecture is completely hardened against exploits.

## 1. Data Invariants

1. **User Cap Isolation**: The total number of registered users must never exceed 8. Submitting a new user profile is strictly forbidden if `system/metadata`'s `userCount` is already 8.
2. **Identity Verification**: A user can only register their own profile document (`/users/{userId}` where `userId == request.auth.uid`). Users must have verified emails (`request.auth.token.email_verified == true`).
3. **No Duplicate Gacha Assignments**: In the team allocation transaction, each of the 8 teams in the Top Tier and the 8 teams in the Dark Horses must be assigned to exactly 1 user (bijective mapping). Duplicate team ownership is forbidden.
4. **Immutable Fields**:
   - For users: `userId`, `email`, and `createdAt` are immutable once set.
   - For teams: `id`, `name`, and `tier` are immutable once set.
5. **System Metadata Integrity**:
   - `userCount` is strictly positive, increments of 1, up to a maximum of 8.
   - `gachaTriggered` can only transition from `false` to `true` (unidirectional).
   - `dayCounter` is strictly positive and can only increment.
6. **Lazy Daily Sync Guard**: Team `points` and `probability` changes are only permitted during the daily update transaction where the metadata `lastUpdated` is updated to current time and `dayCounter` is incremented.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads attempt to compromise the app's integrity and must be blocked with `PERMISSION_DENIED`.

### Identity & Registration Hacks:
1. **The 9th Player Infiltration**: A new user attempts to register as the 9th player when `userCount` is already 8.
2. **The Impersonator Profile**: Auth user `UID-A` attempts to write a user document at path `/users/UID-B`.
3. **The Unverified Entry**: A user with an unverified Google account (`email_verified == false`) attempts to register.
4. **The Direct Self-Promo Role**: A user attempts to write custom field `isAdmin: true` inside their `/users/userId` document.

### Gacha & Team Assignments Hacks:
5. **The Team-Stealing Payload**: A player tries to update their user document to steal "France" from another user outside of the valid 8th-user gacha transaction.
6. **The Double Top-Tier Swindle**: A player attempts to self-assign multiple Top Tier teams (e.g. `topTierTeam: ["France", "Argentina"]`).
7. **The Free-Agent Spoof**: A user attempts to wipe their team settings or modify another player's team ownership.

### Lazy Sync & Score Manipulation Hacks:
8. **The Arbitrary Points Buff**: A player attempts to manually set their favorite team's points to 100 without updating the timestamp/day counter.
9. **The Negative Score Injection**: A user attempts to write negative points (e.g. `points = -5`) to another player's team.
10. **The Probability Overflow**: A player attempts to write a winning probability of `110%` to their own team.
11. **The Reverse Time Traveler**: A malicious player attempts to set `lastUpdated` to a day in the past to trigger multiple updates.
12. **The Shadow Field Injection**: A user attempts to add extra fields (e.g., `hackedPointsSecretKey: true`) to the system metadata or team files to exploit downstream rendering.

---

## 3. Firestore Security Rules Design

The ruleset will utilize the global catch-all deny rule, check Google Auth verification status, validate document IDs via standard regex, and handle:
- **Bijective updates** during team-assignments by restricting user documents updates if `gachaTriggered` is transitioning.
- **Timestamp temporal integrity** via `request.time`.
- **Strict key checking** via `affectedKeys().hasOnly()`.
