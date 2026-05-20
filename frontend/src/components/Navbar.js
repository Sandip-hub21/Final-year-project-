import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  // Load user information from localStorage
  useEffect(() => {
    setName(localStorage.getItem("student_name") || "");
    setRole(localStorage.getItem("role") || "");
  }, [location]);

  const isLoggedIn = Boolean(name);

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <div className="navbar-inner">

        {/* Website title / logo */}
        <h2 className="navbar-title">
          Job Recommendation System
        </h2>

        <div className="navbar-links">

          {/* Always visible */}
          <Link to="/" className="nav-link">
            Home
          </Link>

          {/* Not logged in */}
          {!isLoggedIn && (
            <>
              <Link to="/register" className="nav-link">
                Register
              </Link>

              <Link to="/login" className="nav-link">
                Login
              </Link>
            </>
          )}

          {/* STUDENT NAVIGATION */}
          {isLoggedIn && role === "student" && (
            <>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>

              <Link to="/recommendations" className="nav-link">
                Recommendations
              </Link>

              <Link
                to="/saved-recommendations"
                className="nav-link"
              >
                Saved
              </Link>

              <Link to="/jobs" className="nav-link">
                Browse Jobs
              </Link>

              <Link to="/applications" className="nav-link">
                Applications
              </Link>
            </>
          )}

          {/* PUBLISHER NAVIGATION */}
          {isLoggedIn && role === "publisher" && (
            <>
              <Link
                to="/publisher/dashboard"
                className="nav-link"
              >
                Dashboard
              </Link>

              <Link
                to="/admin/jobs"
                className="nav-link"
              >
                Publish Jobs
              </Link>

              <Link
                to="/admin/applications"
                className="nav-link"
              >
                Applications
              </Link>
            </>
          )}

          {/* ADMIN NAVIGATION */}
          {isLoggedIn && role === "admin" && (
            <>
              <Link
                to="/admin/dashboard"
                className="nav-link"
              >
                Dashboard
              </Link>

              <Link
                to="/admin/jobs"
                className="nav-link"
              >
                Manage Jobs
              </Link>

              <Link
                to="/admin/applications"
                className="nav-link"
              >
                Applications
              </Link>

              <Link
                to="/admin/users"
                className="nav-link"
              >
                Manage Users
              </Link>
            </>
          )}

          {/* HELP DROPDOWN */}
          <div className="nav-help dropdown">

            <button className="help-button">
              Help
            </button>

            <div className="help-dropdown">

              <Link to="/register">
                Create Account
              </Link>

              <Link to="/login">
                Login Support
              </Link>

              <Link to="/forgot-password">
                Reset Password
              </Link>

              <Link to="/profile">
                How to Add Skills
              </Link>

              <Link to="/recommendations">
                Generate Recommendations
              </Link>

              <Link to="/applications">
                Track Applications
              </Link>

            </div>

          </div>

          {/* Logged-in user info */}
          {isLoggedIn && (
            <>
              <span className="nav-user">
                {role.toUpperCase()} • {name}
              </span>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;