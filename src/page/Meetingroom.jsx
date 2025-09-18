// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import io from "socket.io-client";
// import { Badge, IconButton, TextField } from "@mui/material";
// import { Button } from "@mui/material";
// // import VideocamIcon from "@mui/icons-material/Videocam";
// // import VideocamOffIcon from "@mui/icons-material/VideocamOff";
// import { IoVideocamSharp as VideocamIcon } from "react-icons/io5";
// import { IoVideocamOff as VideocamOffIcon } from "react-icons/io5";
// // import CallEndIcon from "@mui/icons-material/CallEnd";
// import { MdCallEnd as CallEndIcon } from "react-icons/md";
// // import MicIcon from "@mui/icons-material/Mic";
// // import MicOffIcon from "@mui/icons-material/MicOff";
// import { IoMic as MicIcon } from "react-icons/io5";
// import { IoMicOff as MicOffIcon } from "react-icons/io5";
// import { AiOutlineLink as LinkIcon } from "react-icons/ai";

// import './Meetingroom.css'
// import axios from "axios";
// import { toast } from "react-toastify";



// // import ScreenShareIcon from "@mui/icons-material/ScreenShare";
// import { MdScreenShare as ScreenShareIcon } from "react-icons/md";


// // import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
// import { AiOutlineShareAlt as StopScreenShareIcon } from "react-icons/ai";

// // import ChatIcon from "@mui/icons-material/Chat";
// import { IoChatboxOutline as ChatIcon } from "react-icons/io5";

// const server_url = process.env.REACT_APP_VIDEOBACKEND_URL;
// console.log(process.env.REACT_APP_VIDEOBACKEND_URL);




// var connections = {};
// const users = JSON.parse(localStorage.getItem("current_users"));
// const name = users?.username || "Guest";
// console.log(name);


// const peerConfigConnections = {
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// };

// export default function VideoMeetComponent() {
//   var socketRef = useRef();
//   let socketIdRef = useRef();
// const { roomId } = useParams();
//   let localVideoref = useRef();

//   let [videoAvailable, setVideoAvailable] = useState(true);

//   let [audioAvailable, setAudioAvailable] = useState(true);

//   let [video, setVideo] = useState([]);

//   let [audio, setAudio] = useState();

//   let [screen, setScreen] = useState();

//   let [showModal, setModal] = useState(true);

//   let [screenAvailable, setScreenAvailable] = useState();

//   let [messages, setMessages] = useState([]);

//   let [message, setMessage] = useState("");

//   let [newMessages, setNewMessages] = useState(0);

//   // let [askForUsername, setAskForUsername] = useState(true);

//   let [username, setUsername] = useState(name);

//   const videoRef = useRef([]);

//   let [videos, setVideos] = useState([]);

//   let routeTo = useNavigate();

//   // TODO
//   // if(isChrome() === false) {

//   // }

//   useEffect(() => {
//     console.log("HELLO");
//     getPermissions();
//   }, []);

//   let getDislayMedia = () => {
//     if (screen) {
//       if (navigator.mediaDevices.getDisplayMedia) {
//         navigator.mediaDevices
//           .getDisplayMedia({ video: true, audio: true })
//           .then(getDislayMediaSuccess)
//           .then((stream) => { })
//           .catch((e) => console.log(e));
//       }
//     }
//   };

//   const getPermissions = async () => {
//     try {
//       const videoPermission = await navigator.mediaDevices.getUserMedia({
//         video: true,
//       });
//       if (videoPermission) {
//         setVideoAvailable(true);
//         console.log("Video permission granted");
//       } else {
//         setVideoAvailable(false);
//         console.log("Video permission denied");
//       }

//       const audioPermission = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });
//       if (audioPermission) {
//         setAudioAvailable(true);
//         console.log("Audio permission granted");
//       } else {
//         setAudioAvailable(false);
//         console.log("Audio permission denied");
//       }

//       if (navigator.mediaDevices.getDisplayMedia) {
//         setScreenAvailable(true);
//       } else {
//         setScreenAvailable(false);
//       }

