
import DocumentChunk from "../models/DocumentChunk.js";
import Chat from "../models/Chat.js";
import { getEmbedding } from "../utils/ollamaEmbedding.js";
import { cosineSimilarity } from "../utils/similarity.js";

export const askQuestion = async (req, res) => {
  try {
    console.log("🔥 ASK API HIT");

    const { question, documentId } = req.body;
    if (!question) return res.status(400).json({ message: "Question required" });

    // ⭐ embedding
    console.log("👉 generating query embedding");
    const queryEmbedding = await getEmbedding(question);

    // ⭐ chunks
    let chunks = [];
    if (documentId) chunks = await DocumentChunk.find({ documentId });
    console.log("👉 chunks found:", chunks.length);

    // ⭐ similarity
    const scored = chunks
      .filter(chunk => chunk.embedding && chunk.embedding.length)
      .map(chunk => ({
        text: chunk.text,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

    const topChunks = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    const bestScore = topChunks[0]?.score || 0;
    console.log("👉 BEST SCORE:", bestScore);

    // ⭐ memory
    const history = await Chat.find({
      userId: req.user._id,
      ...(documentId && { documentId })
    }).sort({ createdAt: -1 }).limit(3);

    const memory = history.map(h => `Q:${h.question}\nA:${h.answer}`).join("\n");

    // ⭐ prompt
    let prompt;
    if (bestScore > 0.4) {
      const context = topChunks.map(c => c.text).join("\n");
      prompt = `Answer ONLY from context.\nHistory:\n${memory}\nContext:\n${context}\nQuestion:\n${question}`;
    } else {
      prompt = `You are helpful AI.\nHistory:\n${memory}\nQuestion:\n${question}`;
    }

    console.log("👉 calling ollama");

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: true
      })
    });

    if (!ollamaRes.ok) {
      const err = await ollamaRes.text();
      console.error("❌ Ollama error:", err);
      return res.status(500).json({ message: "Ollama failed" });
    }

    res.setHeader("Content-Type", "text/plain");

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    let fullAnswer = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);

          if (parsed.response) {
            fullAnswer += parsed.response;
            res.write(parsed.response);
          }

          if (parsed.done) console.log("✅ done");

        } catch {}
      }
    }

    res.end();
    console.log("👉 answer length:", fullAnswer.length);

    await Chat.create({
      documentId,
      userId: req.user._id,
      question,
      answer: fullAnswer
    });

    console.log("✅ saved chat");

  } catch (error) {
    console.error("❌ ASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// ⭐ ⭐ NEW HISTORY API
export const getHistory = async (req, res) => {
  try {
    const { documentId } = req.query;

    const chats = await Chat.find({
      userId: req.user._id,
      ...(documentId && { documentId })
    }).sort({ createdAt: 1 });

    const messages = [];

    chats.forEach(c => {
      messages.push({ role: "user", text: c.question });
      messages.push({ role: "assistant", text: c.answer });
    });

    res.json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};