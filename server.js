import dotenv from "dotenv";
dotenv.config();
console.log("API Key loaded:", !!process.env.rc_810ad02fb494bc3a1ab871a9594adc6799486b147af7f6655fba7516d503f294);

import express from "express";
import cors from "cors";
import chatRouter from "./chat.js";
import simulateRouter from "./simulate.js";



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/chat", chatRouter);
app.use("/api/simulate", simulateRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
