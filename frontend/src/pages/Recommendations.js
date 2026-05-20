import React, { useEffect, useState } from "react";
import API from "../services/api";
import RecommendationCard from "../components/RecommendationCard";

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Get logged-in student details from localStorage
  const studentId = localStorage.getItem("student_id");
  const studentName = localStorage.getItem("student_name") || "Not available";
  const studentEmail = localStorage.getItem("student_email") || "Not available";

  // Generate new recommendations and then load them
  const handleGenerate = async () => {
    if (!studentId) {
      setMessage("Please login first.");
      setMessageType("error");
      return;
    }

    try {
      // First generate recommendations
      await API.post(`/recommend/${studentId}`);

      // Then fetch saved/generated recommendations
      const res = await API.get(`/recommendations/${studentId}`);

      setRecommendations(res.data);
      setMessage("Recommendations loaded successfully.");
      setMessageType("success");
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to load recommendations"
      );
      setMessageType("error");
    }
  };

  useEffect(() => {
    // Auto-load existing recommendations when the page opens
    const loadExisting = async () => {
      if (!studentId) return;

      try {
        const res = await API.get(`/recommendations/${studentId}`);
        setRecommendations(res.data);
      } catch {
        // Do nothing on first load if no recommendations exist yet
      }
    };

    loadExisting();
  }, [studentId]);

  // Highest-ranked recommendation
  const topRecommendation =
    recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="page-container recommendations-page">
      <div className="page-header">
        <h1>Recommendations</h1>
        <p>
          Generate and review the most relevant jobs based on your selected skills.
        </p>
      </div>

      {/* Student information and generate button */}
      <div className="info-box recommendation-info">
        <div>
          <p>
            <strong>Student Name:</strong> {studentName}
          </p>

          <p>
            <strong>Email:</strong> {studentEmail}
          </p>

          <p>
            <strong>Student ID:</strong> {studentId || "Not available"}
          </p>
        </div>

        <button className="button primary" onClick={handleGenerate}>
          Generate Recommendations
        </button>
      </div>

      {/* Success or error message */}
      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

      {/* Top recommendation section */}
      {topRecommendation && (
        <div className="top-recommendation-card">
          <span className="match-badge badge-top">Top Recommendation</span>

          <h2>{topRecommendation.title}</h2>

          <p className="job-company">
            <strong>Company:</strong> {topRecommendation.company}
          </p>

          <p className="meta-text">
            This is currently the highest-ranked opportunity for your student profile.
          </p>

          <p className="meta-text">
            <strong>Why this match?</strong> Based on your skills alignment,
            matched skills, and similarity score.
          </p>

          <div className="job-meta-row">
            <span className="score-pill">
              {Math.round(Number(topRecommendation.score || 0) * 100)}% Match
            </span>

            {topRecommendation.job_type && (
              <span className="match-badge badge-neutral">
                {topRecommendation.job_type}
              </span>
            )}

            {topRecommendation.hourly_wage && (
              <span className="match-badge badge-strong">
                £{Number(topRecommendation.hourly_wage).toFixed(2)}/hr
              </span>
            )}
          </div>

          <p className="meta-text">
            <strong>Matched Skills:</strong>{" "}
            {topRecommendation.matched_skills?.length > 0
              ? topRecommendation.matched_skills.join(", ")
              : "No direct matched skills"}
          </p>

          <p className="meta-text">
            <strong>Missing Skills:</strong>{" "}
            {topRecommendation.missing_skills?.length > 0
              ? topRecommendation.missing_skills.join(", ")
              : "No major skill gap"}
          </p>
        </div>
      )}

      <div className="section-heading">All Ranked Recommendations</div>

      {/* All recommendation cards */}
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
          <h3>No recommendations yet</h3>
          <p>
            Add your skills in Profile, then generate recommendations here.
          </p>
        </div>
      )}
    </div>
  );
}

export default Recommendations;