// src/BaseService.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pingPostgres } from "./db/pg/index.js";

export class BaseService {
  constructor(PORT) {
    dotenv.config();
    this.app = express();
    this.server = null;
    this.router = express.Router();

    this.port = PORT || process.env.PORT;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.setupGracefulShutdown();
  }

  initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  initializeRoutes() {
    // Override in child classes to add specific routes
    this.router.get("/health", (req, res) => {
      res.status(200).json({
        status: "UP",
        timestamp: new Date(),
      });
    });

    this.app.use("/", this.router);

    this.app.use("**", (req, res) => {
      res.status(500).json({
        status: "Route not found",
        timestamp: new Date(),
      });
    });
  }

  initializeErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error("Error occurred:", err.message);
      res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
      });
    });
  }

  listen() {
    this.server = this.app.listen(this.port, async () => {
      console.log(`Server is running on port ${this.port}`);
      await pingPostgres();
    });
  }

  setupGracefulShutdown() {
    // Handle termination signals for graceful shutdown
    process.on("SIGTERM", () => {
      console.log(
        "Got SIGTERM. Graceful shutdown initiated",
        new Date().toISOString()
      );
      if (this.server) {
        this.server.close(() => {
          console.log("Process terminated w/ SIGTERM");
          process.exit(0);
        });
      }
    });

    process.on("SIGINT", () => {
      console.log(
        "Got SIGINT. Graceful shutdown initiated",
        new Date().toISOString()
      );
      if (this.server) {
        this.server.close(() => {
          console.log("Process interrupted w/ SIGINT");
          process.exit(0);
        });
      }
    });

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection at:", err.stack || err);
      if (this.server) {
        this.server.close(() => {
          console.log("Process terminated w/ Unhandled Rejection");
          process.exit(0);
        });
      }
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception thrown:", err.stack || err);
      if (this.server) {
        this.server.close(() => {
          console.log("Process terminated w/ Uncaught Exception");
          process.exit(0);
        });
      }
    });
  }
}
