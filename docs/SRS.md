# LearnHub Cameroon — Backend Software Requirements Specification

**Repo:** `learnhub-api` · **Version:** 1.0 · **Audience:** Backend engineering team
**Companion document:** `learnhub-web`'s Frontend SRS (`SRS.md` in that repo) — Section 5 of this document is the contract both sides must agree on.

---

## 1. Introduction

### 1.1 Purpose
This document specifies the backend requirements for LearnHub Cameroon's API: the data it must store, the endpoints it must expose, and the rules it must enforce. It is the source of truth for what to build; `README.md`'s "API documentation" table remains the source of truth for what is *actually already built* — update that table as each endpoint below ships.

### 1.2 Scope
LearnHub Cameroon is a subscription learning platform with a YouTube-shaped community layer: local tutors publish courses, students browse and watch course previews, and the social layer (like, comment, follow) plus a Mobile Money billing relationship ("support a tutor") make it feel like a creator platform, not a static course catalog.

**In scope for this API:** authentication, course catalog, the community layer (likes/comments/follows), Mobile Money-backed tutor support (subscriptions), and tutor earnings/payouts.
**Out of scope / not specified here:** admin/moderation tooling, email/SMS notifications, search infrastructure beyond basic filtering — flagged as open questions in Section 8 if they become necessary.

### 1.3 Audience
Backend developers and their lead implementing and reviewing `learnhub-api`. Frontend developers should read this only for the API contract (Section 5); everything else here is backend-internal.

### 1.4 Definitions
| Term | Meaning |
|---|---|
| Student | Default account role; browses, likes, comments, follows, and can support tutors financially |
| Tutor | Account role that publishes courses and receives support/earnings |
| Support / Subscription | A recurring Mobile Money billing relationship from a student to a tutor. **Not** a content paywall — course content is visible to any logged-in user regardless of support status |
| Envelope | This org's standard response shape: `{ success: boolean, data: any, message: string }` |

---

## 2. System Overview

### 2.1 Product perspective
`learnhub-api` is a standalone REST API consumed by `learnhub-web` (and potentially a future mobile client). It owns all persistent state; the frontend holds no business logic beyond client-side validation and UI state.

### 2.2 User roles / actors
- **Guest** — unauthenticated. Can browse courses, tutors, course detail, tutor profiles, About. Cannot like/comment/follow/support.
- **Student** — authenticated, `role: "student"`. Everything a Guest can do, plus like/comment/follow, support tutors, manage their own subscriptions and profile.
- **Tutor** — authenticated, `role: "tutor"`. Everything a Student can do (a tutor can also browse/like/follow other tutors), plus create/edit/publish their own courses, and view their own earnings/payouts.
- No **Admin** role is defined yet — see Section 8 (open questions) before building moderation features.

### 2.3 Tech stack & constraints
- Node.js + Express, MongoDB Atlas + Mongoose, JWT auth (already scaffolded in `src/middleware/auth.js` — HS256 pinned, generic 401 on failure, do not change this contract without updating the frontend SRS too).
- Hosting: Render.
- All responses use the envelope shape. All secrets (`JWT_SECRET`, `MONGO_URI`, Mobile Money provider keys) come from environment variables — never hardcoded, never logged.
- Every broker/provider call (Mobile Money API) must have an explicit timeout and retry-with-backoff, per this org's third-party integration standard.

---

## 3. Data Model

