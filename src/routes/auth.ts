import { Router } from "express";
import { registerApp, getApiKey, revokeApiKey, regenerateApiKey } from "../controllers/authController";

const router = Router();

/**
 * POST /api/auth/register
 * body: { name, ownerEmail }
 */
router.post("/register", registerApp);

/**
 * GET /api/auth/api-key?appId=...
 * returns the (raw) api key once after creation; for security you might only show it once
 */
router.get("/api-key", getApiKey);

/**
 * POST /api/auth/revoke
 * body: { apiKeyId }
 */
router.post("/revoke", revokeApiKey);

/**
 * POST /api/auth/regenerate
 * body: { apiKeyId }
 */
router.post("/regenerate", regenerateApiKey);

export default router;