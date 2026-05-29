import React, { useState } from "react";
import API from "../services/api";

// Recommendation Card Component
// Displays recommended job details, match score,
// matched skills, missing skills and allows students to apply.
function RecommendationCard({ item, index = 0 }) {

  // State for success message after applying
  const [applyMessage, setApplyMessage] = useState("");

  // State for error message if application fails
  const [applyError, setApplyError] = useState("");

  // Convert recommendation score into percentage
  const scorePercent = Math.round(Number(item.score || 0) * 100);

  // Default badge values
  let badgeText = "Potential Match";
  let badgeClass = "badge-neutral";

  // Assign badge based on ranking and score
  if (index === 0) {
    badgeText = "Top Match";
    badgeClass = "badge-top";
  } else if (scorePercent >= 70) {
    badgeText = "Excellent Match";
    badgeClass = "badge-top";
  } else if (scorePercent >= 40) {
    badgeText = "Strong Match";
    badgeClass = "badge-strong";
  } else if (scorePercent >= 20) {
    badgeText = "Moderate Match";
    badgeClass = "badge-medium";
  }

  // Function to submit job application
  const handleApply = async () => {

    // Retrieve logged-in student ID from local storage
    const studentId = localStorage.getItem("student_id");

    // Prevent application if user is not logged in
    if (!studentId) {
      setApplyError("Please login before applying.");
      setApplyMessage("");
      return;
    }

    try {

      // Send application request to backend API
      const res = await API.post("/apply", {
        student_id: Number(studentId),
        job_id: item.job_id
      });

      // Display success message
      setApplyMessage(res.data.message || "Application submitted successfully");
      setApplyError("");

    } catch (err) {

      // Display error message if application fails
      setApplyError(
        err.response?.data?.error ||
        err.message ||
        "Failed to submit application"
      );

      setApplyMessage("");
    }
  };

  return (

    // Main recommendation card container
    <div className="job-card">

      {/* Job title, company and match badge */}
      <div className="job-card-header">
        <div>
          <h3 className="job-title">{item.title}</h3>
          <p className="job-company">{item.company}</p>
        </div>

        <div className={`match-badge ${badgeClass}`}>
          {badgeText}
        </div>
      </div>

      {/* Match percentage and ranking */}
      <div className="job-meta-row">
        <span className="score-pill">{scorePercent}% Match</span>
        <span className="job-rank">Rank #{index + 1}</span>
      </div>

      {/* Recommendation generation timestamp */}
      {item.created_at && (
        <p className="meta-text">
          <strong>Generated at:</strong> {item.created_at}
        </p>
      )}

      {/* Job description */}
      <p className="job-description">
        {item.description || "No job description available for this role."}
      </p>

      {/* Recommendation explanation */}
      <p className="meta-text">
        <strong>Why this match?</strong> Based on skill similarity, matched skills, and recommendation score.
      </p>

      {/* Matched Skills Section */}
      <div className="job-section">
        <p className="section-label">Matched Skills</p>

        <div className="skills-row">
          {item.matched_skills?.length > 0 ? (

            // Display matched skills
            item.matched_skills.map((skill, idx) => (
              <span key={idx} className="skill-chip matched-chip">
                {skill}
              </span>
            ))

          ) : (

            // Display if no matched skills found
            <span className="empty-text">No direct matched skills</span>

          )}
        </div>
      </div>

      {/* Missing Skills Section */}
      <div className="job-section">
        <p className="section-label">Missing Skills (What to improve)</p>

        <div className="skills-row">
          {item.missing_skills?.length > 0 ? (

            // Display missing skills
            item.missing_skills.map((skill, idx) => (
              <span key={idx} className="skill-chip missing-chip">
                {skill}
              </span>
            ))

          ) : (

            // Display if no major skill gap exists
            <span className="empty-text">No major skill gap</span>

          )}
        </div>
      </div>

      {/* Footer section */}
      <div className="job-footer">

        {/* Display recommendation statistics */}
        <p className="job-footer-text">
          {item.matched_skill_count || 0} matched out of {item.job_skill_count || 0} required skills
        </p>

        {/* Apply button */}
        <button className="apply-button" onClick={handleApply}>
          Apply Now
        </button>
      </div>

      {/* Success message */}
      {applyMessage && (
        <div className="message-box success" style={{ marginTop: "14px" }}>
          {applyMessage}
        </div>
      )}

      {/* Error message */}
      {applyError && (
        <div className="message-box error" style={{ marginTop: "14px" }}>
          {applyError}
        </div>
      )}
    </div>
  );
}

// Export component for use in other pages
export default RecommendationCard;