import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
 import documentRoutes from "./routes/documentRoutes.js";
 import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);


app.use("/api/documents", documentRoutes);


app.use("/api/chat", chatRoutes);

export default app;
