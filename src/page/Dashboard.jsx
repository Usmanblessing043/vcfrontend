import React, { useEffect, useState } from "react";
import HomeCard from "../components/HomeCard";
import "./Home.css";
import './Dashboard.css'
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

import { v4 as uuid } from "uuid";
import axios from "axios";


// icons
import { MdVideoCall as NewCallIcon } from "react-icons/md";
import { MdAddBox as JoinCallIcon } from "react-icons/md";
import { BsCalendarDate as CalenderIcon } from "react-icons/bs";
import { MdScreenShare as ScreenShareIcon } from "react-icons/md";
import { Link } from "react-router-dom";
const backendUrl = process.env.REACT_APP_VIDEOBACKEND_URL
const roomId = uuid();

const Dashboard = () => {
    const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const users = JSON.parse(localStorage.getItem('current_users'))
  const name = users.username.toUpperCase()

      useEffect(() => {
    axios.get(`${backendUrl}/Verify`, {
      headers: {
        "Authorization": `bearer ${token}`
      }
    }).then((res) => {
      console.log(res.data.user);
      localStorage.setItem("current_users", JSON.stringify({ ...res.data.user, password: "" }))

    }).catch((err) => {
      console.log(err);
      if (err.response.data.message == "jwt expired") {
        navigate("/Login")
      }

    })
  }, [])

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ];
  const [date, setDate] = useState(new Date());

  function refreshClock() {
    setDate(new Date());
  }

  useEffect(() => {
    const timerId = setInterval(refreshClock, 1000);
    return () => clearInterval(timerId);
  }, []);


  const createroom = async () => {
    const res = await axios.post(`${backendUrl}/createroom`);
    navigate(`/meetingroom/${res.data.roomId}`);
  };

  const joinRoom = () => {
    const id = prompt("Enter Room ID");
    navigate(`/meetingroom/${id}`);
  };
 

  return (
     <div className="app-container">
          <div className="sidebar-wrapper">
            <Sidebar />
          </div>
    
          <div className="main-wrapper">
            <div className="header-wrapper">
              <Header clas='redd' first="firstt" second="secondd"/>
            </div>
    
            <div className="page-content">

                    <div className="home-container">
      <div className="home-wrapper">
        {/* LEFT SECTION */}
        <div className="home-left">
          <div className="card-group">
            
              <HomeCard
                title="New Meeting"
                desc="Create a new meeting"
                icon={<NewCallIcon />}
                iconBgColor="lightYellows"
                bgColor="bg-blue"
                route={`/room/`}
                cliik={createroom}
                

                
              />
          
            <HomeCard
              title="Join Meeting"
              desc="via invitation link"
              icon={<JoinCallIcon />}
              bgColor="bg-blue"
              cliik={joinRoom}
          
        
            />
          </div>

          <div className="card-group">
            <HomeCard
              title="Schedule"
              desc="schedule your meeting"
              icon={<CalenderIcon size={20} />}
              bgColor="bg-blue"
            />
            <HomeCard
              title="Screen Share"
              desc="show your work"
              icon={<ScreenShareIcon size={22} />}
              bgColor="bg-blue"
            />
          </div>

          <div className="made-with">
            Made with love by
            <a href="#" target="_blank" rel="noreferrer">
              {" "} Blessing
            </a>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="home-right">
          
          <div className="clock-box">
            <div className="clock-content">
              <p className="clock-time">
                {`${
                  date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
                }:${
                  date.getMinutes() < 10
                    ? `0${date.getMinutes()}`
                    : date.getMinutes()
                }`}
              </p>
              <p className="clock-date">
                {`${days[date.getDay()]}, ${date.getDate()} ${
                  months[date.getMonth()]
                } ${date.getFullYear()}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
             
            </div>
          </div>
        </div>




    
  );
};

export default Dashboard;
