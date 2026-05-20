import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PageContainer from "../components/PageContainer";

function AdminJobs() {
  const navigate = useNavigate();

  // Logged-in user details
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("student_id");

  // Job and skill data
  const [jobs, setJobs] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Skill search and selected skills
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Job form data
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    job_type: "Full-time",
    hourly_wage: "",
    expires_at: ""
  });

  // Feedback messages
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Loads jobs depending on role:
  // Admin sees all jobs, publisher sees only their own jobs.
  const loadJobs = useCallback(async () => {
    try {
      let res;

      if (role === "admin") {
        res = await API.get("/jobs/admin");
      } else if (role === "publisher") {
        res = await API.get(`/jobs/publisher/${userId}`);
      } else {
        setMessage("Access denied.");
        setMessageType("error");
        return;
      }

      setJobs(res.data);
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to load jobs"
      );
      setMessageType("error");
    }
  }, [role, userId]);

  // Loads available skills from database for search suggestions.
  const loadSkills = useCallback(async () => {
    try {
      const res = await API.get("/skills");
      setAvailableSkills(res.data);
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to load skills"
      );
      setMessageType("error");
    }
  }, []);

  // Runs when page loads.
  // Redirects non-admin/non-publisher users.
  useEffect(() => {
    if (role !== "admin" && role !== "publisher") {
      navigate("/login");
      return;
    }

    loadJobs();
    loadSkills();
  }, [navigate, role, loadJobs, loadSkills]);

  // Handles normal form inputs.
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Filters skills while typing.
  const filteredSkills = availableSkills.filter((skill) =>
    skill.skill_name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  // Adds searched/typed skill to selected skills list.
  const handleAddSkill = () => {
    const skillToAdd = selectedSkill || skillSearch.trim().toLowerCase();

    if (!skillToAdd) {
      setMessage("Please search or type a skill first.");
      setMessageType("error");
      return;
    }

    if (selectedSkills.includes(skillToAdd)) {
      setMessage("This skill is already selected.");
      setMessageType("error");
      return;
    }

    setSelectedSkills([...selectedSkills, skillToAdd]);
    setSelectedSkill("");
    setSkillSearch("");
    setMessage("");
    setMessageType("");
  };

  // Removes selected skill chip.
  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Adds job to database.
  const handleAddJob = async () => {
    if (!form.title || !form.company) {
      setMessage("Job title and company are required.");
      setMessageType("error");
      return;
    }

    if (selectedSkills.length === 0) {
      setMessage("Please add at least one skill.");
      setMessageType("error");
      return;
    }

    try {
      const res = await API.post("/jobs", {
        title: form.title,
        company: form.company,
        description: form.description,
        skills: selectedSkills,
        publisher_id: Number(userId),
        expires_at: form.expires_at,
        job_type: form.job_type,
        hourly_wage: form.hourly_wage
      });

      setMessage(res.data.message || "Job added successfully");
      setMessageType("success");

      setForm({
        title: "",
        company: "",
        description: "",
        job_type: "Full-time",
        hourly_wage: "",
        expires_at: ""
      });

      setSelectedSkills([]);
      setSelectedSkill("");
      setSkillSearch("");

      await loadJobs();
      await loadSkills();
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to add job"
      );
      setMessageType("error");
    }
  };

  // Updates job status: active, inactive, expired.
  const handleStatusChange = async (jobId, status) => {
    try {
      await API.put(`/jobs/${jobId}/status`, { status });
      setMessage("Job status updated successfully.");
      setMessageType("success");
      await loadJobs();
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to update job"
      );
      setMessageType("error");
    }
  };

  // Deletes job. Only admin can delete.
  const handleDelete = async (jobId) => {
    if (role !== "admin") {
      setMessage("Only admin can delete jobs.");
      setMessageType("error");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/jobs/${jobId}`);
      setMessage("Job deleted successfully.");
      setMessageType("success");
      await loadJobs();
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to delete job"
      );
      setMessageType("error");
    }
  };

  return (
    <PageContainer
      title={role === "publisher" ? "Publisher / Publish Jobs" : "Admin / Manage Jobs"}
      subtitle={
        role === "publisher"
          ? "Add jobs and manage the jobs you published."
          : "Manage all jobs in the system."
      }
    >
      <div className="admin-form">
        <div className="form-group">
          <label className="label">Job Title</label>
          <input
            className="input"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. IT Technician"
          />
        </div>

        <div className="form-group">
          <label className="label">Company</label>
          <input
            className="input"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="e.g. Google"
          />
        </div>

        <div className="form-group">
          <label className="label">Description</label>
          <input
            className="input"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short job description"
          />
        </div>

        <div className="form-group">
          <label className="label">Job Type</label>
          <select
            className="input"
            name="job_type"
            value={form.job_type}
            onChange={handleChange}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Placement">Placement</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Hourly Wage (£)</label>
          <input
            className="input"
            name="hourly_wage"
            type="number"
            step="0.01"
            value={form.hourly_wage}
            onChange={handleChange}
            placeholder="e.g. 12.50"
          />
        </div>

        <div className="form-group">
          <label className="label">Skills</label>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              className="input"
              value={skillSearch}
              onChange={(e) => {
                setSkillSearch(e.target.value);
                setSelectedSkill("");
              }}
              placeholder="Search or type a new skill, e.g. python"
              style={{ flex: "1" }}
            />

            <button className="button secondary" onClick={handleAddSkill}>
              Add Skill
            </button>
          </div>

          {skillSearch && (
            <div className="skill-suggestions">
              {filteredSkills.length > 0 ? (
                filteredSkills.slice(0, 6).map((skill) => (
                  <button
                    key={skill.skill_id}
                    type="button"
                    className="skill-suggestion-button"
                    onClick={() => {
                      setSelectedSkill(skill.skill_name);
                      setSkillSearch(skill.skill_name);
                    }}
                  >
                    {skill.skill_name}
                  </button>
                ))
              ) : (
                <p className="empty-text">
                  No existing skill found. You can add it as a new skill.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="job-section">
          <p className="section-label">Selected Skills</p>

          <div className="skills-row">
            {selectedSkills.length > 0 ? (
              selectedSkills.map((skill, index) => (
                <span key={index} className="skill-chip matched-chip">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    style={{
                      marginLeft: "8px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="empty-text">No skills selected yet.</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="label">Expiry Date</label>
          <input
            className="input"
            name="expires_at"
            type="date"
            value={form.expires_at}
            onChange={handleChange}
          />
        </div>

        <button className="button primary" onClick={handleAddJob}>
          Add Job
        </button>
      </div>

      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

      <div className="section-heading">Jobs</div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Company</th>
              <th>Type</th>
              <th>Wage</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Publisher</th>
              {role === "admin" && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr key={job.job_id}>
                <td>{job.job_id}</td>
                <td>{job.title}</td>
                <td>{job.company}</td>
                <td>{job.job_type || "N/A"}</td>
                <td>
                  {job.hourly_wage
                    ? `£${Number(job.hourly_wage).toFixed(2)}/hr`
                    : "N/A"}
                </td>
                <td>{job.expires_at || "No expiry"}</td>
                <td>
                  <select
                    className="admin-select"
                    value={job.status || "active"}
                    onChange={(e) =>
                      handleStatusChange(job.job_id, e.target.value)
                    }
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="expired">expired</option>
                  </select>
                </td>
                <td>{job.publisher_id || "N/A"}</td>

                {role === "admin" && (
                  <td>
                    <button
                      className="withdraw-button"
                      onClick={() => handleDelete(job.job_id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {jobs.length === 0 && (
              <tr>
                <td colSpan={role === "admin" ? "9" : "8"}>
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

export default AdminJobs;