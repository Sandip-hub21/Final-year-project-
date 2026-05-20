import React, { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Logged-in student details
  const studentId = localStorage.getItem("student_id");
  const studentName = localStorage.getItem("student_name") || "Not available";
  const studentEmail = localStorage.getItem("student_email") || "Not available";

  // Load applications for the logged-in student
  const loadApplications = useCallback(async () => {
    if (!studentId) {
      setMessage("Please login first.");
      setMessageType("error");
      return;
    }

    try {
      const res = await API.get(`/applications/${studentId}`);

      setApplications(res.data || []);

      if (!res.data || res.data.length === 0) {
        setMessage("No applications submitted yet.");
        setMessageType("error");
      } else {
        setMessage("");
        setMessageType("");
      }
    } catch (err) {
      console.log("APPLICATION ERROR:", err.response?.data || err.message);

      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to load applications."
      );
      setMessageType("error");
    }
  }, [studentId]);

  // Load applications when page opens
  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Withdraw an application
  const handleWithdraw = async (applicationId) => {
    try {
      await API.put(`/applications/${applicationId}/withdraw`);

      setMessage("Application withdrawn successfully.");
      setMessageType("success");

      await loadApplications();
    } catch (err) {
      console.log("WITHDRAW ERROR:", err.response?.data || err.message);

      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to withdraw application."
      );
      setMessageType("error");
    }
  };

  return (
    <div className="page-container wide-page">

      {/* Page heading */}
      <div className="page-header">
        <h1>Applications</h1>
        <p>
          Track submitted job applications and their current status.
        </p>
      </div>

      {/* Student information box */}
      <div className="info-box">

        <p>
          <strong>Student Name:</strong> {studentName}
        </p>

        <p>
          <strong>Email:</strong> {studentEmail}
        </p>

        <p>
          <strong>Student ID:</strong>{" "}
          {studentId || "Not available"}
        </p>

      </div>

      {/* Success or error messages */}
      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

      {/* Applications list */}
      {applications.length > 0 && (
        <div className="card-grid">

          {applications.map((app) => (

            <div className="job-card" key={app.application_id}>

              {/* Job title and status */}
              <div className="job-card-header">

                <div>
                  <h3 className="job-title">{app.title}</h3>
                  <p className="job-company">{app.company}</p>
                </div>

                <span className="status-badge status-submitted">
                  {app.status}
                </span>

              </div>

              {/* Job details */}
              <div className="job-meta-row">

                <span className="score-pill">
                  Application ID: {app.application_id}
                </span>

                <span className="match-badge badge-neutral">
                  {app.job_type || "Job"}
                </span>

                {app.hourly_wage && (
                  <span className="match-badge badge-strong">
                    £{Number(app.hourly_wage).toFixed(2)}/hr
                  </span>
                )}

              </div>

              {/* Application date */}
              <p className="meta-text">
                <strong>Applied on:</strong>{" "}
                {app.application_date || "Date not available"}
              </p>

              {/* Withdraw button */}
              {app.status !== "Withdrawn" ? (

                <button
                  className="withdraw-button"
                  onClick={() => handleWithdraw(app.application_id)}
                >
                  Withdraw Application
                </button>

              ) : (

                <p className="meta-text">
                  <strong>Status:</strong> Withdrawn
                </p>

              )}

            </div>

          ))}

        </div>
      )}
    </div>
  );
}

export default Applications;