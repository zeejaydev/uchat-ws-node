import { DisconnectReason, Socket } from "socket.io";
import { Token } from "../models/token";
import { io } from "../config/websocket";

const connectedClients: Record<string, Socket> = {};
const activeAgents: Record<string, Socket> = {};

export const onConnection = (socket: Socket) => {
  const company = socket.handshake.query.company ?? "Unknown";
  const agent = socket.handshake.query.agent ?? false;
  console.log(socket.id, company, agent);
  socket.data.isAgent = agent;
  if (agent) {
    activeAgents[socket.id] = socket;
    socket.emit("connectedClients", {
      socketIds: Object.keys(connectedClients),
    });
  } else {
    connectedClients[socket.id] = socket;
    socket.emit("activeAgents", {
      socketIds: Object.keys(activeAgents),
    });
  }

  notifyListeners(socket);
  setupSocketListeners(socket);
};

const setupSocketListeners = (socket: Socket) => {
  socket.on("message", (msg) => onSocketMessage(msg, socket));
  socket.on("disconnect", (reason, description) =>
    onSocketDisconnect(reason, description, socket)
  );
};

const onSocketMessage = (msg: any, socket: Socket) => {
  console.log(msg);
  socket.broadcast.emit("receive-message", { uid: socket.id, msg });
  notifyAgent(2, msg);
};

const onSocketDisconnect = async (
  reason: DisconnectReason,
  description: any | null,
  socket: Socket
) => {
  console.log("disconnected, reason", reason, "desc?", description);
  const sockets = await io.fetchSockets();
  const agentSockets = sockets.filter((s) => s.data.isAgent);
  agentSockets.forEach((ws) =>
    ws.emit(ws.data.isAgent ? "clientDisconnected" : "agentDisconnected", {
      socketId: socket.id,
    })
  );
  if (socket.data.isAgent) {
    delete activeAgents[socket.id];
  } else {
    delete connectedClients[socket.id];
  }
};

const notifyListeners = async (newSocket: Socket) => {
  const sockets = await io.fetchSockets();
  sockets.forEach((ws) =>
    ws.emit(ws.data.isAgent ? "newClientConnected" : "newAgentConnected", {
      socketId: newSocket.id,
    })
  );
};

const notifyAgent = async (uid: number, message: string) => {
  const agentWpToken = await Token.getAgentToken(uid);
  if (!agentWpToken) {
    console.error(`no token found for uid ${uid}`);
  } else {
    console.log(agentWpToken.wp_token);
  }
  // webpush.sendNotification(
  //   pushSub,
  //   JSON.stringify({
  //     type: "receive-message",
  //     payload: {
  //       message: message,
  //     },
  //   })
  // );
};
