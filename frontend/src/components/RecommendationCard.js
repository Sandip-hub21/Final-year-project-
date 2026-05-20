import React, { useState } from "react";
import API from "../services/api";

function RecommendationCard({ item, index = 0 }) {
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");

  const scorePercent = Math.round(Number(item.score || 0) * 100);

  let badgeText = "Potential Match";
  let badgeClass = "badge-neutral";

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

  const handleApply = async () => {
    const studentId = localStorage.getItem("student_id");

    if (!studentId) {
      setApplyError("Please login before applying.");
      setApplyMessage("");
      return;
    }

    try {
      const res = await API.post("/apply", {
        student_id: Number(studentId),
        job_id: item.job_id
      });

      setApplyMessage(res.data.message || "Application submitted successfully");
      setApplyError("");
    } catch (err) {
      setApplyError(
        err.response?.data?.error ||
        err.message ||
        "Failed to submit application"
      );
      setApplyMessage("");
    }
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div>
          <h3 className="job-title">{item.title}</h3>
          <p className="job-company">{item.company}</p>
        </div>

        <div className={`match-badge ${badgeClass}`}>
          {badgeText}
        </div>
      </div>

      <div className="job-meta-row">
        <span className="score-pill">{scorePercent}% Match</span>
        <span className="job-rank">Rank #{index + 1}</span>
      </div>

      {item.created_at && (
        <p className="meta-text">
          <strong>Generated at:</strong> {item.created_at}
        </p>
      )}

      <p className="job-description">
        {item.description || "No job description available for this role."}
      </p>

      <p className="meta-text">
        <strong>Why this match?</strong> Based on skill similarity, matched skills, and recommendation score.
      </p>

      <div className="job-section">
        <p className="section-label">Matched Skills</p>
        <div className="skills-row">
          {item.matched_skills?.length > 0 ? (
            item.matched_skills.map((skill, idx) => (
              <span key={idx} className="skill-chip matched-chip">
                {skill}
              </span>
            ))
          ) : (
            <span className="empty-text">No direct matched skills</span>
          )}
        </div>
      </div>

      <div className="job-section">
        <p className="section-label">Missing Skills (What to improve)</p>
        <div className="skills-row">
          {item.missing_skills?.length > 0 ? (
            item.missing_skills.map((skill, idx) => (
              <span key={idx} className="skill-chip missing-chip">
                {skill}
              </span>
            ))
          ) : (
            <span className="empty-text">No major skill gap</span>
          )}
        </div>
      </div>

      <div className="job-footer">
        <p className="job-footer-text">
          {item.matched_skill_count || 0} matched out of {item.job_skill_count || 0} required skills
        </p>

        <button className="apply-button" onClick={handleApply}>
          Apply Now
        </button>
      </div>

      {applyMessage && (
        <div className="message-box success" style={{ marginTop: "14px" }}>
          {applyMessage}
        </div>
      )}

      {applyError && (
        <div className="message-box error" style={{ marginTop: "14px" }}>
          {applyError}
        </div>
      )}
    </div>
  );
}

export default RecommendationCard;