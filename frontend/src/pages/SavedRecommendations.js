import React, { useEffect, useState } from "react";
import API from "../services/api";
import RecommendationCard from "../components/RecommendationCard";

function SavedRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const studentId = localStorage.getItem("student_id");

  // Load saved recommendations
  useEffect(() => {
    const loadSaved = async () => {
      if (!studentId) {
        setMessage("Please login first.");
        setMessageType("error");
        return;
      }

      try {
        const res = await API.get(`/recommendations/${studentId}`);
        setRecommendations(res.data);

        if (res.data.length === 0) {
          setMessage("No saved recommendations found.");
          setMessageType("error");
        } else {
          setMessage("Saved recommendations loaded successfully.");
          setMessageType("success");
        }
      } catch (err) {
        setMessage("Failed to load saved recommendations.");
        setMessageType("error");
      }
    };

    loadSaved();
  }, [studentId]);

  const topRecommendation =
    recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="page-container recommendations-page">
      {/* HEADER */}
      <div className="page-header">
        <h1>Saved Recommendations</h1>
        <p>
          Review previously generated recommendations based on your skills.
        </p>
      </div>

      {/* STUDENT INFO */}
      <div className="info-box">
  <p>
    <strong>Student Name:</strong>{" "}
    {localStorage.getItem("student_name") || "Not available"}
  </p>

  <p>
    <strong>Email:</strong>{" "}
    {localStorage.getItem("student_email") || "Not available"}
  </p>

  <p>
    <strong>Student ID:</strong>{" "}
    {studentId || "Not available"}
  </p>
</div>

      {/* MESSAGE */}
      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

      {/* TOP MATCH HIGHLIGHT */}
      {topRecommendation && (
        <div className="top-recommendation-card">
          <span className="match-badge badge-top">Top Match</span>

          <h2>{topRecommendation.title}</h2>

          <p className="job-company">
            <strong>Company:</strong> {topRecommendation.company}
          </p>

          <div className="job-meta-row">
            <span className="score-pill">
              {Math.round(
                Number(topRecommendation.score || 0) * 100
              )}% Match
            </span>

            <span className="match-badge badge-neutral">
              Rank #1
            </span>
          </div>

          <p className="meta-text">
            <strong>Generated at:</strong>{" "}
            {topRecommendation.created_at}
          </p>

          <p className="meta-text">
            <strong>Why this match?</strong> Based on skill similarity,
            matched skills, and recommendation score.
          </p>

          <p className="meta-text">
            <strong>Matched Skills:</strong>{" "}
            {topRecommendation.matched_skills?.join(", ") ||
              "No direct matches"}
          </p>
        </div>
      )}

      {/* ALL CARDS */}
      {recommendations.length > 0 ? (
        <div className="card-grid">
          {recommendations.map((item, index) => (
            <RecommendationCard
              key={item.recommendation_id || item.job_id}
              item={item}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No saved recommendations</h3>
          <p>Generate recommendations first.</p>
        </div>
      )}
    </div>
  );
}

export default SavedRecommendations;