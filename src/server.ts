import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import setupWS from "./config/websocket";
import setupWebPush from "./config/webpush";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
const httpServer = createServer(app);
httpServer.listen(6001, () => {
  console.log(`Listening on http://localhost:6001`);
});

//prepare web socket
setupWS(httpServer);
//prepare web push
setupWebPush();

app.use("/api", rootRouter);

export const prisma = new PrismaClient();
