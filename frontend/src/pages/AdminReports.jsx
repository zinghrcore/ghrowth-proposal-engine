// AdminReports.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

const AdminReports = () => {
  const [user, setUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch admin user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }

    const fetchProposals = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/reports/all-proposals"
        );
        setProposals(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  if (!user) return <p className="p-6 text-center">Loading admin info...</p>;
  if (loading) return <p className="p-6 text-center">Loading reports...</p>;

  // Function to render status badges
  const getStatusBadge = (status) => {
    switch ((status || "pending").toLowerCase()) {
      case "approved":
        return (
          <span className="text-green-700 font-semibold bg-green-100 px-2 py-1 rounded">
            Approved ✅
          </span>
        );
      case "rejected":
        return (
          <span className="text-red-700 font-semibold bg-red-100 px-2 py-1 rounded">
            Rejected ❌
          </span>
        );
      default:
        return (
          <span className="text-yellow-700 font-semibold bg-yellow-100 px-2 py-1 rounded">
            Pending ⏳
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        role={user.role}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Navbar user={user} /> {/* Navbar */}

        <main className="flex-1 flex flex-col items-center pt-28 px-6">
          {/* Page Heading */}
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            Admin Reports
          </h1>
          <p className="text-gray-600 mb-8 text-center max-w-xl">
            Review all proposals submitted by customers, their current status, and download PDFs if available.
          </p>

          {/* Proposals Grid */}
          {proposals.length === 0 ? (
            <p className="text-gray-500 text-lg">No proposals found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
              {proposals.map((p) => (
                <div
                  key={p.PropId}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition duration-300 border border-gray-200"
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    {p.clientName}
                  </h2>

                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Company:</span> {p.companyName}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(p.propDate).toLocaleDateString()}
                  </p>
                  <p className="mb-3">Status: {getStatusBadge(p.status)}</p>

                  {p.pdfPath ? (
                    <a
                      href={`http://localhost:5000${p.pdfPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      View PDF
                    </a>
                  ) : (
                    <p className="text-gray-400 text-center mt-2">
                      PDF not available
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AdminReports;
