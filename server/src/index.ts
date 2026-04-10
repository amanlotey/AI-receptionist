import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Import routes
import sessionRoute from "./routes/session";
import logRoute from "./routes/log";
import summaryRoute from "./routes/summary";
import callsRoute from "./routes/calls";

// Register routes
app.use("/session", sessionRoute);
app.use("/api/log", logRoute);
app.use("/api/summary", summaryRoute);
app.use("/api/calls", callsRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Supabase relay running at http://localhost:${PORT}`);
});
