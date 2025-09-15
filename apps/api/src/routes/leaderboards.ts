import { Router } from "express";

const router = Router();

// GET /api/leaderboards
router.get("/", (req, res) => {
  res.status(200).json({ message: "Get leaderboards" });
});

export default router;
