import request from "supertest";
import app from "../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Auth endpoints", () => {
  afterAll(async () => {
    await prisma.apiKey.deleteMany();
    await prisma.app.deleteMany();
    await prisma.$disconnect();
  });

  it("registers an app and returns apiKey", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "test", ownerEmail: "me@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.apiKey).toBeDefined();
    expect(res.body.appId).toBeDefined();
  });
});
