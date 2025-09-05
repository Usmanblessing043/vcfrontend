import React from "react";
import "./HomeCard.css";

const HomeCard = ({ title, desc, icon, bgColor }) => {
  return (
    <div className={`homecard ${bgColor}`}>
      <div className="homecard-icon">{icon}</div>
      <div className="homecard-content">
        <h3 className="homecard-title">{title}</h3>
        <p className="homecard-desc">{desc}</p>
      </div>
    </div>
  );
};

export default HomeCard;