//       if (videoAvailable || audioAvailable) {
//         const userMediaStream = await navigator.mediaDevices.getUserMedia({
//           video: videoAvailable,
//           audio: audioAvailable,
//         });
//         if (userMediaStream) {  
//           window.localStream = userMediaStream;
//           if (localVideoref.current) {
//             localVideoref.current.srcObject = userMediaStream;
//           }
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     if (video !== undefined && audio !== undefined) {
//       getUserMedia();
//       console.log("SET STATE HAS ", video, audio);
//     }
//   }, [video, audio]);
//   let getMedia = () => {
//     setVideo(videoAvailable);
//     setAudio(audioAvailable);
//     connectToSocketServer();
//   };

//   let getUserMediaSuccess = (stream) => {
//     try {
//       window.localStream.getTracks().forEach((track) => track.stop());
//     } catch (e) {
//       console.log(e);
//     }

//     window.localStream = stream;
//     localVideoref.current.srcObject = stream;

//     for (let id in connections) {
//       if (id === socketIdRef.current) continue;

//       connections[id].addStream(window.localStream);

//       connections[id].createOffer().then((description) => {
//         console.log(description);
//         connections[id]
//           .setLocalDescription(description)
//           .then(() => {
//             socketRef.current.emit(
//               "signal",
//               id,
//               JSON.stringify({ sdp: connections[id].localDescription })
//             );
//           })
//           .catch((e) => console.log(e));
//       });
//     }

//     stream.getTracks().forEach(
//       (track) =>
//       (track.onended = () => {
//         setVideo(false);
//         setAudio(false);

//         try {
//           let tracks = localVideoref.current.srcObject.getTracks();
//           tracks.forEach((track) => track.stop());
//         } catch (e) {
//           console.log(e);
//         }

//         let blackSilence = (...args) =>
//           new MediaStream([black(...args), silence()]);
//         window.localStream = blackSilence();
//         localVideoref.current.srcObject = window.localStream;

//         for (let id in connections) {
//           connections[id].addStream(window.localStream);

//           connections[id].createOffer().then((description) => {
//             connections[id]
//               .setLocalDescription(description)
//               .then(() => {
//                 socketRef.current.emit(
//                   "signal",
//                   id,
//                   JSON.stringify({ sdp: connections[id].localDescription })
//                 );
//               })
//               .catch((e) => console.log(e));
//           });
//         }
//       })
//     );
//   };

//   let getUserMedia = () => {
//     if ((video && videoAvailable) || (audio && audioAvailable)) {
//       navigator.mediaDevices
//         .getUserMedia({ video: video, audio: audio })
//         .then(getUserMediaSuccess)
//         .then((stream) => { })
//         .catch((e) => console.log(e));
//     } else {
//       try {
//         let tracks = localVideoref.current.srcObject.getTracks();
//         tracks.forEach((track) => track.stop());
//       } catch (e) { }
//     }
//   };

//   let getDislayMediaSuccess = (stream) => {
//     console.log("HERE");
//     try {
//       window.localStream.getTracks().forEach((track) => track.stop());
//     } catch (e) {
//       console.log(e);
//     }

//     window.localStream = stream;
//     localVideoref.current.srcObject = stream;

//     for (let id in connections) {
//       if (id === socketIdRef.current) continue;

//       connections[id].addStream(window.localStream);

//       connections[id].createOffer().then((description) => {
//         connections[id]
//           .setLocalDescription(description)
//           .then(() => {
//             socketRef.current.emit(
//               "signal",
//               id,
//               JSON.stringify({ sdp: connections[id].localDescription })
//             );
//           })
//           .catch((e) => console.log(e));
//       });
//     }

//     stream.getTracks().forEach(
//       (track) =>
//       (track.onended = () => {
//         setScreen(false);

//         try {
//           let tracks = localVideoref.current.srcObject.getTracks();
//           tracks.forEach((track) => track.stop());
//         } catch (e) {
//           console.log(e);
//         }

//         let blackSilence = (...args) =>
//           new MediaStream([black(...args), silence()]);
//         window.localStream = blackSilence();
//         localVideoref.current.srcObject = window.localStream;

//         getUserMedia();
//       })
//     );
//   };

//   let gotMessageFromServer = (fromId, message) => {
//     var signal = JSON.parse(message);

//     if (fromId !== socketIdRef.current) {
//       if (signal.sdp) {
//         connections[fromId]
//           .setRemoteDescription(new RTCSessionDescription(signal.sdp))
//           .then(() => {
//             if (signal.sdp.type === "offer") {
//               connections[fromId]
//                 .createAnswer()
//                 .then((description) => {
//                   connections[fromId]
//                     .setLocalDescription(description)
//                     .then(() => {
//                       socketRef.current.emit(
//                         "signal",
//                         fromId,
//                         JSON.stringify({
//                           sdp: connections[fromId].localDescription,
//                         })
//                       );
//                     })
//                     .catch((e) => console.log(e));
//                 })
//                 .catch((e) => console.log(e));
//             }
//           })
//           .catch((e) => console.log(e));
//       }

//       if (signal.ice) {
//         connections[fromId]
//           .addIceCandidate(new RTCIceCandidate(signal.ice))
//           .catch((e) => console.log(e));
//       }
//     }
//   };

//   let connectToSocketServer = () => {
//     socketRef.current = io.connect(server_url, { secure: false });

//     socketRef.current.on("signal", gotMessageFromServer);

//     socketRef.current.on("connect", () => {
//       socketRef.current.emit("join-call", window.location.href);
//       socketIdRef.current = socketRef.current.id;

//       socketRef.current.on("chat-message", addMessage);

//       socketRef.current.on("user-left", (id) => {
//         setVideos((videos) => videos.filter((video) => video.socketId !== id));
//       });

//       socketRef.current.on("user-joined", (id, clients) => {
//         clients.forEach((socketListId) => {
//           connections[socketListId] = new RTCPeerConnection(
//             peerConfigConnections
//           );
//           // Wait for their ice candidate
//           connections[socketListId].onicecandidate = function (event) {
//             if (event.candidate != null) {
//               socketRef.current.emit(
//                 "signal",
//                 socketListId,
//                 JSON.stringify({ ice: event.candidate })
//               );
//             }
//           };

//           // Wait for their video stream
//           // connections[socketListId].onaddstream= (event) => {
//           //   console.log("BEFORE:", videoRef.current);
//           //   console.log("FINDING ID: ", socketListId);

//           //   let videoExists = videoRef.current.find(
//           //     (video) => video.socketId === socketListId
//           //   );

//           //   if (videoExists) {
//           //     console.log("FOUND EXISTING");

//           //     // Update the stream of the existing video
//           //     setVideos((videos) => {
//           //       const updatedVideos = videos.map((video) =>
//           //         video.socketId === socketListId
//           //           ? { ...video, stream: event.stream }
//           //           : video
//           //       );
//           //       videoRef.current = updatedVideos;
//           //       return updatedVideos;
//           //     });
//           //   } else {
//           //     // Create a new video
//           //     console.log("CREATING NEW");
//           //     let newVideo = {
//           //       socketId: socketListId,
//           //       stream: event.stream,
//           //       autoplay: true,
//           //       playsinline: true,
//           //     };

//           //     setVideos((videos) => {
//           //       const updatedVideos = [...videos, newVideo];
//           //       videoRef.current = updatedVideos;
//           //       return updatedVideos;
//           //     });
//           //   }
//           // };
//           connections[socketListId].ontrack = (event) => {
//   let [stream] = event.streams;
//   let videoExists = videoRef.current.find(
//     (video) => video.socketId === socketListId
//   );

//   if (videoExists) {
//     setVideos((videos) =>
//       videos.map((video) =>
//         video.socketId === socketListId ? { ...video, stream } : video
//       )
//     );
//   } else {
//     let newVideo = {
//       socketId: socketListId,
//       stream,
//       autoplay: true,
//       playsinline: true,
//     };

//     setVideos((videos) => {
//       const updated = [...videos, newVideo];
//       videoRef.current = updated;
//       return updated;
//     });
//   }
// };


//           // Add the local video stream
//           if (window.localStream !== undefined && window.localStream !== null) {
//             connections[socketListId].addStream(window.localStream);
//           } else {
//             let blackSilence = (...args) =>
//               new MediaStream([black(...args), silence()]);
//             window.localStream = blackSilence();
//             connections[socketListId].addStream(window.localStream);
//           }
//         });

//         if (id === socketIdRef.current) {
//           for (let id2 in connections) {
//             if (id2 === socketIdRef.current) continue;

//             try {
//               connections[id2].addStream(window.localStream);
//             } catch (e) { }

//             connections[id2].createOffer().then((description) => {
//               connections[id2]
//                 .setLocalDescription(description)
//                 .then(() => {
//                   socketRef.current.emit(
//                     "signal",
//                     id2,
//                     JSON.stringify({ sdp: connections[id2].localDescription })
//                   );
//                 })
//                 .catch((e) => console.log(e));
//             });
//           }
//         }
//       });
//     });
//   };

//   let silence = () => {
//     let ctx = new AudioContext();
//     let oscillator = ctx.createOscillator();
//     let dst = oscillator.connect(ctx.createMediaStreamDestination());
//     oscillator.start();
//     ctx.resume();
//     return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
//   };
//   let black = ({ width = 640, height = 480 } = {}) => {
//     let canvas = Object.assign(document.createElement("canvas"), {
//       width,
//       height,
//     });
//     canvas.getContext("2d").fillRect(0, 0, width, height);
//     let stream = canvas.captureStream();
//     return Object.assign(stream.getVideoTracks()[0], { enabled: false });
//   };

//   let handleVideo = () => {
//     setVideo(!video);
//     getUserMedia();
//   };
//   let handleAudio = () => {
//     setAudio(!audio);
//     getUserMedia();
//   };
//   const copylink = async () => {
//     const link = `${server_url}/room/${roomId}`;
//     await navigator.clipboard.writeText(link);
//     // alert("Invite link copied!");
//     toast.success('Invite link copied!')
//   };

//   useEffect(() => {
//     if (screen !== undefined) {
//       getDislayMedia();
//     }
//   }, [screen]);
//   let handleScreen = () => {
//     setScreen(!screen);
//   };

//   let handleEndCall = () => {
//     try {
//       let tracks = localVideoref.current.srcObject.getTracks();
//       tracks.forEach((track) => track.stop());
//     } catch (e) { }
//     routeTo("/Dashboard");
//   };

//   let openChat = () => {
//     setModal(true);
//     setNewMessages(0);
//   };
//   let closeChat = () => {
//     setModal(false);
//   };
//   let handleMessage = (e) => {
//     setMessage(e.target.value);
//   };

//   const addMessage = (data, sender, socketIdSender) => {
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { sender: sender, data: data },
//     ]);
//     if (socketIdSender !== socketIdRef.current) {
//       setNewMessages((prevNewMessages) => prevNewMessages + 1);
//     }
//   };

//   let sendMessage = () => {
//     console.log(socketRef.current);
//     socketRef.current.emit("chat-message", message, username);
//     setMessage("");

//     // this.setState({ message: "", sender: username })
//   };

//   // let connect = () => {

//   //   setAskForUsername(false);
//   //   getMedia();
//   // };

//   useEffect(() => {
//   if (username) {
//     getMedia();
//   }
// }, [username]);




//   //  const navigate = useNavigate()
//   // const token = localStorage.getItem('token')
//   // const users = JSON.parse(localStorage.getItem('current_users'))
//   // const name = users.username.toUpperCase()

//   //     useEffect(() => {
//   //   axios.get(`${server_url}/Verify`, {
//   //     headers: {
//   //       "Authorization": `bearer ${token}`
//   //     }
//   //   }).then((res) => {
//   //     console.log(res.data.user);

//   //   }).catch((err) => {
//   //     console.log(err);
//   //     if (err.response.data.message == "jwt expired") {
//   //       navigate("/Login")
//   //     }

//   //   })
//   // }, [])



//   return (
//     <div>
//       {/* {askForUsername === true ? (
//         <div className="pre">
//           <h2>Get started </h2>
//           <input type="text"
//             id="outlined-basic"
//             label="Username"
//             value={username}
//             required
//             placeholder="Enter Username"
//             onChange={(e) => setUsername(e.target.value)}
//             variant="outlined" />
//           <Button
//             variant="contained"
//             onClick={() => {
//               if (!username.trim()) {
//                 // alert("Input cannot be empty");
//                 toast.error("Username cannot be empty")
//               } else {
//                 connect();
//               }
//             }}
//           >
//             Connect
//           </Button>

//           <div>
//             <video ref={localVideoref} autoPlay muted></video>
//           </div>
//         </div>
//       ) : */}
//         <div className='meetVideoContainer'>
//           {showModal ? (
//             <div className='chatRoom'>
//               <div className='chatContainer'>
//                 <h1>Chat</h1>

//                 <div className='chattingDisplay'>
//                   {messages.length !== 0 ? (
//                     messages.map((item, index) => {
//                       console.log(messages);
//                       return (
//                         <div style={{ marginBottom: "20px" }} key={index}>
//                           <p style={{ fontWeight: "bold" }}>{item.sender}</p>
//                           <p>{item.data}</p>
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <p>No Messages Yet</p>
//                   )}
//                 </div>

//                 <div className='chattingArea'>
//                   <input type="text"
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     id="outlined-basic"
//                     label="Enter Your chat"
//                     variant="outlined"
//                     placeholder="Enter your Chat" />
//                   <Button variant="contained"
//                     id="mmm"
//                     onClick={() => {
//                       if (!message.trim()) {
//                         // alert("Input cannot be empty");
//                         toast.error("Parameter cannot be empty")
//                       } else {
//                         sendMessage();
//                       }
//                     }}>
//                     Send
//                   </Button>

//                 </div>
//               </div>
//             </div>
//           ) : (
//             <></>
//           )}

//           <div className='buttonContainers'>
//             <IconButton onClick={handleVideo} style={{ color: "white" }}>
//               {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
//             </IconButton>
//             <IconButton onClick={handleEndCall} style={{ color: "red" }}>
//               <CallEndIcon />
//             </IconButton>
//             <IconButton onClick={handleAudio} style={{ color: "white" }}>
//               {audio === true ? <MicIcon /> : <MicOffIcon />}
//             </IconButton>

//             {screenAvailable === true ? (
//               <IconButton onClick={handleScreen} style={{ color: "white" }}>
//                 {screen === true ? (
//                   <StopScreenShareIcon />
//                 ) : (
//                   <ScreenShareIcon />
//                 )}
//               </IconButton>
//             ) : (
//               <></>
//             )}
            

//             <Badge badgeContent={newMessages} max={999} color="secondary">
//               <IconButton
//                 onClick={() => setModal(!showModal)}
//                 style={{ color: "white" }}
//               >
//                 <ChatIcon />{" "}
//               </IconButton>
//             </Badge>
//             {/* <button className="shar" >Share link</button> */}
            
//            < IconButton onClick={copylink} style={{ color: "white" }}>
//               <LinkIcon></LinkIcon>
//             </IconButton>
//           </div>

//           <div className='conferenceView'>
//             {/* Local user */}
//             {video === true ? (
//               <video
//   className="meetUserVideo"
//   ref={localVideoref}
//   autoPlay
//   playsInline
//   muted
// ></video>
//             ) : (
//               <div className="videoAvatar">
//                 {username.charAt(0).toUpperCase()}
//               </div>
//             )}

//             {/* Remote users */}
//             {videos.map((videoObj) =>
//               videoObj.stream ? (
//                 <video
//   key={videoObj.socketId}
//   data-socket={videoObj.socketId}
//   ref={(ref) => {
//     if (ref && videoObj.stream) {
//       ref.srcObject = videoObj.stream;
//     }
//   }}
//   autoPlay
//   playsInline
// ></video>

//               ) : (
//                 <div key={videoObj.socketId} className="videoAvatar">
//                   {/* Fallback: you might also store usernames of remote peers */}
//                   U
//                 </div>
//               )
//             )}
//           </div>


//         </div>
      
//     </div>
//   );
// }






// src/page/Meetingroom.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import { Badge, IconButton } from "@mui/material";
import { Button } from "@mui/material";
import { IoVideocamSharp as VideocamIcon } from "react-icons/io5";
import { IoVideocamOff as VideocamOffIcon } from "react-icons/io5";
import { MdCallEnd as CallEndIcon } from "react-icons/md";
import { IoMic as MicIcon } from "react-icons/io5";
import { IoMicOff as MicOffIcon } from "react-icons/io5";
import { AiOutlineLink as LinkIcon } from "react-icons/ai";
import { MdScreenShare as ScreenShareIcon } from "react-icons/md";
import { AiOutlineShareAlt as StopScreenShareIcon } from "react-icons/ai";
import { IoChatboxOutline as ChatIcon } from "react-icons/io5";

import "./Meetingroom.css";
import axios from "axios";
import { toast } from "react-toastify";

const server_url = process.env.REACT_APP_VIDEOBACKEND_URL || "";
var connections = {};

const storedUsers = (() => {
  try {
    return JSON.parse(localStorage.getItem("current_users"));
  } catch {
    return null;
  }
})();
const name = storedUsers?.username || "Guest";

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const { roomId } = useParams();

  const localVideoref = useRef(null);
  const videoRef = useRef([]); // mirrors current videos

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [username, setUsername] = useState(name);
  const [videos, setVideos] = useState([]);
  const [needsPlayButton, setNeedsPlayButton] = useState(false); // show manual enable button if autoplay blocked

  const routeTo = useNavigate();

  useEffect(() => {
    // on mount: request getUserMedia permission early
    getPermissions();
    // cleanup on unmount
    return () => {
      try {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      } catch (e) {}
      // stop local tracks
      try {
        const tracks = localVideoref.current?.srcObject?.getTracks() || [];
        tracks.forEach((t) => t.stop());
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If username exists (from localStorage) start media & connect
  useEffect(() => {
    if (username) {
      getMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // --- permissions & local media ---
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      }).catch(() => null);

      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      }).catch(() => null);

      setAudioAvailable(!!audioPermission);

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      // If at least one available, obtain stream to show preview
      if (videoPermission || audioPermission) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        }).catch(() => null);

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
            localVideoref.current.playsInline = true;
            localVideoref.current.muted = true; // local preview muted to allow autoplay
            // try to play
            localVideoref.current.onloadedmetadata = () => {
              localVideoref.current
                .play()
                .catch(() => setNeedsPlayButton(true));
            };
          }
        }
      }
    } catch (error) {
      console.log("getPermissions error", error);
    }
  };

  // --- media helpers ---
  const getMedia = () => {
    // avoid making multiple socket connections if already connected
    if (!socketRef.current) {
      setVideo(videoAvailable);
      setAudio(audioAvailable);
      connectToSocketServer();
    } else {
      // already connected; ensure we have local media
      getUserMedia();
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks()?.forEach((t) => t.stop());
    } catch {}
    window.localStream = stream;
    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
      localVideoref.current.playsInline = true;
      localVideoref.current.muted = true;
      localVideoref.current.onloadedmetadata = () => {
        localVideoref.current.play().catch(() => setNeedsPlayButton(true));
      };
    }

    // update all existing peer connections with new stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      try {
        // remove existing senders & add tracks (RTCPeerConnection addStream is deprecated but you used it: keep addTrack if available)
        const pc = connections[id];
        // older code uses addStream - keep for compatibility
        if (pc.addStream) {
          pc.addStream(window.localStream);
        } else {
          // modern approach
          window.localStream.getTracks().forEach((track) => {
            try {
              pc.addTrack(track, window.localStream);
            } catch {}
          });
        }
        pc.createOffer().then((description) => {
          pc.setLocalDescription(description).then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: pc.localDescription })
            );
          });
        });
      } catch (e) {
        console.log("error adding stream to connection", e);
      }
    }

    // react to stream tracks ending
    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);
        try {
          localVideoref.current?.srcObject?.getTracks()?.forEach((t) => t.stop());
        } catch {}
        // set a muted black/silent stream as fallback
        const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        if (localVideoref.current) localVideoref.current.srcObject = window.localStream;
        for (let id in connections) {
          connections[id].addStream(window.localStream);
          connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description).then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            });
          });
        }
      };
    });
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log("getUserMedia failed", e));
    } else {
      try {
        localVideoref.current?.srcObject?.getTracks()?.forEach((t) => t.stop());
      } catch {}
    }
  };

  const getDislayMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks()?.forEach((t) => t.stop());
    } catch {}
    window.localStream = stream;
    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
      localVideoref.current.playsInline = true;
      localVideoref.current.muted = true;
      localVideoref.current.onloadedmetadata = () => {
        localVideoref.current.play().catch(() => setNeedsPlayButton(true));
      };
    }
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connections[id].localDescription })
          );
        });
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);
        try {
          localVideoref.current?.srcObject?.getTracks()?.forEach((t) => t.stop());
        } catch {}
        window.localStream = new MediaStream([black(), silence()]);
        localVideoref.current.srcObject = window.localStream;
        getUserMedia();
      };
    });
  };

  // --- signaling message handler ---
  const gotMessageFromServer = (fromId, message) => {
    try {
      const signal = JSON.parse(message);

      if (fromId === socketIdRef.current) return;

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
                        JSON.stringify({ sdp: connections[fromId].localDescription })
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
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
      }
    } catch (e) {
      console.log("gotMessageFromServer parse error", e);
    }
  };

  // --- connect to socket server (single connection) ---
  const connectToSocketServer = () => {
    if (socketRef.current) {
      // already connected
      return;
    }
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((v) => v.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        // create PeerConnections for each client (this is your existing flow)
        clients.forEach((socketListId) => {
          // skip if already have a connection object
          if (connections[socketListId]) return;

          const pc = new RTCPeerConnection(peerConfigConnections);
          connections[socketListId] = pc;

          pc.onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };

          // prefer ontrack and event.streams[0] for Safari
          pc.ontrack = (event) => {
            const stream = (event.streams && event.streams[0]) || null;
            if (!stream) return;

            // find existing
            const exists = videoRef.current.find((v) => v.socketId === socketListId);
            if (exists) {
              setVideos((videos) => videos.map((video) => (video.socketId === socketListId ? { ...video, stream } : video)));
            } else {
              const newVideo = { socketId: socketListId, stream, autoplay: true, playsinline: true };
              setVideos((videos) => {
                const updated = [...videos, newVideo];
                videoRef.current = updated;
                return updated;
              });
            }
          };

          // add local stream/tracks
          if (window.localStream) {
            if (pc.addStream) {
              try { pc.addStream(window.localStream); } catch {}
            } else {
              try {
                window.localStream.getTracks().forEach((t) => pc.addTrack(t, window.localStream));
              } catch {}
            }
          } else {
            const blackSilence = new MediaStream([black(), silence()]);
            window.localStream = blackSilence;
            try { pc.addStream(window.localStream); } catch {}
          }
        });

        // if the current socket joined (id === me) then create offers for others
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch {}
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
              });
            });
          }
        }
      });
    });
  };

  // --- utilities ---
  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  // --- UI actions ---
  const handleVideo = () => {
    setVideo((v) => !v);
    getUserMedia();
  };
  const handleAudio = () => {
    setAudio((a) => !a);
    getUserMedia();
  };
  const handleScreen = () => {
    setScreen((s) => !s);
  };
  const handleEndCall = () => {
    try {
      localVideoref.current?.srcObject?.getTracks()?.forEach((t) => t.stop());
    } catch {}
    routeTo("/Dashboard");
  };

  const openChat = () => {
    setModal(true);
    setNewMessages(0);
  };
  const closeChat = () => setModal(false);

  const handleMessage = (e) => setMessage(e.target.value);

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((n) => n + 1);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) {
      toast.error("Parameter cannot be empty");
      return;
    }
    socketRef.current?.emit("chat-message", message, username);
    setMessage("");
  };

  const copylink = async () => {
    const link = `${server_url}/room/${roomId}`;
    await navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  // Try to play all videos (user gesture)
  const handleEnablePlayback = async () => {
    const vids = Array.from(document.querySelectorAll("video"));
    const results = await Promise.all(
      vids.map((v) => v.play().then(() => true).catch(() => false))
    );
    if (results.some(Boolean)) {
      setNeedsPlayButton(false);
    }
  };

  // helper when setting remote video refs (attempt play and un-mute logic)
  const attachRemoteRef = (ref, stream) => {
    if (!ref || !stream) return;
    ref.srcObject = stream;
    ref.playsInline = true;
    ref.autoplay = true;

    // For Safari: onloadedmetadata attempt play; if blocked, show button for manual enable
    ref.onloadedmetadata = () => {
      ref.play().catch(() => {
        setNeedsPlayButton(true);
      });
    };
  };

  return (
    <div>
      <div className="meetVideoContainer">
        {showModal ? (
          <div className="chatRoom">
            <div className="chatContainer">
              <h1>Chat</h1>

              <div className="chattingDisplay">
                {messages.length !== 0 ? (
                  messages.map((item, index) => (
                    <div style={{ marginBottom: "20px" }} key={index}>
                      <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                      <p>{item.data}</p>
                    </div>
                  ))
                ) : (
                  <p>No Messages Yet</p>
                )}
              </div>

              <div className="chattingArea">
                <input
                  type="text"
                  value={message}
                  onChange={handleMessage}
                  placeholder="Enter your Chat"
                />
                <Button
                  variant="contained"
                  id="mmm"
                  onClick={() => {
                    if (!message.trim()) {
                      toast.error("Parameter cannot be empty");
                    } else {
                      sendMessage();
                    }
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="buttonContainers">
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
              {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </IconButton>
          ) : null}

          <Badge badgeContent={newMessages} max={999} color="secondary">
            <IconButton onClick={() => setModal((s) => !s)} style={{ color: "white" }}>
              <ChatIcon />
            </IconButton>
          </Badge>

          <IconButton onClick={copylink} style={{ color: "white" }}>
            <LinkIcon />
          </IconButton>
        </div>

        <div className="conferenceView">
          {/* Local user */}
          {video === true ? (
            <video
              className="meetUserVideo"
              ref={(el) => {
                localVideoref.current = el;
                if (el && window.localStream) {
                  el.srcObject = window.localStream;
                  el.playsInline = true;
                  el.muted = true;
                  el.onloadedmetadata = () => {
                    el.play().catch(() => setNeedsPlayButton(true));
                  };
                }
              }}
              autoPlay
              playsInline
              muted
            ></video>
          ) : (
            <div className="videoAvatar">{(username || "U").charAt(0).toUpperCase()}</div>
          )}

          {/* Remote users */}
          {videos.map((videoObj) =>
            videoObj.stream ? (
              <video
                key={videoObj.socketId}
                data-socket={videoObj.socketId}
                ref={(ref) => attachRemoteRef(ref, videoObj.stream)}
                autoPlay
                playsInline
              ></video>
            ) : (
              <div key={videoObj.socketId} className="videoAvatar">
                U
              </div>
            )
          )}
        </div>

        {/* If autoplay blocked (Safari), user must tap once to enable media */}
        {needsPlayButton && (
          <div style={{ position: "absolute", bottom: 100, left: 20, zIndex: 200 }}>
            <Button variant="contained" onClick={handleEnablePlayback}>
              Enable video/audio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
