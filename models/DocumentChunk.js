
import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    text: String,
    index: Number,
    embedding: [Number]   // ⭐ added
  },
  { timestamps: true }
);

export default mongoose.model("DocumentChunk", chunkSchema);
