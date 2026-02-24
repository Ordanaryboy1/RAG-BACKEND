
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { askQuestion, getHistory } from "../controllers/chatController.js";

const router = express.Router();

router.post("/ask", authMiddleware, askQuestion);
router.get("/history", authMiddleware, getHistory);

export default router;
