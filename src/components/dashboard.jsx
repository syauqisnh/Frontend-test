import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUser(decodedToken);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }

    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/get-courses', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            page,
            limit: 5
          }
        });

        setCourses(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [page]);

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const uuid_user = decodedToken.uuid_user;

        const response = await axios.delete('http://localhost:8000/api/logout', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: { uuid_user }
        });

        if (response.data.data === "Sukses Logout") {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-72 bg-blue-800 text-white p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-8 text-center">Course Syauqi</h2>
        <ul className="space-y-6">
          <li>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
              Home
            </button>
          </li>
          {user && user.role === 'INSTRUCTOR' && (
            <>
              <li>
                <button 
                  onClick={() => navigate('/datauser')}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                  Data User
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/datakursus')}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                  Setting Kursus
                </button>
              </li>
            </>
          )}
          {user && (
            <li>
              <button 
                onClick={openModal} 
                className="w-full text-left px-4 py-2 mt-6 bg-white text-blue-700 rounded-lg hover:bg-blue-500 transition duration-300">
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Daftar Kursus</h3>
          {user && (
            <div className="text-sm text-right">
              <p className="font-semibold text-gray-700">{user.name}</p>
              <p className="font-semibold text-gray-500">{user.role}</p>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Course Title</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Instructor Name</th>
                <th className="px-4 py-2 text-left">Create</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id_course} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{course.title}</td>
                  <td className="px-4 py-2">{course.description}</td>
                  <td className="px-4 py-2">{course.instructor ? course.instructor.name : 'N/A'}</td>
                  <td className="px-4 py-2">{new Date(course.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center space-x-4 items-center">
          <button 
            onClick={prevPage} 
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 disabled:opacity-50"
            disabled={page === 1}>
            Previous
          </button>

          <span className="text-lg font-semibold text-gray-700">
            {`Page ${page} of ${totalPages}`}
          </span>

          <button 
            onClick={nextPage} 
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 disabled:opacity-50"
            disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800">Are you sure you want to log out?</h3>
            <div className="mt-4 flex justify-end space-x-4">
              <button 
                onClick={closeModal} 
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400">
                Cancel
              </button>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
