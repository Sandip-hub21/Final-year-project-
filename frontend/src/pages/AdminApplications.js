import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PageContainer from "../components/PageContainer";

function AdminApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("student_id");

  const loadApplications = async () => {
    try {
      let res;

      if (role === "admin") {
        res = await API.get("/applications/all");
      } else if (role === "publisher") {
        res = await API.get(`/applications/publisher/${userId}`);
      } else {
        setMessage("Access denied.");
        setMessageType("error");
        return;
      }

      setApplications(res.data);

      if (res.data.length === 0) {
        setMessage("No applications found.");
        setMessageType("error");
      } else {
        setMessage("");
        setMessageType("");
      }
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to load applications"
      );
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (role !== "admin" && role !== "publisher") {
      navigate("/login");
      return;
    }

    loadApplications();
  }, [navigate, role]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await API.put(`/applications/${applicationId}/status`, {
        status: newStatus
      });

      setMessage("Application status updated successfully.");
      setMessageType("success");

      await loadApplications();
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to update application status"
      );
      setMessageType("error");
    }
  };

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
      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

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
              {applications.map((app) => (
                <tr key={app.application_id}>
                  <td>{app.application_id}</td>
                  <td>{app.full_name}</td>
                  <td>{app.email}</td>
                  <td>{app.title}</td>
                  <td>{app.company}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app.application_id, e.target.value)
                      }
                    >
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

export default AdminApplications;