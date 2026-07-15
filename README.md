# LearnHub API

REST API for LearnHub Cameroon: courses, lessons, progress, subscriptions (MTN/Orange Mobile Money), tutor earnings, and the community layer (likes, comments, follows).

> Full project roadmap: see the LearnHub Internship Guide document. The frontend lives in the learnhub-web repo.

## Tech stack
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT authentication
- Hosting: Render

## Getting started

```bash
git clone <repo-url>
cd learnhub-api
npm install
cp .env.example .env   # then fill in real values (ask a lead)
npm run dev
```

## API documentation

Document every endpoint here as it is built:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Create an account |
| POST | /api/auth/login | — | Get a JWT |


## Branch & PR rules

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before your first commit. Short version: never push to `main`, branch per feature, small PRs, one review required.

## Team

| Role | Name | GitHub |
|------|------|--------|
| Team Lead |  |  |
| Frontend |  |  |
| Backend |  |  |
| UI/UX |  |  |
| QA & Docs |  |  |
