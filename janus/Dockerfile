FROM debian:bookworm-slim as builder

RUN apt update && apt install -y libmicrohttpd-dev libjansson-dev \
libssl-dev libsofia-sip-ua-dev libglib2.0-dev \
libopus-dev libogg-dev libcurl4-openssl-dev liblua5.3-dev \
libconfig-dev pkg-config libtool automake \
libsrtp2-dev \
python3-pip python3-setuptools python3-wheel ninja-build cmake \
git

# Install meson
RUN pip3 install meson --break-system-packages

# Install libnice
RUN git clone https://gitlab.freedesktop.org/libnice/libnice && cd libnice && meson --prefix=/usr build && ninja -C build && ninja -C build install

# Install libwebsockets
RUN git clone https://github.com/warmcat/libwebsockets && cd libwebsockets && git checkout v4.3-stable && mkdir build && cd build && cmake -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" .. && make && make install

# Install janus
RUN git clone https://github.com/meetecho/janus-gateway.git
WORKDIR /janus-gateway
RUN sh autogen.sh && ./configure --prefix=/opt/janus && make && make install
ENV PATH="$PATH:/opt/janus/bin/"
# Enable HTTP transport
RUN mv /opt/janus/etc/janus/janus.transport.http.jcfg.sample /opt/janus/etc/janus/janus.transport.http.jcfg
# Enable WebSocket transport
RUN mv /opt/janus/etc/janus/janus.transport.websockets.jcfg.sample /opt/janus/etc/janus/janus.transport.websockets.jcfg

# Expose HTTP and WS ports
EXPOSE 8088 8188

CMD ["janus"]