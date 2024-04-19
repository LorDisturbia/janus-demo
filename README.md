# 🎭 Janus demo

This repo contains a simple WebRTC demo that uses a [Janus](https://github.com/meetecho/janus-gateway) server to play back a video stream to a connected client.

## 🏛️ Architecture

There are three main components in this demo:

- The [Janus server](janus/), which is the actual Janus server. It implements the WebRTC stack (including the signalling server).
- The [Janus Node driver](janus-node-driver/), which is a NodeJS server that implements application-level logic on top of the Janus server, acting as a middleware between a client and the Janus server.
- The [WebRTC client](client/), which is a simple WebRTC client written in React.

## 🤔 How it works

The way it works is:

- The Janode server connects to the Janus server using a WebSocket.
- The client connects to the Janode server using another WebSocket.
- The client sends a `start` message, to which the Janode server responds with a `ready` message.
- The client sends an `offer` message that contains an SDP offer. The Janode server forwards this message to the Janus server, which returns an SDP answer, that is then sent back to the client as an `answer` message.
- The client sends one `trickle` message for each ICE candidate, and the Janode server forwards them to the Janus server.
- Once all ICE candidates have been sent, the client sends a `trickle-complete` message.
- At that point, the client and the Janus server are connected and exchanging video streams through WebRTC.

See [this Notion page](https://www.notion.so/bendingspoons/WebRTC-07cb99c4a579450dbe441db77ac434b4?pvs=4) if any of these concepts are unfamiliar to you.