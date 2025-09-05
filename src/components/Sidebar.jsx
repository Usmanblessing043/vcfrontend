import React from "react";
import { sideMenuData } from "../constants/SideMenuData";
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

      {/* Menu */}
      <div className="sidebar-menu">
        {sideMenuData?.map((item, index) => (
          <NavLink
            to={item.route}
            key={index}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item?.icon}
            <span>{item.text}</span>
          </NavLink>
        ))}
      </div>

      {/* Settings */}
      <div className="sidebar-settings">
        <SettingIcon />
      </div>
    </div>
  );
};

export default Sidebar;
