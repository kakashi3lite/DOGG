import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult, ValidationChain } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import winston from "winston";

// Security Logger
export const securityLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "DOGG-API-Security" },
  transports: [
    new winston.transports.File({
      filename: "logs/security-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/security-combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Rate Limiting Configuration
export const createRateLimit = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100, // limit each IP to 100 requests per windowMs
  message: string = "Too many requests from this IP, please try again later",
) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      securityLogger.warn("Rate limit exceeded", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
      });
      res.status(429).json({ error: message });
    },
  });
};

// Strict rate limits for auth endpoints (disabled in test mode)
export const authRateLimit = process.env.NODE_ENV === 'test'
  ? (req: Request, res: Response, next: NextFunction) => next() // No-op in tests
  : createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per 15 minutes
    "Too many authentication attempts, please try again in 15 minutes",
  );

// General API rate limit (disabled in test mode)
export const apiRateLimit = process.env.NODE_ENV === 'test'
  ? (req: Request, res: Response, next: NextFunction) => next() // No-op in tests
  : createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per 15 minutes
    "Too many requests, please slow down",
  );

// Input Validation Middleware
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    securityLogger.warn("Validation failed", {
      ip: req.ip,
      errors: errors.array(),
      body: req.body,
      path: req.path,
    });

    res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  };
};

// Zod Schema Validation Middleware
export const validateSchema = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        securityLogger.warn("Schema validation failed", {
          ip: req.ip,
          errors: error.errors,
          body: req.body,
          path: req.path,
        });

        return res.status(400).json({
          error: "Invalid input data",
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

// JWT Authentication Middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    securityLogger.warn("Authentication attempt without token", {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("User-Agent"),
    });
    return res.status(401).json({ error: "Access token required" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    securityLogger.error("JWT_SECRET not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      securityLogger.warn("Invalid token used", {
        ip: req.ip,
        token: token.substring(0, 20) + "...",
        error: err.message,
      });
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
};

// Password Security Utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Security Headers Middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; "),
  );

  // Additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  next();
};

// Request Logging Middleware
export const logRequests = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
    };

    if (res.statusCode >= 400) {
      securityLogger.warn("HTTP Error Response", logData);
    } else {
      securityLogger.info("HTTP Request", logData);
    }
  });

  next();
};

// Common Validation Rules
export const userValidationRules = () => {
  return [
    body("username")
      .trim()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username must be 3-20 characters and contain only letters, numbers, and underscores",
      ),
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Must be a valid email address"),
    body("password")
      .isLength({ min: 8, max: 128 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .withMessage(
        "Password must be 8+ characters with uppercase, lowercase, number, and special character",
      ),
  ];
};

// Error Handler for Security Issues
export const securityErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  securityLogger.error("Security Error", {
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get("User-Agent"),
  });

  // Don't leak internal error details
  res.status(500).json({
    error: "An internal security error occurred",
    requestId: req.headers["x-request-id"] || "unknown",
  });
};
