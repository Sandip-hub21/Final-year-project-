import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PageContainer from "../components/PageContainer";

function PublisherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  const role = localStorage.getItem("role");
  const publisherId = localStorage.getItem("student_id");
  const name = localStorage.getItem("student_name");
  const email = localStorage.getItem("student_email");

  useEffect(() => {
    if (role !== "publisher") {
      navigate("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const res = await API.get(`/publisher/${publisherId}/dashboard`);
        setStats(res.data);
      } catch (err) {
        setMessage(
          err.response?.data?.error ||
          err.message ||
          "Failed to load publisher dashboard"
        );
      }
    };

    loadDashboard();
  }, [navigate, role, publisherId]);

  return (
    <PageContainer
      title="Publisher Dashboard"
      subtitle="Overview of your published jobs and received applications."
    >
      {message && <div className="message-box error">{message}</div>}

      <div className="info-box">
        <h3>Publisher Overview</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Publisher ID:</strong> {publisherId}</p>
      </div>

      {stats && (
        <>
          <div className="dashboard-summary-grid">
            <div className="summary-box">
              <span className="summary-label">Total Jobs Published</span>
              <h3>{stats.total_jobs}</h3>
            </div>

            <div className="summary-box">
              <span className="summary-label">Active Jobs</span>
              <h3>{stats.active_jobs}</h3>
            </div>

            <div className="summary-box">
              <span className="summary-label">Expired Jobs</span>
              <h3>{stats.expired_jobs}</h3>
            </div>

            <div className="summary-box">
              <span className="summary-label">Applications Received</span>
              <h3>{stats.total_applications}</h3>
            </div>
          </div>

          <div className="section-heading">Application Status Summary</div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.status_counts && stats.status_counts.length > 0 ? (
                  stats.status_counts.map((item) => (
                    <tr key={item.status}>
                      <td>{item.status}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No applications received yet.</td>
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

export default PublisherDashboard;