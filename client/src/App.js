import React, { useEffect, useCallback } from "react";
import { Button, Typography } from "antd";
import "./App.css";

// LD: A good web SWE would be able to integrate these variables into the React lifecycle.
// I am not a good web SWE.
let localStream = undefined; // The local video stream from the user's camera.
let localPeerConnection = undefined; // The WebRTC peer connection with the other client.

// Logging utility that adds the current timestamp to the log message.
const log = (message) => {
  console.log(`${new Date().toISOString()} - ${message}`);
};

function App() {
  const [connectButtonDisabled, setConnectButtonDisabled] =
    React.useState(false);

  // This function sets up the device to be used for the call and adds the video to the DOM.
  const setupLocalStream = async () => {
    try {
      // Most of the magic is done by `getUserMedia`.
      // You can learn more [here](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API).
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      const localPlayer = document.getElementById("localPlayer");
      localPlayer.srcObject = stream;
      localStream = stream;
      log("Local Stream set up");
    } catch (error) {
      console.error("Error setting up local stream:", error);
    }
  };

  const ws = React.useRef(null);

  // Utility to send stringified messages to the WebSocket server.
  const sendWsMessage = (type, body) => {
    log(`Sending ${type} event to signalling server`);
    ws.current.send(JSON.stringify({ type, body }));
  };

  // This function is called when the "Connect" button is clicked.
  const startConnection = async () => {
    await setupLocalStream();
    sendWsMessage("start");
  };

  // This function trickles ICE candidates to the other peer.
  // See [here](https://www.notion.so/bendingspoons/WebRTC-07cb99c4a579450dbe441db77ac434b4?pvs=4#6d6be43648514ef091fb30cfcee3fb38) for more details.
  const trickle = useCallback((candidate) => {
    const trickleData = candidate ? { candidate } : {};
    const trickleEvent = candidate ? "trickle" : "trickle-complete";

    sendWsMessage(trickleEvent, trickleData);
  }, []);

  // This sets up the peer connection and sends the offer message to the server.
  const sendOffer = useCallback(async () => {
    // User the WebRTC API to setup a new peer connection.
    localPeerConnection = new RTCPeerConnection();

    // As soon as a track is added to the peer connection, we show it as a video in the DOM.
    localPeerConnection.ontrack = addRemoteStreamToDom;

    // When the peer connection generates an ICE candidate, we immediately send it to the server using ICE trickling.
    // The last candidate is sent with an empty candidate, to signal the end of the candidates.
    localPeerConnection.onicecandidate = (event) => trickle(event.candidate);

    // Make our local stream available to the peer connection.
    localStream.getTracks().forEach((track) => {
      localPeerConnection.addTrack(track, localStream);
    });

    // Generate the offer to send to the signalling server.
    const offer = await localPeerConnection.createOffer();
    await localPeerConnection.setLocalDescription(offer);

    sendWsMessage("offer", {
      audio: false,
      video: true,
      record: false,
      bitrate: 512000,
      offer,
    });

    setConnectButtonDisabled(true);
  }, [trickle]);

  const addRemoteStreamToDom = (event) => {
    log(`My peer has added a track. Adding to DOM.`);
    const remotePlayer = document.getElementById("peerPlayer");
    remotePlayer.srcObject = event.streams[0];
  };

  // Set up the WebSocket connection with the signalling server.
  // This is only used to send and receive SDP messages, which are
  // the offers and answers that are used to establish the WebRTC connection.
  useEffect(() => {
    log("Setting up WebSocket connection");
    const url = "ws://localhost:8090";
    const wsClient = new WebSocket(url);
    ws.current = wsClient;

    wsClient.onopen = () => {
      log(`WebSocket connected to signalling server at ${url}`);
    };
  }, []);

  useEffect(() => {
    ws.current.onmessage = (event) => {
      const { type, body } = JSON.parse(event.data);
      switch (type) {
        case "ready":
          log("ready event received from signalling server");
          sendOffer();
          break;
        case "answer":
          log("answer event received from signalling server");
          localPeerConnection?.setRemoteDescription(body);
          break;
        default:
          console.error("Unknown message type", type, body);
      }
    };
  }, [sendOffer, ws]);

  return (
    <div className="App">
      <div className="App-header">
        <Typography.Title>WebRTC</Typography.Title>
        <div className="wrapper-row">
          <div className="wrapper">
            <Button
              style={{ width: 240, marginTop: 16 }}
              type="primary"
              disabled={connectButtonDisabled}
              onClick={startConnection}
            >
              Connect
            </Button>
          </div>
        </div>
        <div className="playerContainer" id="playerContainer">
          <div>
            <h1 style={{ color: "#003eb3", marginBottom: 10 }}>You</h1>
            <video
              id="localPlayer"
              autoPlay
              style={{
                width: 640,
                height: 480,
                border: "5px solid #003eb3",
                borderRadius: 5,
                backgroundColor: "#003eb3",
              }}
            />
          </div>

          <div>
            <h1 style={{ color: "#ad2102", marginBottom: 10 }}>Them</h1>
            <video
              id="peerPlayer"
              autoPlay
              style={{
                width: 640,
                height: 480,
                border: "5px solid #ad2102",
                borderRadius: 5,
                backgroundColor: "#ad2102",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
