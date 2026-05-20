import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContainer";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = () => {
    if (form.email === "admin@sandip.com" && form.password === "sandip123") {
      localStorage.setItem("is_admin", "true");
      localStorage.setItem("admin_email", form.email);

      setMessage("Admin login successful");
      setMessageType("success");

      navigate("/admin/jobs");
    } else {
      setMessage("Invalid admin credentials");
      setMessageType("error");
    }
  };

  return (
    <PageContainer
      title="Admin Login"
      subtitle="Sign in to manage jobs and applications."
    >
      <div className="form-group">
        <label className="label">Admin Email</label>
        <input
          className="input"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="admin@123.com"
        />
      </div>

      <div className="form-group">
        <label className="label">Admin Password</label>
        <input
          className="input"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="admin123"
        />
      </div>

      <button className="button primary" onClick={handleLogin}>
        Login as Admin
      </button>

      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}
    </PageContainer>
  );
}

export default AdminLogin;