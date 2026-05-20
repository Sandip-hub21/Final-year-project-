import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import heroImage from "../assets/graduate.jpg";

function Register() {
  // Used to redirect user after successful registration
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // Updates form state when user types
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Handles registration submit
  const handleSubmit = async () => {
    // Basic email validation: must include @ and .com
    if (!form.email.includes("@") || !form.email.includes(".com")) {
      setUserInfo(null);
      setMessage("Please enter a valid email address containing @ and .com");
      setMessageType("error");
      return;
    }

    try {
      // Send registration data to Flask backend
      const res = await API.post("/register", form);

      setMessage(res.data.message || "Registered successfully. Redirecting to login...");
      setMessageType("success");
      setUserInfo(res.data);

      // Clear form after successful registration
      setForm({
        name: "",
        email: "",
        password: "",
        role: "student"
      });

      setShowPassword(false);

      // Redirect user to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setUserInfo(null);

      setMessage(
        err.response?.data?.error ||
        "Registration failed"
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
          <h1>Register</h1>

          <p className="auth-subtitle">
            Create a student or publisher account.
          </p>

          <div className="form-group">
            <label className="label">Account Type</label>

            <select
              className="input"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="publisher">Publisher</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Full Name</label>

            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="label">Email</label>

            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
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
                placeholder="Create a password"
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
            onClick={handleSubmit}
          >
            Register
          </button>

          {message && (
            <div className={`message-box ${messageType}`}>
              {message}
            </div>
          )}

          {userInfo && (
            <div className="info-box">
              <p><strong>User ID:</strong> {userInfo.student_id}</p>
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Role:</strong> {userInfo.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;