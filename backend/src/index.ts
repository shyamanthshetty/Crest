import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // The default Vite dev server URL
  credentials: true,
}));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

import userRoutes from "./routes/user.routes.js";
import entryRoutes from "./routes/entry.routes.js";

app.use("/api/users", userRoutes);
app.use("/api/entries", entryRoutes);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Crest API",
      version: "1.0.0",
      description: "API Documentation for Crest Backend",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`,
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
