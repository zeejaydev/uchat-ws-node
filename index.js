import { Server, Socket } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
httpServer.listen(6001, () => {
  console.log(`Listening on http://localhost:6001`);
});
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  },
});
const connectedClients = {};
io.on("connection", (socket) => {
  const company = socket.handshake.query.company ?? "Unknown";
  const agent = socket.handshake.query.agent ?? false;
  console.log(socket.id, company, agent);
  if (agent) {
    socket.data.isAgent = true;
    socket.emit("connectedClients", {
      socketIds: Object.keys(connectedClients),
    });
  } else {
    socket.data.isClient = true;
    connectedClients[socket.id] = socket;
    //notify agents of the new connection
    notifyAgents(socket);
  }
  socket.on("message", (msg) => onMessage(msg, socket));
  socket.on("disconnect", async (reason, desc) => {
    console.log("disconnected");
    const sockets = await io.fetchSockets();
    if (sockets) {
      const agentSockets = sockets.filter((s) => s.data.isAgent);
      agentSockets.forEach((ws) =>
        ws.emit("clientDisconnected", { socketId: socket.id })
      );
    }
    delete connectedClients[socket.id];
  });
});

const onMessage = (message, ws) => {
  ws.broadcast.emit("receive-message", { uid: ws.id, message });
  console.log(message);
};

const notifyAgents = async (newSocket) => {
  const sockets = await io.fetchSockets();
  if (sockets) {
    const agentSockets = sockets.filter((s) => s.data.isAgent);
    agentSockets.forEach((ws) =>
      ws.emit("newClientConnected", { socketId: newSocket.id })
    );
  }
};
