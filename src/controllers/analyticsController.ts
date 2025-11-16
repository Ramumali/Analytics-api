import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import redis from "../lib/redisClient";

const prisma = new PrismaClient();

// POST /api/analytics/collect
export const collectEvent = async (req: Request, res: Response) => {
  /*
    Expected body:
    {
      event: "login_form_cta_click",
      url: "https://example.com/page",
      referrer: "https://google.com",
      device: "mobile",
      ipAddress: "...",
      timestamp: "2024-02-20T12:34:56Z",
      metadata: { browser:"Chrome", os:"Android", screenSize:"1080x1920" },
      userId: "optional"
    }
  */
  const payload = req.body;
  if (!payload.event || !payload.url) return res.status(400).json({ error: "event and url required" });

  const apiKeyRecord = (req as any).apiKeyRecord;
  const appId = apiKeyRecord?.appId;

  const ev = await prisma.event.create({
    data: {
      appId,
      userId: payload.userId || null,
      eventType: payload.event,
      url: payload.url,
      referrer: payload.referrer,
      device: payload.device,
      ipAddress: payload.ipAddress,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      metadata: payload.metadata || {}
    }
  });

  // Invalidate relevant caches
  if (appId) {
    const keys = await redis.keys(`event-summary:${appId}:*`);
    if (keys.length) await redis.del(...keys);
  }

  res.status(201).json({ ok: true, id: ev.id });
};

// GET /api/analytics/event-summary?event=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&app_id=...
export const eventSummary = async (req: Request, res: Response) => {
  const { event, startDate, endDate, app_id } = req.query as any;
  if (!event) return res.status(400).json({ error: "event query param required" });

  const appId = app_id || (req as any).apiKeyRecord?.appId || null;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const cacheKey = `event-summary:${appId || "all"}:${event}:${start.toISOString()}:${end.toISOString()}`;
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  // Query: total count, unique users, device breakdown
  const total = await prisma.event.count({
    where: {
      eventType: event,
      appId: appId ?? undefined,
      timestamp: { gte: start, lte: end }
    }
  });

  const uniqueUsers = await prisma.event.aggregate({
    _count: { userId: true },
    where: {
      eventType: event,
      appId: appId ?? undefined,
      timestamp: { gte: start, lte: end },
      userId: { not: null }
    }
  });

  // device aggregation (group by device)
  const deviceRows = await prisma.$queryRawUnsafe(
    `SELECT device, count(*) as cnt FROM "Event" WHERE "eventType" = $1 AND "timestamp" >= $2 AND "timestamp" <= $3 ${appId ? 'AND "appId" = $4' : ''} GROUP BY device`,
    ...(appId ? [event, start.toISOString(), end.toISOString(), appId] : [event, start.toISOString(), end.toISOString()])
  );

  const deviceData: Record<string, number> = {};
  for (const r of deviceRows as any[]) deviceData[r.device || "unknown"] = Number(r.cnt);

  const resp = {
    event,
    count: total,
    uniqueUsers: uniqueUsers._count || 0,
    deviceData
  };

  await redis.set(cacheKey, JSON.stringify(resp), "EX", 60 * 3); // cache 3 minutes
  res.json(resp);
};

// GET /api/analytics/user-stats?userId=...
export const userStats = async (req: Request, res: Response) => {
  const { userId } = req.query as any;
  if (!userId) return res.status(400).json({ error: "userId query required" });

  // for brevity: gather total events, latest event, device details (most used)
  const total = await prisma.event.count({ where: { userId }});
  const latest = await prisma.event.findFirst({ where: { userId }, orderBy: { timestamp: "desc" }});
  const deviceAgg = await prisma.$queryRawUnsafe(`
    SELECT metadata->>'browser' as browser, metadata->>'os' as os, count(*) as cnt
    FROM "Event" WHERE "userId" = $1 GROUP BY browser, os ORDER BY cnt DESC LIMIT 1
  `, userId);

  const deviceDetails = ((deviceAgg as any[])[0]) || {};

  res.json({
    userId,
    totalEvents: total,
    deviceDetails,
    ipAddress: latest?.ipAddress || null,
    recentEvent: latest ? {
      event: latest.eventType,
      url: latest.url,
      timestamp: latest.timestamp
    } : null
  });
};