import { Router } from "express";

const router = Router();

// GET /api/lessons
router.get("/", (req, res) => {
  res.status(200).json({ message: "Get all lessons" });
});

// GET /api/lessons/:slug
router.get("/:slug", (req, res) => {
  res.status(200).json({ message: `Get lesson ${req.params.slug}` });
});

export default router;
