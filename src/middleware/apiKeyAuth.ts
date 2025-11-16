import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { compareKey } from "../utils/apikey";

const prisma = new PrismaClient();

export default async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const rawKey = (req.header("x-api-key") || "").trim();
  if (!rawKey) return res.status(401).json({ error: "Missing API key in header x-api-key" });

  const apikeys = await prisma.apiKey.findMany({
    where: { isRevoked: false },
    include: { app: true }
  });

  // naive check: for efficiency in production, use hashed-key lookup table or store prefix + hash
  for (const k of apikeys) {
    if (k.expiresAt && new Date() > k.expiresAt) continue;
    const ok = await compareKey(rawKey, k.hashedKey);
    if (ok) {
      (req as any).apiKeyRecord = k;
      // update lastUsedAt
      await prisma.apiKey.update({ where: { id: k.id }, data: { lastUsedAt: new Date() } });
      return next();
    }
  }

  return res.status(401).json({ error: "Invalid or expired API key" });
}