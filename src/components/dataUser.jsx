import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function DataUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
      name: "",
      email: "",
      password: "",
      role: "",
    });
    const [editUser, setEditUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (token) {
            const response = await axios.get("http://localhost:8000/api/getAll", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setUsers(response.data);
          } else {
            console.error("No token found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Failed to load data");
        } finally {
          setLoading(false);
        }
      };
  
      fetchUsers();
    }, []);
  
    const openAddModal = () => {
      setIsAddModalOpen(true);
    };
  
    const closeAddModal = () => {
      setIsAddModalOpen(false);
    };
  
    const openEditModal = (user) => {
      setEditUser(user);
      setIsEditModalOpen(true);
    };
  
    const closeEditModal = () => {
      setIsEditModalOpen(false);
    };
  
    const openDeleteModal = (user) => {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
    };
  
    const closeDeleteModal = () => {
      setIsDeleteModalOpen(false);
    };
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewUser({ ...newUser, [name]: value });
    };
  
    const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setEditUser({ ...editUser, [name]: value });
      console.log(editUser);
    };
  
    const handleAddUserSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await axios.post(
            "http://localhost:8000/api/users",
            newUser,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          setUsers([...users, response.data]);
  
          Swal.fire({
            title: "Success!",
            text: "User added successfully!",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload();
          });
  
          closeAddModal();
        } else {
          console.error("No token found");
        }
      } catch (error) {
        console.error("Error adding user:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add user.",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload();
        });
      }
    };
  
    const handleEditUserSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const token = localStorage.getItem("authToken");
        if (token && editUser) {
          const { uuid_user, created_at, updated_at, ...updatedData } = editUser;
  
          console.log(updatedData);
  
          const response = await axios.put(
            `http://localhost:8000/api/update-user/${uuid_user}`,
            updatedData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
  
          setUsers(
            users.map((user) =>
              user.uuid_user === uuid_user ? response.data : user
            )
          );
          Swal.fire({
            title: "Success!",
            text: "User updated successfully!",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => window.location.reload());
        } else {
          console.error("No token or user data found");
        }
      } catch (error) {
        console.error(
          "Error updating user:",
          error.response ? error.response.data : error.message
        );
        Swal.fire({
          title: "Error!",
          text: "Failed to update user.",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => window.location.reload());
      }
    };
  
    const handleDeleteUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
  
        if (token && userToDelete) {
          const response = await axios.delete(
            `http://localhost:8000/api/delete-user/${userToDelete.uuid_user}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          console.log(response);
  
          setUsers(
            users.filter((user) => user.uuid_user !== userToDelete.uuid_user)
          );
  
          Swal.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload();
          });
  
          closeDeleteModal();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
  
        Swal.fire({
          title: "Error!",
          text: "Failed to delete user.",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload();
        });
      }
    };
  
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Data User</h2>
  
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-4 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600"
            >
              Back to Dashboard
            </button>
  
            <button
              onClick={openAddModal}
              className="mb-4 ml-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Data User
            </button>
  
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Create</th>
                  <th className="px-4 py-2 text-left">Update</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uuid_user} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.role}</td>
                    <td className="px-4 py-2">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {user.updated_at
                        ? new Date(user.updated_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
  
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Add Data User</h3>
  
              <form onSubmit={handleAddUserSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
  
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
  
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
  
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="INSTRUCTOR">INSTRUCTOR</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </div>
  
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Edit User</h3>
  
              <form onSubmit={handleEditUserSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editUser.name}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
  
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editUser.email}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
  
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editUser.password}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
  
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={editUser.role}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="INSTRUCTOR">INSTRUCTOR</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </div>
  
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Delete User</h3>
  
              <p>Are you sure you want to delete this user?</p>
  
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
  
  export default DataUser;
  