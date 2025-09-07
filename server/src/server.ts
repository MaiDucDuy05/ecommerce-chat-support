import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import chatRoutes from "./routes/chatRoutes";



const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/chat", chatRoutes);
const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

startServer();
