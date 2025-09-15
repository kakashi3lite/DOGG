import { Router } from "express";

const router = Router();

// GET /api/achievements
router.get("/", (req, res) => {
  res.status(200).json({ message: "Get all achievements" });
});

export default router;
