import crypto from "crypto";
import bcrypt from "bcryptjs";

export const generateRawApiKey = (len = Number(process.env.API_KEY_LENGTH) || 32) =>
  crypto.randomBytes(len).toString("hex");

export const hashKey = async (raw: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(raw, saltRounds);
};

export const compareKey = async (raw: string, hashed: string) => {
  return await bcrypt.compare(raw, hashed);
};