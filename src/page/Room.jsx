import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import { IoChatboxOutline as ChatIcon, IoVideocamSharp as VideoOnIcon, IoVideocamOff as VideoOffIcon, IoMic as MicOnIcon, IoMicOff as MicOffIcon } from "react-icons/io5";
import { VscTriangleDown as DownIcon } from "react-icons/vsc";
import { FaUsers as UsersIcon } from "react-icons/fa";
import { FiSend as SendIcon } from "react-icons/fi";
import { FcGoogle as GoogleIcon } from "react-icons/fc";
import { MdCallEnd as CallEndIcon, MdClear as ClearIcon, MdOutlineContentCopy as CopyToClipboardIcon } from "react-icons/md";
import { AiOutlineLink as LinkIcon, AiOutlineShareAlt as ShareIcon } from "react-icons/ai";
import { BsPin as PinIcon, BsPinFill as PinActiveIcon } from "react-icons/bs";

// Components
import MeetGridCard from "../components/MeetGridCard";
import Loading from "../components/Loading";

// Framer Motion
import { motion, AnimatePresence } from "framer-motion";

// Audio
import joinSFX from "../sounds/join.mp3";
import msgSFX from "../sounds/message.mp3";
import leaveSFX from "../sounds/leave.mp3";

// Peer & Socket
import Peer from "simple-peer";
import { io } from "socket.io-client";

// Auth
import { useAuth } from "../context/AuthContext";

// QR
import { QRCode } from "react-qrcode-logo";

const Room = () => {
  const { roomID } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [share, setShare] = useState(false);
  const [pin, setPin] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(true);

  const socket = useRef();
  const peersRef = useRef([]);
  const localVideo = useRef();
  const chatScroll = useRef();
  const joinSound = useRef(new Audio(joinSFX));

  // Send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    socket.current.emit("send message", {
      roomID,
      from: socket.current.id,
      user: {
        id: user.uid,
        name: user.displayName,
        profilePic: user.photoURL,
      },
      message: msgText.trim(),
      timestamp: Date.now(),
    });
    setMsgText("");
  };

  // Setup Socket & Peer
  useEffect(() => {
    if (!user) return;

    socket.current = io("https://vcbackhend.onrender.com");

    // Chat messages
    socket.current.on("message", (data) => {
      if (user.uid !== data.user.id) new Audio(msgSFX).play();
      setMsgs((prev) => [
        ...prev,
        { ...data, send: data.user.id === user.uid, uniqueId: `${data.from}-${Date.now()}` },
      ]);
    });

    // Get media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        localVideo.current.srcObject = stream;
        setLoading(false);

        socket.current.emit("join room", { roomID, user });

        socket.current.on("all users", (users) => {
          const peersArr = users.map(u => {
            const peer = createPeer(u.userId, socket.current.id, stream, u.user);
            peersRef.current.push({ peerID: u.userId, peer, user: u.user });
            return { peerID: u.userId, peer, user: u.user };
          });
          setPeers(peersArr);
        });

        socket.current.on("user joined", ({ signal, callerID, user: newUser }) => {
          const peer = addPeer(signal, callerID, stream);
          peersRef.current.push({ peerID: callerID, peer, user: newUser });
          setPeers((prev) => [...prev, { peerID: callerID, peer, user: newUser }]);
        });

        socket.current.on("receiving returned signal", ({ id, signal }) => {
          const item = peersRef.current.find(p => p.peerID === id);
          if (item) item.peer.signal(signal);
        });

        socket.current.on("user left", (id) => {
          new Audio(leaveSFX).play();
          const peerObj = peersRef.current.find(p => p.peerID === id);
          if (peerObj) peerObj.peer.destroy();
          peersRef.current = peersRef.current.filter(p => p.peerID !== id);
          setPeers((prev) => prev.filter(p => p.peerID !== id));
        });
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    return () => {
      socket.current.disconnect();
      peersRef.current.forEach(p => p.peer.destroy());
    };
  }, [user, roomID]);

  const createPeer = (userToSignal, callerID, stream, remoteUser) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", signal => {
      socket.current.emit("sending signal", { userToSignal, callerID, signal, user });
    });
    joinSound.current.play();
    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", signal => socket.current.emit("returning signal", { signal, callerID }));
    peer.signal(incomingSignal);
    joinSound.current.play();
    return peer;
  };

  if (!user) return (
    <div className="room-login-container">
      <button className="room-login-button" onClick={login}>
        <GoogleIcon size={24} /> Login with Google
      </button>
    </div>
  );

  if (loading) return (
    <div className="room-loading-container">
      <Loading />
    </div>
  );

  return (
    <AnimatePresence>
      <div className="room-container">
        {/* Video Section */}
        <div className="room-main-section">
          <div className={`room-grid ${showChat ? "room-grid-with-chat" : "room-grid-without-chat"}`}>
            {/* Local Video */}
            <div className={`room-local-video ${pin ? "room-pinned-video" : ""}`}>
              <button className="room-pin-btn" onClick={() => setPin(!pin)}>
                {pin ? <PinActiveIcon /> : <PinIcon />}
              </button>
              <video ref={localVideo} muted autoPlay className="room-video-element" />
              {!videoActive && <div className="room-video-placeholder">
                <img src={user.photoURL} alt={user.displayName} />
              </div>}
              <div className="room-user-name">{user.displayName}</div>
            </div>
            {/* Remote Peers */}
            {peers.map(peer => <MeetGridCard key={peer.peerID} peer={peer.peer} user={peer.user} />)}
          </div>
        </div>
        {/* Controls */}
        <div className="room-controls">
          <button onClick={() => {
            if (localVideo.current) {
              const audioTrack = localVideo.current.srcObject.getAudioTracks()[0];
              audioTrack.enabled = !micOn;
              setMicOn(!micOn);
            }
          }}>{micOn ? <MicOnIcon /> : <MicOffIcon />}</button>
          <button onClick={() => {
            if (localStream) {
              const videoTrack = localStream.getVideoTracks()[0];
              videoTrack.enabled = !videoActive;
              setVideoActive(!videoActive);
            }
          }}>{videoActive ? <VideoOnIcon /> : <VideoOffIcon />}</button>
          <button onClick={() => { navigate("/"); window.location.reload(); }}><CallEndIcon /> End Call</button>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default Room;
