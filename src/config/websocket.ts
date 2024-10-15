import { DisconnectReason, Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { onConnection } from "../controllers/ws";

export let io: Server;

export default function setupWS(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      // allowedHeaders: ["my-custom-header"],
      // credentials: true
    },
  });

  io.on("connection", onConnection);
}
