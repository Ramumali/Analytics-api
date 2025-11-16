import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import authRoutes from "./routes/auth";
import analyticsRoutes from "./routes/analytics";

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(bodyParser.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_, res) => res.send({ ok: true, service: "Website Analytics" }));

export default app;
