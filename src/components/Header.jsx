import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AiOutlineLogout as LogOutIcon } from "react-icons/ai";
import "./Header.css"; // Import external CSS

const Header = () => {
  const { user, login, logout } = useAuth();

  return (
    <div className="header">
      {/* App Title */}
      <Link to="/" className="header-title">
        Video Conference
      </Link>

      {/* Right side */}
      {user ? (
        <div className="header-user">
          <img src={user?.photoURL} alt={user?.displayname} />
          <button className="header-logout" onClick={logout} title="Logout">
            <LogOutIcon />
          </button>
        </div>
      ) : (
        <button className="header-login" onClick={login}>
          Login
        </button>
      )}
    </div>
  );
};

export default Header;