| Entity | Key fields | Notes / indexes |
|---|---|---|
| **User** | `_id`, `name`, `email` (unique), `passwordHash`, `role` (`student`\|`tutor`, default `student`), `avatarUrl`, `bio`, `subjectTags[]` (tutor only), `createdAt`, `updatedAt` | Unique index on `email`. `passwordHash` never returned in any response. |
| **Course** | `_id`, `tutor` (ref User), `title`, `description`, `category`, `price` (integer, FCFA), `thumbnailUrl`, `previewVideoUrl`, `status` (`draft`\|`published`), `likesCount`, `commentsCount`, `createdAt`, `updatedAt` | Index on `tutor`, `category`, `status`. Denormalized `likesCount`/`commentsCount` for cheap list-page rendering — keep in sync via the Like/Comment write paths, don't recompute with a live count on every read. |
| **Comment** | `_id`, `course` (ref), `user` (ref), `text`, `createdAt` | Index on `course` (for listing a course's comments, sorted by `createdAt`). |
| **Like** | `_id`, `course` (ref), `user` (ref), `createdAt` | Unique compound index on `(course, user)` — a user can only like a course once. |
| **Follow** | `_id`, `follower` (ref User), `tutor` (ref User), `createdAt` | Unique compound index on `(follower, tutor)`. |
| **Subscription** (the "support a tutor" relationship) | `_id`, `student` (ref), `tutor` (ref), `amount`, `currency` (`XAF`), `provider` (`mtn`\|`orange`), `phoneNumber`, `status` (`pending`\|`active`\|`failed`\|`cancelled`), `startedAt`, `nextBillingDate`, `cancelledAt` | Index on `student`, `tutor`. This is a billing relationship, not an entitlement — never gate `Course` reads on this entity. |
| **PayoutRecord** *(Phase 2 — see Section 7)* | `_id`, `tutor` (ref), `amount`, `period`, `status`, `paidAt` | Ledger of what's actually been paid out to a tutor, separate from the incoming `Subscription` stream. |

`Lesson`/`Progress` are mentioned in this repo's README tagline as long-term scope but have no corresponding frontend screens in the current build plan — do not build them until a screen/requirement actually needs them (see Section 8).

---

## 4. Functional Requirements

**FR-1 — Authentication**
- Register (`role` defaults to `student`; can be set to `tutor` at signup).
- Passwords hashed with bcrypt, cost factor ≥ 12. Never store or log plaintext.
- Login returns a JWT containing `{ sub: userId, role }` only — no PII in the payload.
- Access token expiry: 15 min recommended; if refresh tokens are added, follow this org's refresh-token standard (7–30 days, server-side or httpOnly cookie) rather than a single long-lived token. Flag to the lead before choosing.

**FR-2 — Courses**
- A tutor can create, edit, publish, and unpublish only their own courses.
- Public list endpoint supports filtering by `category` and `status=published`, and pagination.
- A course's detail includes tutor summary (name, avatar) inline — avoid forcing the frontend into a second round-trip per course card.

**FR-3 — Community layer (like/comment/follow)**
- All three require `Authorization: Bearer <token>`.
- Liking twice is idempotent (return the existing like, don't error) or explicitly rejected with a clear message — pick one and document it in the README endpoint table.
- Unfollowing/unliking are separate endpoints (`DELETE`), not a toggle on the same `POST`.
- Comment text: enforce a max length server-side (e.g. 2,000 chars) and reject empty/whitespace-only text.

**FR-4 — Tutors**
- Public tutor list/detail (bio, subject tags, follower count, published courses).
- A tutor can edit only their own profile fields (`bio`, `avatarUrl`, `subjectTags`, banner).

**FR-5 — Support / Subscriptions (Mobile Money)**
- Creating a subscription initiates a Mobile Money charge via the provider (MTN or Orange) and stores it `pending` until the provider confirms.
- Provider confirmation arrives via webhook — **verify the webhook signature before processing**, no exceptions.
- A student can list and cancel only their own subscriptions. Cancelling sets `status: "cancelled"` and `cancelledAt`; it does not delete the record (needed for tutor earnings history).
- Course content access is never checked against subscription status — this is billing, not a paywall (see Definitions).

**FR-6 — Tutor earnings & payouts** *(Phase 2, spec here so backend can design the schema now)*
- A tutor can view: total active subscribers, monthly earnings, and a payout history.
- Earnings are derived from `Subscription` records where `tutor = self` and `status = active`; payouts are a separate reconciled ledger (`PayoutRecord`).

**FR-7 — Response contract**
- Every endpoint returns the envelope shape, including on error: `{ success: false, message: "..." }`. This is what unblocks the known frontend gap where `apiFetch()` currently discards the message body on non-OK responses — don't ship an endpoint that returns a bare string or an unwrapped object.

---

## 5. API Specification

Update `README.md`'s endpoint table with real status as each row below ships. Auth column: `—` = public, `Bearer` = any logged-in user, `Bearer (tutor)` = logged-in user with `role: tutor`, and additionally scoped to resources they own where noted.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create an account (`role: student\|tutor`) |
| POST | `/api/auth/login` | — | Returns `{ user, token }` |
| GET | `/api/courses` | — | List published courses; query params: `category`, `page`, `limit` |
| GET | `/api/courses/:id` | — | Course detail, includes tutor summary |
| POST | `/api/courses` | Bearer (tutor) | Create a course (`status: draft`) |
| PATCH | `/api/courses/:id` | Bearer (tutor, owner) | Edit own course, including publish/unpublish via `status` |
| DELETE | `/api/courses/:id` | Bearer (tutor, owner) | Delete own course |
| GET | `/api/courses/:id/comments` | — | List comments, paginated, newest first |
| POST | `/api/courses/:id/comments` | Bearer | Add a comment |
| POST | `/api/courses/:id/likes` | Bearer | Like a course |
| DELETE | `/api/courses/:id/likes` | Bearer | Unlike a course |
| GET | `/api/tutors` | — | List tutors; query param: `subject` |
| GET | `/api/tutors/:id` | — | Tutor profile + their published courses |
| PATCH | `/api/tutors/:id` | Bearer (tutor, self only) | Edit own tutor profile |
| POST | `/api/tutors/:id/follow` | Bearer | Follow a tutor |
| DELETE | `/api/tutors/:id/follow` | Bearer | Unfollow a tutor |
| POST | `/api/subscriptions` | Bearer | Start supporting a tutor (`tutor`, `amount`, `provider`, `phoneNumber`) → `pending` |
| POST | `/api/subscriptions/webhook/:provider` | signature-verified, no user auth | Mobile Money provider confirms/fails a charge |
| GET | `/api/subscriptions/me` | Bearer | Student's own subscriptions |
| DELETE | `/api/subscriptions/:id` | Bearer (owner) | Cancel own subscription |
| GET | `/api/me` | Bearer | Current user profile |
| PATCH | `/api/me` | Bearer | Edit own profile (name, avatar, bio, password) |
| GET | `/api/tutors/me/earnings` | Bearer (tutor) | Earnings summary + subscriber list *(Phase 2)* |
| GET | `/api/tutors/me/payouts` | Bearer (tutor) | Payout history *(Phase 2)* |
| GET | `/api/health` | — | Liveness check (already built) |

---

## 6. Non-Functional Requirements

- **Security:** validate/sanitize all input server-side (never trust client validation alone); parameterize/use Mongoose methods exclusively, no raw string-built queries; rate-limit `/api/auth/*` and `/api/subscriptions`; never return stack traces or DB errors to the client — log them server-side only; CORS restricted to the known frontend origin(s), not `*`.
- **Performance:** paginate every list endpoint (`courses`, `comments`, `tutors`); index every field used in a filter or sort (see Section 3); avoid N+1 lookups when hydrating a course's tutor summary or a tutor's course list — use `populate()` deliberately, not a loop of queries.
- **Reliability:** wrap the Mobile Money provider call in try/catch with retry + backoff; a provider outage must not crash the request — respond with a clear `pending`/`failed` state instead.
- **Auditability:** log auth events (register, login, failed login) and subscription state changes, without logging PII or secrets.

---

## 7. Phasing

| Phase | Scope |
|---|---|
| **MVP (this cycle)** | Auth, Courses (CRUD + list/detail), Comments, Likes, Follows, Tutors (list/detail/edit own), Subscriptions (create/list/cancel + webhook) |
| **Phase 2** | Tutor earnings & payouts (`PayoutRecord`, earnings summary endpoints), any admin/moderation tooling, `Lesson`/`Progress` if a future frontend screen needs multi-part courses |

---

## 8. Open Questions / Decisions Needed

1. **Admin role** — no moderation/admin endpoints are specified. If reported comments or course takedowns become a requirement, this needs its own role and endpoint set — not assumed here.
2. **Payout cadence** — is a tutor paid out automatically on a schedule, or does someone trigger it manually? This determines whether `PayoutRecord` needs a scheduled job or an admin-triggered endpoint.
3. **Mobile Money webhook reliability** — MTN/Orange webhook delivery guarantees should be confirmed; if unreliable, a polling fallback (`GET` status from provider) may be needed alongside the webhook.
4. **Refresh tokens** — current scaffolding implies a single JWT; confirm with the lead whether a refresh-token flow is required before Phase 2, since the frontend's session-persistence approach depends on this answer.
