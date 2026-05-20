import React from "react";

function DashboardSummary({ summary }) {
  if (!summary) return null;

  const topMatch = summary.top_match;
  const topScore = topMatch ? Math.round(Number(topMatch.score) * 100) : null;

  return (
    <div className="dashboard-summary-card">
      <div className="dashboard-summary-grid">
        <div className="summary-box">
          <span className="summary-label">Total Saved Recommendations</span>
          <h3>{summary.total_recommendations}</h3>
        </div>

        <div className="summary-box">
          <span className="summary-label">Current Top Match</span>
          {topMatch ? (
            <>
              <h3>{topMatch.title}</h3>
              <p>{topMatch.company}</p>
              <span className="score-badge">{topScore}% Match</span>
            </>
          ) : (
            <p>No recommendations generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardSummary;