import { Router } from "express";

const router = Router();

// POST /api/relationships/follow
router.post("/follow", (req, res) => {
  res.status(200).json({ message: "User followed" });
});

// POST /api/relationships/unfollow
router.post("/unfollow", (req, res) => {
  res.status(200).json({ message: "User unfollowed" });
});

export default router;
