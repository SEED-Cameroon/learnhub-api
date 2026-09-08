import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LearnHub Cameroon API",
      version: "1.0.0",
      description: [
        "REST API for LearnHub Cameroon — courses, lessons, subscriptions (MTN/Orange Mobile Money), tutor earnings, and the community layer (likes, comments, follows).",
        "",
        "## Getting started",
        "1. Register via `POST /api/auth/register` (role: `student` or `tutor`), then log in via `POST /api/auth/login`.",
        "2. Copy the `token` field from the login response (register does not return a token).",
        "3. Click the **Authorize** button at the top of this page and paste the token (just the raw token, no `Bearer ` prefix — Swagger UI adds the header for you).",
        "4. Endpoints marked with a lock icon require this. Unauthenticated requests to those return `401 Not authorized`.",
        "",
        "## Response shape",
        "Every endpoint responds with the same envelope:",
        "```json",
        '{ "success": boolean, "data": object, "message": string }',
        "```",
        "On errors, `data` is omitted and `message` explains what went wrong.",
        "",
        "## Endpoint groups",
        "See the tag sections below: **Health**, **Authentication**, **Courses**, **Course Likes**, **Comments**, **Follows**, **Subscriptions**, **Tutors**.",
      ].join("\n"),
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:5000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  // Order here drives the tag/section order in Swagger UI: Health and
  // Authentication first, then the rest of the resource routes.
  apis: [
    "./src/routes/health.routes.js",
    "./src/routes/auth.routes.js",
    "./src/routes/course.routes.js",
    "./src/routes/Likes.routes.js",
    "./src/routes/comment.routes.js",
    "./src/routes/follow.routes.js",
    "./src/routes/subscription.routes.js",
    "./src/routes/Tutor.routes.js",
    "./src/controllers/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;