// "build": "tsc ./*.ts --outDir build",

import { createServer } from "http";
import { WebSocketServer } from "ws";
import { parse } from "url";
import { v4 as uuidv4 } from "uuid";

const server = createServer();
server.listen(6001, function () {
  console.log(`Listening on http://localhost:6001`);
});
const webSocketServer = new WebSocketServer({ server });

const connections = {};

// webSocketServer.shouldHandle = (req) =>
//   req.headers.origin === "https://example.com";

webSocketServer.on("connection", (ws, req) => {
  // new connection started
  /* need to 
    1- check if there's an existing connection and if it belongs to the same company
    2- get company agents, and send a push to all their devices
  */
  const params = parse(req.url, true);
  const company = params.query.company;
  ws.id = uuidv4();
  connections[ws.id] = ws;
  console.log(`new connection, company=${company}, wsId=${ws.id}`);
  ws.on("upgrade", () => console.log("up"));
  ws.on("ping", () => console.log("ping"));

  ws.on("message", (data, isBinary) => onMessageReceived(ws, data, isBinary));
  ws.on("close", (code, reason) => onClose(ws, code, reason));

  ws.on("open", () => console.log("open"));
});

const onMessageReceived = (socket, data, isBinary) => {
  console.log(isBinary ? data : data.toString());
};

const onClose = (socket, code, reason) => {
  delete connections[socket.id];
  console.log(
    `connection ${socket.id} is closed, remaining active connections count = ${
      Object.keys(connections).length
    }`
  );
};

webSocketServer.on("error", (error) => {
  console.error(`webSocketServer error ${error.message}`);
});
