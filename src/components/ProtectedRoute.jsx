import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // If user isn't logged in, redirect to login
  if (!token) {
    return <Navigate to="/Login" replace />;
  }

  return children;
}
