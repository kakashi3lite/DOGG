import { Router } from "express";

const router = Router();

// POST /api/health
router.post("/", (req, res) => {
  res.status(201).json({ message: "Health record created" });
});

// GET /api/health/:dogId
router.get("/:dogId", (req, res) => {
  res
    .status(200)
    .json({ message: `Get health records for dog ${req.params.dogId}` });
});

export default router;
