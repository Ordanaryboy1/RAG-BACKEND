
import fs from "fs";
import Document from "../models/Document.js";
import { extractText } from "../utils/extractText.js";
import { chunkText } from "../utils/chunkText.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { getEmbedding } from "../utils/ollamaEmbedding.js";


// ============================================
// ⭐ Upload → Extract → Chunk → Embedding → Save
// ============================================
export const uploadDocument = async (req, res) => {
  try {
    console.log("🔥 UPLOAD API HIT");

    // 1️⃣ File validation
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📄 File:", req.file.originalname);

    // ⭐ DUPLICATE CHECK
    const existing = await Document.findOne({
      name: req.file.originalname,
      uploadedBy: req.user._id
    });

    if (existing) {
      console.log("⚠️ Duplicate document blocked");

      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}

      return res.status(400).json({
        message: "Document already uploaded"
      });
    }

    // 2️⃣ Extract text
    const text = await extractText(req.file.path);
    console.log("📜 TEXT LENGTH:", text?.length);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Empty document text" });
    }

    // 3️⃣ Create document metadata
    const document = await Document.create({
      name: req.file.originalname,
      category: req.body.category,
      uploadedBy: req.user._id,
      filePath: req.file.path
    });

    console.log("✅ Document created:", document._id);

    // 4️⃣ Chunk text
    const chunks = chunkText(text);
    console.log("🧩 CHUNK COUNT:", chunks.length);

    if (chunks.length === 0) {
      throw new Error("Chunking failed — no chunks created");
    }

    // 5️⃣ Sequential embedding
    for (let i = 0; i < chunks.length; i++) {
      console.log(`👉 Embedding chunk ${i}`);

      const embedding = await getEmbedding(chunks[i]);

      if (!embedding || embedding.length === 0) {
        throw new Error(`Embedding failed at chunk ${i}`);
      }

      console.log("📏 Embedding length:", embedding.length);

      await DocumentChunk.create({
        documentId: document._id,
        text: chunks[i],
        index: i,
        embedding
      });

      console.log(`✅ Chunk saved ${i}`);
    }

    console.log("🎉 ALL CHUNKS SAVED");

    // delete temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.log("File delete skipped");
    }

    res.json({
      message: "Document uploaded successfully",
      document,
      totalChunks: chunks.length
    });

  } catch (error) {
    console.error("❌ UPLOAD ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// ============================================
// ⭐ Fetch chunks of a document
// ============================================
export const getDocumentChunks = async (req, res) => {
  try {
    const chunks = await DocumentChunk.find({
      documentId: req.params.id
    }).sort({ index: 1 });

    res.json(chunks);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============================================
// ⭐ Fetch user documents
// ============================================
export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({
      uploadedBy: req.user._id
    }).sort({ createdAt: -1 });

    res.json(docs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};