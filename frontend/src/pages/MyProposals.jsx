import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MyProposals = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user?.custId) return; // wait until user is loaded

    const fetchProposals = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/approvals/my-proposals/${user.custId}`
        );
        setProposals(res.data);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [user?.custId]);

  // Apply both status filter and search filter
  const filteredProposals = proposals.filter((p) => {
  // Status filter
  const matchesStatus = filterStatus
    ? (p.status || "not_submitted").toLowerCase() === filterStatus.toLowerCase()
    : true;

  // Exact client name match (case-insensitive)
  const matchesSearch = searchQuery
    ? (p.clientName || "").toLowerCase() === searchQuery.trim().toLowerCase()
    : true;

  return matchesStatus && matchesSearch;
});

  if (!user) return <p className="text-center mt-20 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 text-gray-800">
      <Navbar user={user} />

      <main className="pt-24 px-6 md:px-10 flex flex-col items-center">
        <div className="w-full max-w-7xl bg-white shadow-2xl rounded-3xl p-8 border border-gray-200">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 text-center">
            My Proposals
          </h1>

          {/* Filter & Search Section */}
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-blue-300 rounded-lg p-2 text-sm md:text-base text-blue-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none shadow-sm"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="not_submitted">Not Submitted</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name..."
              className="border border-blue-300 rounded-lg p-2 text-sm md:text-base text-blue-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none shadow-sm w-full md:w-1/2"
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-500 text-lg">Loading proposals...</p>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              <i className="fas fa-folder-open text-6xl text-blue-300 mb-3"></i>
              <p className="text-lg md:text-xl font-medium">No proposals found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200">
              <table className="min-w-full text-left text-sm md:text-base divide-y divide-gray-200">
                <thead className="bg-blue-50 text-blue-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">
                      Client Name
                    </th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">
                      PDF
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProposals.map((p, i) => (
                    <tr
                      key={`${p.proposalId}-${i}`}
                      className={`hover:bg-blue-50 transition duration-200 ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-700">{p.clientName}</td>
                      <td className="px-4 py-3 text-gray-600">{p.companyName}</td>
                      <td className="px-4 py-3 text-gray-600">{p.planName}</td>
                      <td className="px-4 py-3 text-gray-600">{p.region}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
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
                      <td className="px-4 py-3 text-gray-600 font-medium">
                        {p.status === "rejected" ? p.remarks || "No comment provided" : "—"}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        {p.pdfUrl ? (
                          <a
                            href={`http://localhost:5000${p.pdfUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
                          >
                            <i className="fas fa-eye"></i> View
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
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

      <Footer />
    </div>
  );
};

export default MyProposals;