import "dotenv/config.js";
import express from "express";
import cors from "cors";
import multer from "multer";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";

const app = express();
app.use(cors({
    origin:process.env.CLIENT_ORIGIN,
    credentials:true
}))
//app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*", credentials: false }));
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

// quick health
app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// reject unknown multipart to avoid hanging
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  next(err);
});

const PORT = process.env.PORT || 8080;
connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Server on :${PORT}`)))
  .catch((e) => { console.error(e); process.exit(1); });


app.get('/', (req, res) => {
    res.send('Backend is running');
});