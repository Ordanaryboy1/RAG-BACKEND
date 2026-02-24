

import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  uploadDocument,
  getDocumentChunks,
  getDocuments
} from "../controllers/documentController.js";

import { getEmbedding } from "../utils/ollamaEmbedding.js";

const router = express.Router();


// ⭐ multer config
const upload = multer({
  dest: "uploads/"
});


// ===============================
// ⭐ TEST EMBEDDING ROUTE (DEBUG)
// ===============================
router.get("/test-embed", async (req, res) => {
  try {
    console.log("🔥 TEST EMBED HIT");

    const emb = await getEmbedding("hello world");

    console.log("Embedding length:", emb?.length);

    res.json({
      success: true,
      embeddingLength: emb?.length
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ⭐ GET USER DOCUMENTS
// ===============================
router.get("/", authMiddleware, getDocuments);


// ===============================
// ⭐ UPLOAD DOCUMENT
// ===============================
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);


// ===============================
// ⭐ GET CHUNKS OF DOCUMENT
// ===============================
router.get("/:id/chunks", authMiddleware, getDocumentChunks);


export default router;