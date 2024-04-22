# 🏎️ Janus Node Driver

This component is a NodeJS server that uses the [Janode](https://github.com/meetecho/janode) NPM library to communicate with [a Janus instance](../janus/).

The Janode library communicates with the Janus server using the WebSocket interface. In this implementation, it acts as a middleware between a client and the [EchoTestPlugin](https://janus.conf.meetecho.com/docs/echotest.html) of the Janus instance.

## 🏃 How to run

Follow these steps:

- Run the [Janus server](../janus/) first
- Run `npm install`
- Run `npm start`
- The server is now reachable via WebSocket at `ws://localhost:8090`.
