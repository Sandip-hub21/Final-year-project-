import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import heroImage from "../assets/graduate.jpg";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", form);
      const user = res.data;

      localStorage.clear();
      localStorage.setItem("student_id", user.student_id);
      localStorage.setItem("student_name", user.name || user.full_name || "");
      localStorage.setItem("student_email", user.email || "");
      localStorage.setItem("role", user.role || "student");

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "publisher") {
        navigate("/publisher/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        "Invalid email or password"
      );
      setMessageType("error");
    }
  };

  return (
    <div
      className="auth-wrapper"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="auth-overlay">
        <div className="auth-card">
          <h1>Login</h1>

          <p className="auth-subtitle">
            Sign in to access your dashboard.
          </p>

          <div className="form-group">
            <label className="label">Email</label>

            <input
              className="input"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>

            <div className="password-row">
              <input
                className="input"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />

              <button
                type="button"
                className="button secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            className="button primary auth-button"
            onClick={handleLogin}
          >
            Login
          </button>

         <button
  className="forgot-password-btn"
  onClick={() => navigate("/forgot-password")}
>
  Forgot Password?
</button>

          {message && (
            <div className={`message-box ${messageType}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;