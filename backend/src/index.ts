import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fundRoutes from "./routes/funds";
import healthRoutes from "./routes/health";
import { errorHandler } from "./utils/errors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/", healthRoutes);
app.use("/api/funds", fundRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

app.use(errorHandler);

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  const dataMode =
    process.env.ALLOW_GROQ_FACTS === "true"
      ? "AMFI + verified registry + Groq fallback"
      : "AMFI + verified registry only";

  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Fund Data Mode: ${dataMode}`);
});

export default app;
