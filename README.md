# 👹 Janus Demo

The objective of this repo is is to have a local Janus server that we can play with, in order to understand it better.

The main file is the [Dockerfile](./Dockerfile), that contains the instructions to build the image.

## 🧑‍💻 How to start Janus

Follow these steps:

- Clone this repo
- Run `docker build -t janus .`
- Run `docker run -it --rm -p 80:8088 janus`
- You can now access the Janus server at `http://localhost/janus`
