import React, { useState } from 'react'
import './Login.css'
import { useFormik } from 'formik'
import * as yup from "yup"
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from "react-icons/fa"
import logo from '../images/logo.png'

const backendUrl = process.env.REACT_APP_VIDEOBACKEND_URL

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: yup.object({
      email: yup.string().email("The email is invalid").required("Email is required").lowercase(),
      password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
    }),
    onSubmit: (values, { resetForm }) => {
      setLoading(true)
      axios.post(`${backendUrl}/login`, values)
        .then((res) => {
          localStorage.setItem("token", res.data.token)
          toast.success('Login successful')
          navigate('/Dashboard')
          resetForm()
          setLoading(false)
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Login failed")
          resetForm()
          setLoading(false)
        })
    }
  })

  return (
    <div className='signup'>
      <video autoPlay loop muted playsInline className='bg-video'></video>
      <div className="signupcontainer">
        <div className="sidebar-logo">
        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>
      </div>
        <h1>Login for Video Conference</h1>
        <br />
        <form onSubmit={formik.handleSubmit}>
          <div className="lab">
            <label>Email</label><br />
            <input
              onBlur={formik.handleBlur}
              placeholder='Email'
              name='email'
              onChange={formik.handleChange}
              value={formik.values.email}
              type="email"
            />
          </div>
          <small>{formik.touched.email && formik.errors.email}</small>

          <div className="lab" style={{ position: 'relative' }}>
            <label>Password</label><br />
            <div style={{ position: 'relative'}}>
              <input
                onBlur={formik.handleBlur}
                placeholder='Password'
                name='password'
                onChange={formik.handleChange}
                value={formik.values.password}
                type={showPassword ? "text" : "password"}
                style={{ paddingRight: '40px' }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '40%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#555',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <small>{formik.touched.password && formik.errors.password}</small>

          <p className="login-link" style={{ marginLeft: "180px" }}>
            <Link className="link" to="/forgetpassword">Forgot Password?</Link>
          </p>

          <br />
          <p className="login-link">
            Don't have an account? <Link className='link' to={"/Signup"}>Sign up</Link>
          </p>
          <br />
          {/* <button className='bbt' disabled={loading} type="submit">
            {loading ? "Loading " : 'Login'}
          </button> */}
          <button className='bbt' disabled={loading} type="submit">
  {loading ? (
    <>
      Loading <i className="fa-solid fa-spinner fa-spin-pulse"  style={{ color:'white' }}></i>
    </>
  ) : (
    'Login'
  )}
</button>

        </form>
      </div>
    </div>
  )
}

export default Login
