import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PageContainer from "../components/PageContainer";

// AdminApplications component
// This page is used by admin and publisher users to view and update job applications.
function AdminApplications() {
  const navigate = useNavigate();

  // Stores all application records loaded from the backend
  const [applications, setApplications] = useState([]);

  // Stores success or error messages shown on the page
  const [message, setMessage] = useState("");

  // Stores message type such as success or error for styling
  const [messageType, setMessageType] = useState("");

  // Get logged-in user role from local storage
  const role = localStorage.getItem("role");

  // Get logged-in user ID from local storage
  const userId = localStorage.getItem("student_id");

  // Function to load applications depending on user role
  const loadApplications = async () => {
    try {
      let res;

      // Admin can view all applications
      if (role === "admin") {
        res = await API.get("/applications/all");

      // Publisher can only view applications for their own posted jobs
      } else if (role === "publisher") {
        res = await API.get(`/applications/publisher/${userId}`);

      // Block access for any other role
      } else {
        setMessage("Access denied.");
        setMessageType("error");
        return;
      }

      // Store returned applications in state
      setApplications(res.data);

      // Show message if no applications exist
      if (res.data.length === 0) {
        setMessage("No applications found.");
        setMessageType("error");
      } else {
        setMessage("");
        setMessageType("");
      }

    } catch (err) {
      // Display error message if API request fails
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to load applications"
      );
      setMessageType("error");
    }
  };

  // Runs when the page loads
  useEffect(() => {
    // Redirect users who are not admin or publisher
    if (role !== "admin" && role !== "publisher") {
      navigate("/login");
      return;
    }

    // Load applications after role validation
    loadApplications();
  }, [navigate, role]);

  // Function to update application status
  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      // Send updated status to backend API
      await API.put(`/applications/${applicationId}/status`, {
        status: newStatus
      });

      // Show success message after update
      setMessage("Application status updated successfully.");
      setMessageType("success");

      // Reload applications to show updated status
      await loadApplications();

    } catch (err) {
      // Display error message if status update fails
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to update application status"
      );
      setMessageType("error");
    }
  };

  // Function to return CSS class based on application status
  const getStatusClass = (status) => {
    switch (status) {
      case "Submitted":
        return "status-submitted";
      case "In Review":
        return "status-review";
      case "Interview":
        return "status-interview";
      case "Accepted":
        return "status-accepted";
      case "Rejected":
        return "status-rejected";
      case "Withdrawn":
        return "status-withdrawn";
      default:
        return "status-default";
    }
  };

  // List of possible application statuses
  const statuses = [
    "Submitted",
    "In Review",
    "Interview",
    "Accepted",
    "Rejected",
    "Withdrawn"
  ];

  return (
    <PageContainer
      title={role === "publisher" ? "Publisher / Applications" : "Admin / Applications"}
      subtitle={
        role === "publisher"
          ? "Review applications submitted for jobs you published."
          : "Review all student applications and update their status."
      }
    >
      {/* Display success or error messages */}
      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

      {/* Display applications table only if applications exist */}
      {applications.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student</th>
                <th>Email</th>
                <th>Job</th>
                <th>Company</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {/* Loop through all applications and display each row */}
              {applications.map((app) => (
                <tr key={app.application_id}>
                  <td>{app.application_id}</td>
                  <td>{app.full_name}</td>
                  <td>{app.email}</td>
                  <td>{app.title}</td>
                  <td>{app.company}</td>

                  {/* Display coloured status badge */}
                  <td>
                    <span className={`status-badge ${getStatusClass(app.status)}`}>
                      {app.status}
                    </span>
                  </td>

                  {/* Dropdown to update application status */}
                  <td>
                    <select
                      className="admin-select"
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app.application_id, e.target.value)
                      }
                    >
                      {/* Display status options */}
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}

// Export component for use in routing
export default AdminApplications;