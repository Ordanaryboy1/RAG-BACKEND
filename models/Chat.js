import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    question: String,
    answer: String
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
