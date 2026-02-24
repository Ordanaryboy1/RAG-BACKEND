import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    filePath: String
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
