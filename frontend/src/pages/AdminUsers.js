import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PageContainer from "../components/PageContainer";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const role = localStorage.getItem("role");
  const currentUserId = Number(localStorage.getItem("student_id"));

  const roles = ["student", "publisher", "admin"];

  const loadUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to load users"
      );
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadUsers();
  }, [navigate, role]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, {
        role: newRole
      });

      setMessage("User role updated successfully.");
      setMessageType("success");

      await loadUsers();
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to update role"
      );
      setMessageType("error");
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUserId) {
      setMessage("You cannot delete your own admin account.");
      setMessageType("error");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/users/${userId}`);

      setMessage("User deleted successfully.");
      setMessageType("success");

      await loadUsers();
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Failed to delete user"
      );
      setMessageType("error");
    }
  };

  const getRoleClass = (userRole) => {
    if (userRole === "admin") return "status-rejected";
    if (userRole === "publisher") return "status-interview";
    return "status-submitted";
  };

  return (
    <PageContainer
      title="Admin / Manage Users"
      subtitle="View users, update account roles, and remove test accounts."
    >
      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.student_id}>
                <td>{user.student_id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${getRoleClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <select
                    className="admin-select"
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.student_id, e.target.value)
                    }
                  >
                    {roles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="withdraw-button"
                    onClick={() => handleDelete(user.student_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="6">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

export default AdminUsers;