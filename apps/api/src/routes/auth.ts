import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";
import {
  authRateLimit,
  validateRequest,
  userValidationRules,
  hashPassword,
  verifyPassword,
  securityLogger,
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/security";
import { body } from "express-validator";

const router = Router();

// Apply rate limiting to all auth routes
router.use(authRateLimit);

// Validation rules for registration
const registerValidation = [
  ...userValidationRules(),
  body("username").custom(async (value) => {
    const existingUser = await UserModel.findOne({ username: value });
    if (existingUser) {
      throw new Error("Username already exists");
    }
    return true;
  }),
  body("email").custom(async (value) => {
    const existingUser = await UserModel.findOne({ email: value });
    if (existingUser) {
      throw new Error("Email already registered");
    }
    return true;
  }),
];

// Validation rules for login
const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
];

// POST /api/auth/register
router.post(
  "/register",
  validateRequest(registerValidation),
  async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = new UserModel({
        username,
        email,
        password: hashedPassword,
      });

      await user.save();

      securityLogger.info("User registered successfully", {
        userId: user._id,
        username: user.username,
        email: user.email,
        ip: req.ip,
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error: any) {
      securityLogger.error("Registration failed", {
        error: error.message,
        body: req.body,
        ip: req.ip,
      });

      res.status(400).json({
        error: "Registration failed",
        details: error.message,
      });
    }
  },
);

// POST /api/auth/login
router.post(
  "/login",
  validateRequest(loginValidation),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        securityLogger.warn("Login attempt with non-existent email", {
          email,
          ip: req.ip,
        });
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        securityLogger.warn("Login attempt with invalid password", {
          userId: user._id,
          email: user.email,
          ip: req.ip,
        });
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      );

      securityLogger.info("User logged in successfully", {
        userId: user._id,
        username: user.username,
        email: user.email,
        ip: req.ip,
      });

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error: any) {
      securityLogger.error("Login failed", {
        error: error.message,
        body: req.body,
        ip: req.ip,
      });

      res.status(500).json({ error: "Login failed" });
    }
  },
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Generate new token
      const token = jwt.sign(
        {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      );

      securityLogger.info("Token refreshed", {
        userId: req.user.id,
        ip: req.ip,
      });

      res.status(200).json({
        message: "Token refreshed successfully",
        token,
      });
    } catch (error: any) {
      securityLogger.error("Token refresh failed", {
        error: error.message,
        ip: req.ip,
      });

      res.status(500).json({ error: "Token refresh failed" });
    }
  },
);

// POST /api/auth/logout
router.post(
  "/logout",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just log the logout
      securityLogger.info("User logged out", {
        userId: req.user?.id,
        ip: req.ip,
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      securityLogger.error("Logout failed", {
        error: error.message,
        ip: req.ip,
      });

      res.status(500).json({ error: "Logout failed" });
    }
  },
);

// GET /api/auth/me - Get current user info
router.get(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = await UserModel.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: any) {
      securityLogger.error("Get user info failed", {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip,
      });

      res.status(500).json({ error: "Failed to get user information" });
    }
  },
);

export default router;
