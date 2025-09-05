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


const App = () => {
  return (
    <div className="app-container">
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      <div className="main-wrapper">
        <div className="header-wrapper">
          <Header />
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomID" element={<Room />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
export default App;