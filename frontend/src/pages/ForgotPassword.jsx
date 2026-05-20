import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import heroImage from "../assets/graduate.jpg";

function ForgotPassword() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    new_password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Reset password
  const handleResetPassword = async () => {

    // Basic email validation
    if (
      !form.email.includes("@") ||
      !form.email.includes(".com")
    ) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    try {

      const res = await API.post("/forgot-password", form);

      setMessage(
        res.data.message ||
        "Password updated successfully."
      );

      setMessageType("success");

      // Redirect back to login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {

      setMessage(
        err.response?.data?.error ||
        "Failed to reset password"
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

          <h1>Forgot Password</h1>

          <p className="auth-subtitle">
            Reset your account password.
          </p>

          {/* Email */}
          <div className="form-group">

            <label className="label">Email</label>

            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

          </div>

          {/* New Password */}
          <div className="form-group">

            <label className="label">New Password</label>

            <div className="password-row">

              <input
                className="input"
                name="new_password"
                type={showPassword ? "text" : "password"}
                value={form.new_password}
                onChange={handleChange}
                placeholder="Enter new password"
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

          {/* Reset Button */}
          <button
            className="button primary auth-button"
            onClick={handleResetPassword}
          >
            Reset Password
          </button>

          {/* Messages */}
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

export default ForgotPassword;