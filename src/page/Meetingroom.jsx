import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
// import VideocamIcon from "@mui/icons-material/Videocam";
// import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { IoVideocamSharp as VideocamIcon } from "react-icons/io5";
import { IoVideocamOff as VideocamOffIcon } from "react-icons/io5";
// import CallEndIcon from "@mui/icons-material/CallEnd";
import { MdCallEnd as CallEndIcon } from "react-icons/md";
// import MicIcon from "@mui/icons-material/Mic";
// import MicOffIcon from "@mui/icons-material/MicOff";
import { IoMic as MicIcon } from "react-icons/io5";
import { IoMicOff as MicOffIcon } from "react-icons/io5";
import { AiOutlineLink as LinkIcon } from "react-icons/ai";

import './Meetingroom.css'
import axios from "axios";
import { toast } from "react-toastify";



// import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import { MdScreenShare as ScreenShareIcon } from "react-icons/md";


// import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import { AiOutlineShareAlt as StopScreenShareIcon } from "react-icons/ai";

// import ChatIcon from "@mui/icons-material/Chat";
import { IoChatboxOutline as ChatIcon } from "react-icons/io5";

const server_url = process.env.REACT_APP_VIDEOBACKEND_URL;
console.log(process.env.REACT_APP_VIDEOBACKEND_URL);




var connections = {};
const users = JSON.parse(localStorage.getItem("current_users"));
const name = users?.username || "Guest";
console.log(name);


