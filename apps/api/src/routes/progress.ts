import { Router } from "express";

const router = Router();

// POST /api/progress
router.post("/", (req, res) => {
  res.status(201).json({ message: "Progress updated" });
});

export default router;
