import React, { useEffect, useState } from "react";
import API from "../services/api";

function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const studentId = localStorage.getItem("student_id");

  // Load active jobs from backend
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await API.get("/jobs");
        setJobs(res.data);
      } catch (err) {
        setMessage("Failed to load jobs.");
        setMessageType("error");
      }
    };

    loadJobs();
  }, []);

  // Apply for a selected job
  const handleApply = async (jobId) => {
    if (!studentId) {
      setMessage("Please login before applying.");
      setMessageType("error");
      return;
    }

    try {
      const res = await API.post("/apply", {
        student_id: Number(studentId),
        job_id: jobId
      });

      setMessage(res.data.message || "Application submitted successfully.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to apply for job.");
      setMessageType("error");
    }
  };

  // Search jobs by title, company, or description
  const filteredJobs = jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.description}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="page-container wide-page">
      <div className="page-header">
        <h1>Browse Jobs</h1>
        <p>Explore active job opportunities and apply directly.</p>
      </div>

      <div className="search-panel">
        <label className="label">Search Jobs</label>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, company, or description"
        />
      </div>

      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

      <div className="card-grid">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div className="job-card" key={job.job_id}>
              <div className="job-card-header">
                <div>
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                </div>

                <span className="match-badge badge-neutral">
                  {job.job_type || "Job"}
                </span>
              </div>

              <div className="job-meta-row">
                {job.hourly_wage && (
                  <span className="score-pill">
                    £{Number(job.hourly_wage).toFixed(2)}/hr
                  </span>
                )}

                <span className="match-badge badge-strong">
                  Job ID: {job.job_id}
                </span>
              </div>

              <p className="job-description">
                {job.description || "No description available."}
              </p>

              <button
                className="apply-button"
                onClick={() => handleApply(job.job_id)}
              >
                Apply Now
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h3>No jobs found</h3>
            <p>Try changing your search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseJobs;