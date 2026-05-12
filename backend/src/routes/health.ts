import { Router, Request, Response } from "express";

const router = Router();

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Liveness check (for k8s)
router.get("/live", (req: Request, res: Response) => {
  res.sendStatus(200);
});

// Readiness check (for k8s)
router.get("/ready", (req: Request, res: Response) => {
  res.sendStatus(200);
});

export default router;
