import React, { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser } from "../../utils/api";
import api from '../../utils/api';


const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUser(id, newRole);
      loadUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  return (
    <div>
      <h3>User Management</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{u.created_at}</td>
                <td>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
