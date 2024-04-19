import Janode from "janode";
const { Logger } = Janode;
import { WebSocketServer } from "ws";
import EchoTestPlugin from "janode/plugins/echotest";

// Connect to Janus Gateway
const connection = await Janode.connect({
  is_admin: false,
  address: {
    url: "ws://127.0.0.1:81",
    apisecret: "DOES_NOT_MATTER",
  },
});

const session = await connection.create();
let echoHandle; // A handle for the EchoTestPlugin

// Start WebSocket server
const WSSPORT = 8090;

const websockerServer = new WebSocketServer({
  port: WSSPORT,
});

// Utility to send stringified messages to the WebSocket server.
const sendWsMessage = (ws, type, body) => {
  ws.send(
    JSON.stringify({
      type,
      body,
    }),
    { binary: false }
  );
};

// Main logic of the server.
// Basically, it listens to 4 types of messages:
// - start: to start a session
// - offer: to receive the offer from the client
// - trickle: to receive the ICE candidate from the client
// - trickle-complete: to signal the end of ICE candidates
// The server talks with the `EchoTestPlugin` of the Janus Gateway, which is a plugin that simply 
// echoes back the audio and video streams.
const onMessage = async (ws, request, message) => {
  const remoteAddress = request.socket.address();
  const remote = `[${remoteAddress.address}:${remoteAddress.port}]`;
  try {
    const parsedMessage = JSON.parse(message);
    const { type, body } = parsedMessage;

    switch (type) {
      case "start":
        Logger.info(remote, "Starting session");
        echoHandle = await session.attach(EchoTestPlugin);
        sendWsMessage(ws, "ready");
        break;
      case "offer":
        Logger.info(remote, "Offer received");
        const { audio, video, offer, bitrate, record, filename } = body;
        const { jsep: answer } = await echoHandle.start({
          audio,
          video,
          jsep: offer,
          bitrate,
          record,
          filename,
        });
        sendWsMessage(ws, "answer", answer);
        break;
      case "trickle":
        Logger.info(remote, "trickle received");
        await echoHandle.trickle(body.candidate);
        break;
      case "trickle-complete":
        Logger.info(remote, "trickle-complete received");
        echoHandle.trickleComplete();
        break;
      default:
        Logger.error(remote, "Unknown message type", type);
    }
  } catch (error) {
    Logger.error(remote, "Error parsing message", error);
  }
};

websockerServer.on("connection", (ws, request) => {
  ws.on("message", (message) => onMessage(ws, request, message));
  ws.on("error", console.error);
  ws.on("disconnect", async () => {
    if (echoHandle) await echoHandle.detach();
  });
});

websockerServer.on("listening", function () {
  Logger.info(`Websocket server is running on port: ${WSSPORT}`);
});
