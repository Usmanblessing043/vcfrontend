import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FiSettings as SettingIcon } from "react-icons/fi";
import "./Sidebar.css"; // Import external CSS
import logo from '../images/logo.png';

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>
      </div>

      

    </div>
  );
};

export default Sidebar;
