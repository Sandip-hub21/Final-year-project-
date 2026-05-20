import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/graduate.jpg";

function Home() {
  const name = localStorage.getItem("student_name") || "Not set";
  const email = localStorage.getItem("student_email") || "Not set";
  const userId = localStorage.getItem("student_id") || "Not set";
  const role = localStorage.getItem("role") || "guest";

  const isStudent = role === "student";
  const isPublisher = role === "publisher";
  const isAdmin = role === "admin";

  return (
    <div
      className="home-hero-bg"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="home-hero-overlay">
        <div className="home-dashboard-card">
          <h1>Skill-Based Job Recommendation System</h1>
          <p className="home-subtitle">
            Match student skills with relevant job opportunities using machine learning.
          </p>

          {role !== "guest" && (
            <div className="overview-box">
              <h3>
                {isStudent && "Student Overview"}
                {isPublisher && "Publisher Overview"}
                {isAdmin && "Admin Overview"}
              </h3>

              <div className="overview-grid">
                <div>
                  <span>Name</span>
                  <strong>{name}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{email}</strong>
                </div>

                <div>
                  <span>
                    {isStudent && "Student ID"}
                    {isPublisher && "Publisher ID"}
                    {isAdmin && "Admin ID"}
                  </span>
                  <strong>{userId}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="home-actions">
            {role === "guest" && (
              <>
                <Link to="/register" className="button primary">Register</Link>
                <Link to="/login" className="button secondary">Login</Link>
              </>
            )}

            {isStudent && (
              <>
                <Link to="/profile" className="button primary">Add Skills</Link>
                <Link to="/recommendations" className="button secondary">Get Recommendations</Link>
                <Link to="/jobs" className="button secondary">Browse Jobs</Link>
              </>
            )}

            {isPublisher && (
              <>
                <Link to="/publisher/dashboard" className="button primary">Publisher Dashboard</Link>
                <Link to="/admin/jobs" className="button secondary">Publish Jobs</Link>
                <Link to="/admin/applications" className="button secondary">Applications</Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="button primary">Admin Dashboard</Link>
                <Link to="/admin/jobs" className="button secondary">Manage Jobs</Link>
                <Link to="/admin/users" className="button secondary">Manage Users</Link>
              </>
            )}
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>Skill Matching</h3>
              <p>Compares student skills with job requirements.</p>
            </div>

            <div className="feature-card">
              <h3>Job Applications</h3>
              <p>Students can apply and track application status.</p>
            </div>

            <div className="feature-card">
              <h3>Publisher Tools</h3>
              <p>Publishers can post jobs and review applications.</p>
            </div>

            <div className="feature-card">
              <h3>Admin Control</h3>
              <p>Admins can manage users, jobs, and applications.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;