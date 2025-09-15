import { Router } from "express";

const router = Router();

// GET /api/forum
router.get("/", (req, res) => {
  res.status(200).json({ message: "Get all posts" });
});

// POST /api/forum
router.post("/", (req, res) => {
  res.status(201).json({ message: "Post created" });
});

// GET /api/forum/:id
router.get("/:id", (req, res) => {
  res.status(200).json({ message: `Get post ${req.params.id}` });
});

// PUT /api/forum/:id
router.put("/:id", (req, res) => {
  res.status(200).json({ message: `Update post ${req.params.id}` });
});

// DELETE /api/forum/:id
router.delete("/:id", (req, res) => {
  res.status(200).json({ message: `Delete post ${req.params.id}` });
});

// POST /api/forum/:id/comments
router.post("/:id/comments", (req, res) => {
  res.status(201).json({ message: `Comment created on post ${req.params.id}` });
});

export default router;
