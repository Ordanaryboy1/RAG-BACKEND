
import axios from "axios";

export const getEmbedding = async (text) => {
  try {
    const res = await axios.post("http://localhost:11434/api/embeddings", {
      model: "nomic-embed-text",
      prompt: text,
      options: { num_gpu: 0 } 
    });

    return res.data.embedding;

  } catch (err) {
    console.error("Embedding API error:", err.message);
    return null;
  }
};