import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Kursus() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [showModal, setShowModal] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await axios.get(
            "http://localhost:8000/api/get-courses",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCourses(response.data.data);
        } else {
          setError("No token found");
        }
      } catch (error) {
        setError("Failed to load courses data");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleAddCourse = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No token found");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/courses",
        newCourse,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCourses([...courses, response.data]);
      setNewCourse({ title: "", description: "" });
      setShowModal(false);

      Swal.fire({
        icon: "success",
        title: "Course added successfully!",
        text: "The course has been successfully added.",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      setError("Failed to add course");
      Swal.fire({
        icon: "error",
        title: "Failed to add course",
        text: "There was an error while adding the course.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDeleteCourse = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !courseToDelete) {
      setError("No token found or no course to delete");
      return;
    }

    try {
      console.log("Deleting course with UUID:", courseToDelete);
      const response = await axios.delete(
        `http://localhost:8000/api/delete-course/${courseToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCourses(
        courses.filter((course) => course.uuid_course !== courseToDelete)
      );
      setShowDeleteModal(false);

      Swal.fire({
        icon: "success",
        title: "Course deleted successfully!",
        text: "The course has been successfully deleted.",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error(error);
      setError("Failed to delete course");
      Swal.fire({
        icon: "error",
        title: "Failed to delete course",
        text: "There was an error while deleting the course.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleEditCourse = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !courseToEdit) {
      setError("No token found or no course to edit");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/api/update-course/${courseToEdit.uuid_course}`,
        {
          title: courseToEdit.title,
          description: courseToEdit.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCourses(
        courses.map((course) =>
          course.uuid_course === courseToEdit.uuid_course
            ? response.data
            : course
        )
      );
      setCourseToEdit(null);
      setShowEditModal(false);

      Swal.fire({
        icon: "success",
        title: "Course updated successfully!",
        text: "The course has been updated.",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      setError("Failed to update course");
      Swal.fire({
        icon: "error",
        title: "Failed to update course",
        text: "There was an error while updating the course.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Daftar Kursus</h2>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600"
      >
        Back to Dashboard
      </button>

      <button
        onClick={() => setShowModal(true)}
        className="mb-4 ml-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Add Course
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Course Title</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Instructor Name</th>
                <th className="px-4 py-2 text-left">Create</th>
                <th className="px-4 py-2 text-left">Update</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.uuid_course}
                  className="border-b hover:bg-gray-100"
                >
                  <td className="px-4 py-2">{course.title}</td>
                  <td className="px-4 py-2">{course.description}</td>
                  <td className="px-4 py-2">{course.instructor.name}</td>
                  <td className="px-4 py-2">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {course.updated_at
                      ? new Date(course.updated_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => {
                        setCourseToEdit(course);
                        setShowEditModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setCourseToDelete(course.uuid_course); 
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 ml-2"
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Tambah Kursus Baru</h3>
            <input
              type="text"
              value={newCourse.title}
              onChange={(e) =>
                setNewCourse({ ...newCourse, title: e.target.value })
              }
              placeholder="Title"
              className="px-4 py-2 mb-2 w-full border border-gray-300 rounded-md"
            />
            <textarea
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
              placeholder="Description"
              className="px-4 py-2 mb-2 w-full border border-gray-300 rounded-md"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Edit Kursus</h3>
            <input
              type="text"
              value={courseToEdit?.title}
              onChange={(e) =>
                setCourseToEdit({ ...courseToEdit, title: e.target.value })
              }
              placeholder="Title"
              className="px-4 py-2 mb-2 w-full border border-gray-300 rounded-md"
            />
            <textarea
              value={courseToEdit?.description}
              onChange={(e) =>
                setCourseToEdit({
                  ...courseToEdit,
                  description: e.target.value,
                })
              }
              placeholder="Description"
              className="px-4 py-2 mb-2 w-full border border-gray-300 rounded-md"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCourse}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this course?</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Kursus;
