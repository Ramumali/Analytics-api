import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../lib/redisClient";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000; // 1 minute default
const max = Number(process.env.RATE_LIMIT_MAX) || 120;

export const limiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: any[]) => (redis as any).call(...args)
  })
});
