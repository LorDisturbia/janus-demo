# 🎭 Janus

This component is the actual Janus server. It implements the WebRTC stack (including the signalling server).

Depending on how it's built and configured, it can expose its APIs over different protocols, through different plugins. In this case, we're using the HTTP Rest and the WebSocket interfaces. The first one can be used in case you want to interact with it directly, for example using `curl`. The second one is used by the [Janus Node driver](../janus-node-driver/) component.

The main file is the [Dockerfile](./Dockerfile), that contains the instructions to build the image.

## 🏃 How to run

Follow these steps:

- Run `docker build -t janus .`
- Run `docker run -it --rm -p 80:8088 -p 81:8188 janus`
- You can now access the Janus server at `http://localhost:80/janus` (for example: `curl http://localhost:80/janus/info`), or with a WebSocket at `ws://localhost:81`.
  
## 📚 Resources

- [HTTP Rest Interface](https://janus.conf.meetecho.com/docs/rest.html#plainhttp)
- [GitHub repo](https://github.com/meetecho/janus-gateway)
