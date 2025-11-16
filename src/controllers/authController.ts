import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateRawApiKey, hashKey } from "../utils/apikey";

const prisma = new PrismaClient();

export const registerApp = async (req: Request, res: Response) => {
  const { name, ownerEmail } = req.body;
  if (!name || !ownerEmail) return res.status(400).json({ error: "name and ownerEmail required" });

  const app = await prisma.app.create({ data: { name, ownerEmail }});
  // create an API key
  const raw = generateRawApiKey();
  const hashed = await hashKey(raw);
  const key = await prisma.apiKey.create({
    data: { appId: app.id, hashedKey: hashed }
  });

  // Return raw key once
  res.json({ appId: app.id, apiKeyId: key.id, apiKey: raw });
};

export const getApiKey = async (req: Request, res: Response) => {
  const appId = req.query.appId as string;
  if (!appId) return res.status(400).json({ error: "appId query required" });

  const keys = await prisma.apiKey.findMany({ where: { appId, isRevoked: false }});
  // For security: in real app you don't return raw key; here we return metadata only
  res.json({ keys: keys.map((k: { id: any; createdAt: any; expiresAt: any; }) => ({ id: k.id, createdAt: k.createdAt, expiresAt: k.expiresAt })) });
};

export const revokeApiKey = async (req: Request, res: Response) => {
  const { apiKeyId } = req.body;
  if (!apiKeyId) return res.status(400).json({ error: "apiKeyId required" });
  const k = await prisma.apiKey.update({ where: { id: apiKeyId }, data: { isRevoked: true }});
  res.json({ ok: true, revoked: k.id });
};

export const regenerateApiKey = async (req: Request, res: Response) => {
  const { apiKeyId } = req.body;
  if (!apiKeyId) return res.status(400).json({ error: "apiKeyId required" });
  const raw = generateRawApiKey();
  const hashed = await hashKey(raw);
  const k = await prisma.apiKey.update({ where: { id: apiKeyId }, data: { hashedKey: hashed, isRevoked: false }});
  // return new raw key to owner
  res.json({ apiKeyId: k.id, apiKey: raw });
};
