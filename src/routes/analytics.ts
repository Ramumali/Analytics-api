import { Router } from "express";
import apiKeyAuth from "../middleware/apiKeyAuth";
import { limiter } from "../middleware/rateLimiter";
import { collectEvent, eventSummary, userStats } from "../controllers/analyticsController";

const router = Router();

// Event ingestion — authenticated via x-api-key, rate limited
router.post("/collect", limiter, apiKeyAuth, collectEvent);

// Analytics endpoints
router.get("/event-summary", limiter, apiKeyAuth, eventSummary);
router.get("/user-stats", limiter, apiKeyAuth, userStats);

export default router;