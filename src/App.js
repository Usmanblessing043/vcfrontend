import React from "react";

import { Routes, Route } from "react-router-dom";

// components
// import Header from "./Header";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

// pages
import Home from "./page/Home";
import Room from "./page/Room";
import NotFound from "./page/Notfound";
import Login from "./page/Login";
import Signup from "./page/Signup";
import Dashboard from "./page/Dashboard";
import Meetingroom from "./page/Meetingroom";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./components/Forgetpassword";
import ResetPassword from "./components/Resetpassword";




const App = () => {
  return (
    
         <div>
           <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomID" element={<Room />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/dashboard" element={<ProtectedRoute> <Dashboard></Dashboard> </ProtectedRoute>} />
            <Route path="/Meetingroom/:roomId" element={<Meetingroom/>} />
            <Route path="/forgetpassword" element={<ForgotPassword></ForgotPassword>} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />

          </Routes>
          <ToastContainer></ToastContainer>
         </div>
           
        
  );
};
export default App;