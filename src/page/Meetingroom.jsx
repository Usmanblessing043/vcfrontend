import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import { IoVideocamSharp as VideocamIcon } from "react-icons/io5";
import { IoVideocamOff as VideocamOffIcon } from "react-icons/io5";
import { MdCallEnd as CallEndIcon } from "react-icons/md";
import { IoMic as MicIcon } from "react-icons/io5";
import { IoMicOff as MicOffIcon } from "react-icons/io5";
import { AiOutlineLink as LinkIcon } from "react-icons/ai";
import { MdScreenShare as ScreenShareIcon } from "react-icons/md";
import { AiOutlineShareAlt as StopScreenShareIcon } from "react-icons/ai";
import { IoChatboxOutline as ChatIcon } from "react-icons/io5";
import './Meetingroom.css';

const server_url = process.env.REACT_APP_VIDEOBACKEND_URL;

var connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const users = JSON.parse(localStorage.getItem("current_users"));
const name = users?.username || "Guest";
console.log(name);
const token = localStorage.getItem('token')

export default function MeetingRoom() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const { roomId } = useParams();
  const localVideoref = useRef();
  const navigate = useNavigate();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [username, setUsername] = useState(name);
  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/Login");
      return;
    }
   
  }, []);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };



   
   
   

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  useEffect(() => {
    if (username) {
      connectToSocketServer();
    }
  }, [username]);

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log("Error stopping old tracks:", e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].getSenders().forEach((sender) => {
        connections[id].removeTrack(sender);
      });

      stream.getTracks().forEach((track) => {
        connections[id].addTrack(track, stream);
      });

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          let tracks = localVideoref.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoref.current.srcObject = window.localStream;

        for (let id in connections) {
          connections[id].getSenders().forEach((sender) => {
            connections[id].removeTrack(sender);
          });

          window.localStream.getTracks().forEach((track) => {
            connections[id].addTrack(track, window.localStream);
          });

          connections[id].createOffer().then((description) => {
            connections[id]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription })
                );
              })
              .catch((e) => console.log(e));
          });
        }
      };
    });
  };

  const getDislayMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log("Error stopping old tracks:", e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].getSenders().forEach((sender) => {
        connections[id].removeTrack(sender);
      });

      stream.getTracks().forEach((track) => {
        connections[id].addTrack(track, stream);
      });

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);

        try {
          let tracks = localVideoref.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoref.current.srcObject = window.localStream;

        getUserMedia();
      };
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
        delete connections[id];
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].ontrack = (event) => {
            console.log("Remote track received:", socketListId);
            let [stream] = event.streams;

            setVideos((prevVideos) => {
              let videoExists = prevVideos.find(
                (video) => video.socketId === socketListId
              );

              if (videoExists) {
                return prevVideos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream }
                    : video
                );
              } else {
                let newVideo = {
                  socketId: socketListId,
                  stream,
                  autoplay: true,
                  playsinline: true,
                };

                const updated = [...prevVideos, newVideo];
                videoRef.current = updated;
                return updated;
              }
            });
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            // window.localStream.getTracks().forEach((track) => {
            //   connections[socketListId].addTrack(track, window.localStream);
            // });
            if (window.localStream) {
  const stream = window.localStream;

  // ✅ If addTrack exists, use it
  if (connections[socketListId].addTrack) {
    stream.getTracks().forEach((track) => {
      connections[socketListId].addTrack(track, stream);
    });

  // 🧩 Fallback for older Android browsers
  } else if (connections[socketListId].addStream) {
    connections[socketListId].addStream(stream);
  }

} else {
  // create a silent black stream if user has no media
  const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
  const stream = (window.localStream = blackSilence());

  if (connections[socketListId].addTrack) {
    stream.getTracks().forEach((track) => {
      connections[socketListId].addTrack(track, stream);
    });
  } else if (connections[socketListId].addStream) {
    connections[socketListId].addStream(stream);
  }
}

          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              window.localStream.getTracks().forEach((track) => {
                connections[id2].addTrack(track, window.localStream);
              });
            } catch (e) {
              console.log(e);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const handleVideo = () => {
    setVideo(!video);
  };

  const handleAudio = () => {
    setAudio(!audio);
  };

  const copylink = async () => {
    const link = `${window.location.origin}/meeting/${roomId}`;
    await navigator.clipboard.writeText(link);
    alert("Invite link copied!");
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);

  const getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .catch((e) => console.log(e));
      }
    }
  };

  const handleScreen = () => {
    setScreen(!screen);
  };

  const handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    navigate("/Dashboard");
  };

  const openChat = () => {
    setModal(true);
    setNewMessages(0);
  };

  const closeChat = () => {
    setModal(false);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
    }
  };

  return (
    <div className="meeting-container">
      {showModal && (
        <div className="chat-room">
          <div className="chat-container">
            <h1>Chat</h1>
            <div className="chatting-display">
              {messages.length !== 0 ? (
                messages.map((item, index) => (
                  <div key={index} className="message-item">
                    <p className="message-sender">{item.sender}</p>
                    <p className="message-data">{item.data}</p>
                  </div>
                ))
              ) : (
                <p>No Messages Yet</p>
              )}
            </div>
            <div className="chatting-area">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your chat"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      <div className="button-containers">
        <button onClick={handleVideo} className="control-btn">
          {video ? <VideocamIcon size={24} /> : <VideocamOffIcon size={24} />}
        </button>
        <button onClick={handleEndCall} className="control-btn end-call-btn">
          <CallEndIcon size={24} />
        </button>
        <button onClick={handleAudio} className="control-btn">
          {audio ? <MicIcon size={24} /> : <MicOffIcon size={24} />}
        </button>
        {screenAvailable && (
          <button onClick={handleScreen} className="control-btn">
            {screen ? (
              <StopScreenShareIcon size={24} />
            ) : (
              <ScreenShareIcon size={24} />
            )}
          </button>
        )}
        <button onClick={() => setModal(!showModal)} className="control-btn">
          <ChatIcon size={24} />
          {newMessages > 0 && (
            <span className="message-badge">{newMessages}</span>
          )}
        </button>
        <button onClick={copylink} className="control-btn">
          <LinkIcon size={24} />
        </button>
      </div>

      <div className="conference-view">
        <div className="video-grid">
          <div className="video-wrapper">
            {video ? (
              <video
                className="meet-user-video"
                ref={localVideoref}
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="video-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="video-label">{username} (You)</div>
          </div>

          {videos.map((videoObj) => (
            <div key={videoObj.socketId} className="video-wrapper">
              {videoObj.stream ? (
                <video
                  data-socket={videoObj.socketId}
                  ref={(ref) => {
                    if (ref && videoObj.stream) {
                      ref.srcObject = videoObj.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  className="meet-user-video"
                />
              ) : (
                <div className="video-avatar">U</div>
              )}
              <div className="video-label">Participant</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