const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
const { roomId } = useParams();
  let localVideoref = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState([]);

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(0);

  // let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState(name);

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  let routeTo = useNavigate();

  // TODO
  // if(isChrome() === false) {

  // }

  useEffect(() => {
    console.log("HELLO");
    getPermissions();
  }, []);

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => { })
          .catch((e) => console.log(e));
      }
    }
  };

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
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
      console.log("SET STATE HAS ", video, audio);
    }
  }, [video, audio]);
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
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

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
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

    stream.getTracks().forEach(
      (track) =>
      (track.onended = () => {
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
          connections[id].addStream(window.localStream);

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
      })
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) { }
    }
  };

  let getDislayMediaSuccess = (stream) => {
    console.log("HERE");
    // try {
    //   window.localStream.getTracks().forEach((track) => track.stop());
    // } catch (e) {
    //   console.log(e);
    // }

    let getDislayMediaSuccess = (stream) => {
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

      connections[id].addStream(window.localStream);

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

    stream.getTracks().forEach(
      (track) =>
      (track.onended = () => {
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
      })
    );
  };

  let gotMessageFromServer = (fromId, message) => {
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

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          // connections[socketListId].onaddstream= (event) => {
          //   console.log("BEFORE:", videoRef.current);
          //   console.log("FINDING ID: ", socketListId);

          //   let videoExists = videoRef.current.find(
          //     (video) => video.socketId === socketListId
          //   );

          //   if (videoExists) {
          //     console.log("FOUND EXISTING");

          //     // Update the stream of the existing video
          //     setVideos((videos) => {
          //       const updatedVideos = videos.map((video) =>
          //         video.socketId === socketListId
          //           ? { ...video, stream: event.stream }
          //           : video
          //       );
          //       videoRef.current = updatedVideos;
          //       return updatedVideos;
          //     });
          //   } else {
          //     // Create a new video
          //     console.log("CREATING NEW");
          //     let newVideo = {
          //       socketId: socketListId,
          //       stream: event.stream,
          //       autoplay: true,
          //       playsinline: true,
          //     };

          //     setVideos((videos) => {
          //       const updatedVideos = [...videos, newVideo];
          //       videoRef.current = updatedVideos;
          //       return updatedVideos;
          //     });
          //   }
          // };
          connections[socketListId].ontrack = (event) => {
  let [stream] = event.streams;
  let videoExists = videoRef.current.find(
    (video) => video.socketId === socketListId
  );

  if (videoExists) {
    setVideos((videos) =>
      videos.map((video) =>
        video.socketId === socketListId ? { ...video, stream } : video
      )
    );
  } else {
    let newVideo = {
      socketId: socketListId,
      stream,
      autoplay: true,
      playsinline: true,
    };

    setVideos((videos) => {
      const updated = [...videos, newVideo];
      videoRef.current = updated;
      return updated;
    });
  }
};


          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) { }

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

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = () => {
    setVideo(!video);
    getUserMedia();
  };
  let handleAudio = () => {
    setAudio(!audio);
    getUserMedia();
  };
  const copylink = async () => {
    const link = `${server_url}/room/${roomId}`;
    await navigator.clipboard.writeText(link);
    // alert("Invite link copied!");
    toast.success('Invite link copied!')
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) { }
    routeTo("/Dashboard");
  };

  let openChat = () => {
    setModal(true);
    setNewMessages(0);
  };
  let closeChat = () => {
    setModal(false);
  };
  let handleMessage = (e) => {
    setMessage(e.target.value);
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

  let sendMessage = () => {
    console.log(socketRef.current);
    socketRef.current.emit("chat-message", message, username);
    setMessage("");

    // this.setState({ message: "", sender: username })
  };

  // let connect = () => {

  //   setAskForUsername(false);
  //   getMedia();
  // };

  useEffect(() => {
  if (username) {
    getMedia();
  }
}, [username]);




  //  const navigate = useNavigate()
  // const token = localStorage.getItem('token')
  // const users = JSON.parse(localStorage.getItem('current_users'))
  // const name = users.username.toUpperCase()

  //     useEffect(() => {
  //   axios.get(`${server_url}/Verify`, {
  //     headers: {
  //       "Authorization": `bearer ${token}`
  //     }
  //   }).then((res) => {
  //     console.log(res.data.user);

  //   }).catch((err) => {
  //     console.log(err);
  //     if (err.response.data.message == "jwt expired") {
  //       navigate("/Login")
  //     }

  //   })
  // }, [])



  return (
    <div>
      {/* {askForUsername === true ? (
        <div className="pre">
          <h2>Get started </h2>
          <input type="text"
            id="outlined-basic"
            label="Username"
            value={username}
            required
            placeholder="Enter Username"
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined" />
          <Button
            variant="contained"
            onClick={() => {
              if (!username.trim()) {
                // alert("Input cannot be empty");
                toast.error("Username cannot be empty")
              } else {
                connect();
              }
            }}
          >
            Connect
          </Button>

          <div>
            <video ref={localVideoref} autoPlay muted></video>
          </div>
        </div>
      ) : */}
        <div className='meetVideoContainer'>
          {showModal ? (
            <div className='chatRoom'>
              <div className='chatContainer'>
                <h1>Chat</h1>

                <div className='chattingDisplay'>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      console.log(messages);
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className='chattingArea'>
                  <input type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                    placeholder="Enter your Chat" />
                  <Button variant="contained"
                    id="mmm"
                    onClick={() => {
                      if (!message.trim()) {
                        // alert("Input cannot be empty");
                        toast.error("Parameter cannot be empty")
                      } else {
                        sendMessage();
                      }
                    }}>
                    Send
                  </Button>

                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className='buttonContainers'>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <StopScreenShareIcon />
                ) : (
                  <ScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}
            

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton
                onClick={() => setModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />{" "}
              </IconButton>
            </Badge>
            {/* <button className="shar" >Share link</button> */}
            
           < IconButton onClick={copylink} style={{ color: "white" }}>
              <LinkIcon></LinkIcon>
            </IconButton>
          </div>

          <div className='conferenceView'>
            {/* Local user */}
            {video === true ? (
              <video
  className="meetUserVideo"
  ref={localVideoref}
  autoPlay
  playsInline
  muted
></video>
            ) : (
              <div className="videoAvatar">
                {username.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Remote users */}
            {videos.map((videoObj) =>
              videoObj.stream ? (
                <video
  key={videoObj.socketId}
  data-socket={videoObj.socketId}
  ref={(ref) => {
    if (ref && videoObj.stream) {
      ref.srcObject = videoObj.stream;
    }
  }}
  autoPlay
  playsInline
></video>

              ) : (
                <div key={videoObj.socketId} className="videoAvatar">
                  {/* Fallback: you might also store usernames of remote peers */}
                  U
                </div>
              )
            )}
          </div>


        </div>
      
    </div>
  );
}






