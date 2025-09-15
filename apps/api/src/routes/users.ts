import { Router } from "express";

const router = Router();

// GET /api/users/:id
router.get("/:id", (req, res) => {
  res.status(200).json({ message: `Get user ${req.params.id}` });
});

// PUT /api/users/:id
router.put("/:id", (req, res) => {
  res.status(200).json({ message: `Update user ${req.params.id}` });
});

export default router;
