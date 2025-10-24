import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Forgetpassword.css"

const backendUrl = process.env.REACT_APP_VIDEOBACKEND_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${backendUrl}/forgetpassword`, { email });
      toast.success(res.data.message);
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup">
      <div className="signupcontainer">
        <h1 id="re"> Reset your password</h1>
        <br />
        <form onSubmit={handleSubmit}>
          <div className="lab">
            {/* <label>Email</label> */}
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="bbt" disabled={loading} type="submit">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
