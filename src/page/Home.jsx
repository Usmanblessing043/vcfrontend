import React, { useEffect, useState } from "react";
import HomeCard from "../components/HomeCard";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import a1 from '../images/a1.png';
import a2 from '../images/a2.png';
import a3 from '../images/a3.png';
import a4 from '../images/a4.png';
import a5 from '../images/a5.png';
import a6 from '../images/a6.png';
import sec from '../images/sec.png';
import sec1 from '../images/sec1.png';

import { v4 as uuid } from "uuid";

// icons
import { MdVideoCall as NewCallIcon } from "react-icons/md";
import { MdAddBox as JoinCallIcon } from "react-icons/md";
import { BsCalendarDate as CalenderIcon } from "react-icons/bs";
import { MdScreenShare as ScreenShareIcon } from "react-icons/md";
import { Link } from "react-router-dom";
const typingWords = ["simple", "reliable", "engaging"];

const roomId = uuid();

const Home = () => {
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
 


   const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = typingWords[wordIndex];
    let timeout;

    if (!deleting && charIndex <= currentWord.length) {
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, charIndex));
        setCharIndex(charIndex + 1);
      }, 150);
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, charIndex));
        setCharIndex(charIndex - 1);
      }, 100);
    } else if (!deleting && charIndex > currentWord.length) {
      timeout = setTimeout(() => setDeleting(true), 800);
    } else if (deleting && charIndex < 0) {
      setDeleting(false);
      setWordIndex((wordIndex + 1) % typingWords.length);
      setCharIndex(0);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex])


//   useEffect(() => {
//   const faqItems = document.querySelectorAll(".faq-item");
//   faqItems.forEach(item => {
//     const btn = item.querySelector(".faq-question");
//     btn.addEventListener("click", () => {
//       item.classList.toggle("active");
//     });
//   });
// }, []);

  return (
     <div className="app-container">
          <div className="sidebar-wrapper">
            <Sidebar />
          </div>
    
          <div className="main-wrapper">
            <div className="header-wrapper">
              <Header clas='red' first="first" second="second"/>
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

                
              />
          
            <HomeCard
              title="Join Meeting"
              desc="via invitation link"
              icon={<JoinCallIcon />}
              bgColor="bg-blue"
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
          <div className="mar"><marquee  behavior=""  direction="">Kindly Login or Signup first before you can create meeting or join meeting Thanks........</marquee></div>
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
        <section className="hero">
      {/* LEFT CONTENT */}
      <div className="hero-text">
        <p>
          Built with care to deliver a{" "}
          <span className="typing-highlight">{displayText}</span>{" "}
          video conferencing experience that helps people communicate better,
          work smarter, and stay connected every day.
        </p>
      </div>

      {/* RIGHT CONTENT */}
      <div className="hero-media">
        <div className="speaker-layout float">
          <div className="live-indicator">
            <span className="dot"></span> LIVE
          </div>

          <div className="main-speaker active">
            <img src={a1} alt="Main speaker" />
            <span className="speaker-name">
              Host <span className="mic muted">🎤</span>
            </span>
          </div>

          <div className="participants">
            <div className="participant">
              <img src={a2} alt="Participant" />
              <span className="mic muted">🎤</span>
            </div>

            <div className="participant">
              <img src={a3} alt="Participant" />
              <span className="mic">🎤</span>
            </div>

            <div className="participant">
              <img src={a4} alt="Participant" />
              <span className="mic muted">🎤</span>
            </div>
          </div>
        </div>
      </div>
    </section>

  <section className="features-section">
  <h2 className="section-title">Why choose our platform?</h2>
  <br></br>
  <div className="features-cards">
    <div className="feature-card">
      <div className="icon-wrapper">
        <img src={a5} alt="HD Video & Audio" />
      </div>
      <h3>HD Video & Audio</h3>
      <p>High-quality video and audio for smooth communication anywhere.</p>
    </div>
    <div className="feature-card">
      <div className="icon-wrapper">
        <img src={sec} alt="Screen Sharing" />
      </div>
      <h3>Screen Sharing</h3>
      <p>Share your screen effortlessly during meetings or presentations.</p>
    </div>
    <div className="feature-card">
      <div className="icon-wrapper">
        <img src={sec1} alt="Secure & Private" />
      </div>
      <h3>Secure & Private</h3>
      <p>End-to-end encryption to keep your meetings safe and private.</p>
    </div>
  </div>
</section>



{/* <section className="testimonials-section">
  <h2 className="section-title">What our users say</h2>
  <div className="testimonials-cards">
    <div className="testimonial-card">
      <p>"This app makes remote work effortless!"</p>
      <span>- Sarah J.</span>
    </div>
    <div className="testimonial-card">
      <p>"Reliable and easy to use for online meetings."</p>
      <span>- Michael R.</span>
    </div>
    <div className="testimonial-card">
      <p>"HD video and smooth screen sharing impressed our team."</p>
      <span>- Emily K.</span>
    </div>
  </div>
</section> */}





    







        </div>
      </div>
    </div>
             
            </div>
          </div>
        </div>




    
  );
};

export default Home;
