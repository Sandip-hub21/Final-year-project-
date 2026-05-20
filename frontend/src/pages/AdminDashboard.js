import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PageContainer from "../components/PageContainer";

function AdminDashboard() {
  const navigate = useNavigate();

  // Stores dashboard statistics from the backend
  const [stats, setStats] = useState(null);

  // Stores error messages
  const [message, setMessage] = useState("");

  const role = localStorage.getItem("role");

  useEffect(() => {
    // Only admin should access this page
    if (role !== "admin") {
      navigate("/login");
      return;
    }

    const loadStats = async () => {
      try {
        const res = await API.get("/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        setMessage(
          err.response?.data?.error ||
          err.message ||
          "Failed to load admin dashboard"
        );
      }
    };

    loadStats();
  }, [navigate, role]);

  return (
    <PageContainer
      title="Admin Dashboard"
      subtitle="Central overview of students, publishers, jobs, and applications."
    >
      {message && (
        <div className="message-box error">
          {message}
        </div>
      )}

      {stats && (
        <>
          {/* Summary statistic cards */}
          <div className="dashboard-summary-grid">
            <div className="summary-box">
              <span className="summary-label">Students</span>
              <h3>{stats.students ?? stats.total_students ?? 0}</h3>
            </div>

            <div className="summary-box">
              <span className="summary-label">Publishers</span>
              <h3>{stats.publishers ?? stats.total_publishers ?? 0}</h3>
            </div>

            <div className="summary-box">
              <span className="summary-label">Jobs</span>
              <h3>{stats.jobs ?? stats.total_jobs ?? 0}</h3>
            </div>

            <div className="summary-box">
              <span className="summary-label">Active Jobs</span>
              <h3>{stats.active_jobs ?? 0}</h3>
            </div>

            <div className="summary-box">
              <span className="summary-label">Applications</span>
              <h3>{stats.applications ?? stats.total_applications ?? 0}</h3>
            </div>
          </div>

          {/* Most applied jobs table */}
          <div className="section-heading">Most Applied Jobs</div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Applications</th>
                </tr>
              </thead>

              <tbody>
                {stats.most_applied_jobs && stats.most_applied_jobs.length > 0 ? (
                  stats.most_applied_jobs.map((job, index) => (
                    <tr key={index}>
                      <td>{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.application_count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">
                      No application data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageContainer>
  );
}

export default AdminDashboard;