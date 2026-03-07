import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminProposals = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/proposals/admin/all-proposals"
        );
        setProposals(res.data);
      } catch (err) {
        console.error("Error fetching proposals:", err);
        alert("Failed to fetch proposals");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  if (!user)
    return (
      <p className="p-6 text-gray-700 text-lg font-medium text-center">
        Loading user info...
      </p>
    );

  if (loading)
    return (
      <p className="p-6 text-gray-700 text-lg font-medium text-center">
        Loading proposals...
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 text-black flex flex-col">
      {/* Navbar */}
      <Navbar user={user} />

      <main className="flex-1 p-6 mt-14 md:px-10 flex flex-col items-center">
        <div className="max-w-6xl w-full bg-white shadow-2xl rounded-3xl p-8 border border-blue-200">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-8 text-center">
            All Proposals
          </h1>

          {proposals.length === 0 ? (
            <div className="text-center text-gray-600 mt-10">
              <i className="fas fa-folder-open text-5xl text-blue-400 mb-3"></i>
              <p className="text-lg">No proposals available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-md w-full">
              <table className="w-full border-collapse bg-white text-sm md:text-base rounded-xl">
                <thead className="bg-blue-100 text-blue-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Proposal ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Client Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Company</th>
                    <th className="px-4 py-3 text-left font-semibold">Plan</th>
                    <th className="px-4 py-3 text-left font-semibold">Region</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p, i) => (
                    <tr
                      key={p.proposalId}
                      className={`border-b ${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="px-4 py-3">{p.proposalId}</td>
                      <td className="px-4 py-3">{p.clientName}</td>
                      <td className="px-4 py-3">{p.companyName}</td>
                      <td className="px-4 py-3">{p.planName || "-"}</td>
                      <td className="px-4 py-3">{p.region || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            p.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : p.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : p.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {p.status || "not_submitted"}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-3">
                        {p.pdfUrl ? (
                          <a
                            href={`http://localhost:5000${p.pdfUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white bg-blue-600 hover:bg-green-700 text-center px-4 py-2 rounded-lg transition font-medium"
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-gray-400 px-4 py-2 border border-gray-300 rounded-lg">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminProposals;
