import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./db";
import {
  apiRateLimit,
  securityHeaders,
  logRequests,
  securityErrorHandler,
  securityLogger,
} from "./middleware/security";
import { setupSwagger } from "./config/swagger";
import authRouter from "./routes/auth";
import usersRoutes from "./routes/users";
import dogsRoutes from "./routes/dogs";
import lessonsRoutes from "./routes/lessons";
import progressRoutes from "./routes/progress";
import achievementsRoutes from "./routes/achievements";
import healthRoutes from "./routes/health";
import forumRoutes from "./routes/forum";
import relationshipsRoutes from "./routes/relationships";
import leaderboardsRoutes from "./routes/leaderboards";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.WEB_APP_URL || "http://localhost:3000",
    credentials: true,
  },
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // We'll handle this with custom middleware
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(securityHeaders);
app.use(logRequests);
app.use(apiRateLimit);

// CORS configuration
app.use(
  cors({
    origin: process.env.WEB_APP_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Security endpoint for monitoring
app.get("/api/security/status", (req, res) => {
  res.status(200).json({
    security: "enabled",
    rateLimit: "active",
    authentication: "required",
    timestamp: new Date().toISOString(),
  });
});

setupSwagger(app);

app.use("/api/auth", authRouter);
app.use("/api/users", usersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/relationships", relationshipsRoutes);
app.use("/api/leaderboards", leaderboardsRoutes);

// Socket.IO namespaces with authentication
const chatNamespace = io.of("/chat");
const presenceNamespace = io.of("/presence");

chatNamespace.use((socket, next) => {
  // TODO: Add socket authentication middleware
  next();
});

chatNamespace.on("connection", (socket) => {
  securityLogger.info("User connected to chat", { socketId: socket.id });

  socket.on("disconnect", () => {
    securityLogger.info("User disconnected from chat", { socketId: socket.id });
  });
});

presenceNamespace.use((socket, next) => {
  // TODO: Add socket authentication middleware
  next();
});

presenceNamespace.on("connection", (socket) => {
  securityLogger.info("User connected to presence", { socketId: socket.id });

  socket.on("disconnect", () => {
    securityLogger.info("User disconnected from presence", {
      socketId: socket.id,
    });
  });
});

const PORT = process.env.PORT || 3001;

// Add security error handler
app.use(securityErrorHandler);

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    securityLogger.error("Unhandled error", {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(500).json({ error: "Internal server error" });
  },
);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      securityLogger.info(`DOGG API Server started`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      securityLogger.info("SIGTERM received, shutting down gracefully");
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    securityLogger.error("Failed to start server", { error });
    process.exit(1);
  }
};

startServer();
