import React from "react";
import { Link } from "react-router-dom";
import "./Notfound.css"; 

const NotFound = () => {
  return (
    <main className="notfound-container">
      <div className="notfound-content">
        <p className="notfound-error">Error 404</p>
       
        <p className="notfound-message">
          We are sorry, but this page does not exist.
        </p>
        <Link to="/" className="notfound-link">
          Back to home 
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
