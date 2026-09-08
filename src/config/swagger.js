import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LearnHub Cameroon API",
      version: "1.0.0",
      description:
        "REST API for LearnHub Cameroon - courses, lessons, progress, subscriptions, tutor earnings and community features.",
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

  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;