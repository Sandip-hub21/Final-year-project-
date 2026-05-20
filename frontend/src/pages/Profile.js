import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import heroImage from "../assets/graduate.jpg";

function Profile() {
  // Used to redirect the student after saving skills
  const navigate = useNavigate();

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Logged-in student details from localStorage
  const studentId = localStorage.getItem("student_id");
  const studentName = localStorage.getItem("student_name") || "Not available";
  const studentEmail = localStorage.getItem("student_email") || "Not available";

  // Load skills and dashboard statistics when the page opens
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const res = await API.get("/skills");
        setAvailableSkills(res.data);
      } catch (err) {
        setMessage("Failed to load skills");
        setMessageType("error");
      }
    };

    const loadProfileStats = async () => {
      if (!studentId) return;

      try {
        const applicationsRes = await API.get(`/applications/${studentId}`);
        setAppliedJobsCount(applicationsRes.data.length || 0);
      } catch (err) {
        setAppliedJobsCount(0);
      }

      try {
        const savedRes = await API.get(`/saved-recommendations/${studentId}`);
        setSavedJobsCount(savedRes.data.length || 0);
      } catch (err) {
        setSavedJobsCount(0);
      }
    };

    loadSkills();
    loadProfileStats();
  }, [studentId]);

  // Add selected skill to the selected skills list
  const handleAddSkill = () => {
    if (!selectedSkill) {
      setMessage("Please choose a skill first.");
      setMessageType("error");
      return;
    }

    if (selectedSkills.includes(selectedSkill)) {
      setMessage("This skill is already selected.");
      setMessageType("error");
      return;
    }

    setSelectedSkills([...selectedSkills, selectedSkill]);
    setSelectedSkill("");
    setMessage("");
  };

  // Remove a skill from the selected skills list
  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Save selected skills into the database
  const handleSaveSkills = async () => {
    if (!studentId) {
      setMessage("Please login first.");
      setMessageType("error");
      return;
    }

    if (selectedSkills.length === 0) {
      setMessage("Please add at least one skill.");
      setMessageType("error");
      return;
    }

    try {
      const res = await API.post(`/student/${studentId}/skills`, {
        skills: selectedSkills
      });

      setMessage(res.data.message || "Skills saved successfully.");
      setMessageType("success");

      // Redirect to recommendations page after saving skills
      setTimeout(() => {
        navigate("/recommendations");
      }, 1500);
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to save skills"
      );
      setMessageType("error");
    }
  };

  // Calculate simple profile completion score
  const profileCompletion =
    studentId && studentName !== "Not available" && studentEmail !== "Not available"
      ? selectedSkills.length > 0
        ? 100
        : 70
      : 40;

  // Simple career readiness status based on selected skills
  const careerReadiness =
    selectedSkills.length >= 5
      ? "Strong Match Candidate"
      : selectedSkills.length >= 3
      ? "Good Progress"
      : "Needs More Skills";

  return (
    <div
      className="auth-wrapper"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="auth-overlay">
        <div className="auth-card profile-card">
          <h1>Profile / Skills</h1>

          <p className="auth-subtitle">
            Select skills from the dropdown to build your student profile.
          </p>

          {/* Main laptop/desktop layout */}
          <div className="profile-main-layout">

            {/* LEFT SIDE: Student information and dashboard stats */}
            <div>
              <div className="info-box">
                <p><strong>Student Name:</strong> {studentName}</p>
                <p><strong>Email:</strong> {studentEmail}</p>
                <p><strong>Student ID:</strong> {studentId || "Not available"}</p>
              </div>

              <div className="profile-stats-grid">
                <div className="profile-stat-card">
                  <span>Applied Jobs</span>
                  <strong>{appliedJobsCount}</strong>
                </div>

                <div className="profile-stat-card">
                  <span>Saved Jobs</span>
                  <strong>{savedJobsCount}</strong>
                </div>

                <div className="profile-stat-card">
                  <span>Skills Added</span>
                  <strong>{selectedSkills.length}</strong>
                </div>

                <div className="profile-stat-card">
                  <span>Profile Completion</span>
                  <strong>{profileCompletion}%</strong>
                </div>
              </div>

              <div className="career-readiness-box">
                <strong>Career Readiness:</strong> {careerReadiness}
              </div>
            </div>

            {/* RIGHT SIDE: Skill selection form */}
            <div>
              <div className="form-group">
                <label className="label">Choose Skill</label>

                <div className="skill-input-row">
                  <select
                    className="input"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  >
                    <option value="">Select a skill</option>

                    {availableSkills.map((skill) => (
                      <option
                        key={skill.skill_id}
                        value={skill.skill_name}
                      >
                        {skill.skill_name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="button secondary"
                    onClick={handleAddSkill}
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Selected Skills</label>

                <div className="skills-row">
                  {selectedSkills.length > 0 ? (
                    selectedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="skill-chip matched-chip"
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="chip-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="empty-text">
                      No skills selected yet.
                    </span>
                  )}
                </div>
              </div>

              <button
                className="button primary auth-button"
                onClick={handleSaveSkills}
              >
                Save Skills
              </button>

              {message && (
                <div className={`message-box ${messageType}`}>
                  {message}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;