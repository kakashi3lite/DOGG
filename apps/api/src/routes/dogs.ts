import { Router } from "express";

const router = Router();

// POST /api/dogs
router.post("/", (req, res) => {
  res.status(201).json({ message: "Dog created" });
});

// GET /api/dogs/:id
router.get("/:id", (req, res) => {
  res.status(200).json({ message: `Get dog ${req.params.id}` });
});

// PUT /api/dogs/:id
router.put("/:id", (req, res) => {
  res.status(200).json({ message: `Update dog ${req.params.id}` });
});

// DELETE /api/dogs/:id
router.delete("/:id", (req, res) => {
  res.status(200).json({ message: `Delete dog ${req.params.id}` });
});

export default router;
