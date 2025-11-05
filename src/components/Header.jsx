import React from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import logo from '../images/logo.png';

import { AiOutlineLogout as LogOutIcon } from "react-icons/ai";
import "./Header.css"; // Import external CSS

const Header = ({clas, second, first}) => {
   const navigate = useNavigate()
    function signup() {
       navigate('/Signup')

    
    }
     function login() {
       navigate('/Login')

    
    }
    function logout() {
       localStorage.removeItem('token')
       localStorage.removeItem('current_users')
       navigate('/Login')
    }

  return (
    <div className="header">
      {/* App Title */}
      <div className="sidebar-logoo">
              <Link to="/">
                <img src={logo} alt="logo" />
              </Link>
            </div>
      <Link to="/" className="header-title">
        Video Conference
      </Link>

      {/* Right side */}
    
          
          {/* <button className="header-logout" title="Logout">
            <LogOutIcon />
          </button> */}

          <div className="but">
            <Button in ={signup}  text='Sign up' sty={first}></Button>
          <Button in = {login}  text='Login' sty={second}></Button>
          <Button in={logout} text='Log out' sty={clas}></Button> 

          </div>
          
        
    
       
    
    </div>
  );
};

export default Header;
