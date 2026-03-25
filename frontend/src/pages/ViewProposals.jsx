import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import zinghrLogo from "../assets/Zing-Logo.png";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

const ViewProposal = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Fetch proposal details by ID
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/proposals/${proposalId}`);
        setProposalData(res.data);
      } catch (err) {
        console.error("Error fetching proposal:", err);
        alert("Failed to load proposal details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [proposalId]);

  // ✅ Handle Approve
  const handleApprove = async () => {
    if (!window.confirm("Are you sure you want to approve this proposal?")) return;
    try {
      setActionLoading(true);
      await axios.put(`${BASE_URL}/api/approvals/approve/${proposalId}`);
      alert("✅ Proposal approved successfully!");
      navigate("/pending-approvals"); // redirect to list
    } catch (err) {
      console.error("Error approving proposal:", err);
      alert("❌ Failed to approve proposal");
    } finally {
      setActionLoading(false);
    }
  };

  // ❌ Handle Reject
  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject this proposal?")) return;
    try {
      setActionLoading(true);
      await axios.put(`${BASE_URL}/api/approvals/reject/${proposalId}`);
      alert("❌ Proposal rejected successfully!");
      navigate("/pending-approvals");
    } catch (err) {
      console.error("Error rejecting proposal:", err);
      alert("⚠️ Failed to reject proposal");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-700">Loading proposal details...</p>;
  if (!proposalData)
    return <p className="text-center text-red-500 mt-10">Proposal not found.</p>;

  const currentDate = proposalData.propDate
    ? new Date(proposalData.propDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="relative min-h-screen bg-gray-50 text-black">
      <Navbar user={user} />

      <main className="pt-24 px-6 md:px-10 max-w-6xl mx-auto">
        {/* --- Header --- */}
        <div className="rounded-2xl shadow-md bg-gradient-to-r from-purple-600 to-purple-800 text-white flex flex-col md:flex-row justify-between items-start md:items-center p-6 mb-8">
          <div>
            <div className="flex items-center mb-2">
              <img src={zinghrLogo} alt="ZingHR Logo" className="w-28 h-auto mr-3" />
              <p className="text-sm opacity-90">Enterprise HCM Solutions</p>
            </div>
            <h2 className="text-2xl font-bold">Value Proposal</h2>
            <p className="text-md mt-1">
              Prepared for:{" "}
              <span className="font-semibold">{proposalData.clientName || "-"}</span>
            </p>
          </div>

          {/* Right-side plan info */}
          <div className="mt-4 md:mt-0 bg-purple-700 bg-opacity-50 px-6 py-3 rounded-xl text-right">
            <h3 className="font-semibold text-lg">{proposalData.planName}</h3>
            <p className="text-sm opacity-90">Advanced HR Suite</p>
            <p className="text-sm mt-2">
              Date: {currentDate}
              <br />
              Proposal #: {proposalData.PropId}
            </p>
          </div>
        </div>

        {/* --- Client Info --- */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-blue-900 mb-6">Client Details</h2>
          <p><strong>Company:</strong> {proposalData.companyName}</p>
          <p><strong>Industry:</strong> {proposalData.industry}</p>
          <p><strong>Region:</strong> {proposalData.custRegion || "India"}</p>
          <p><strong>Total Employees:</strong> {proposalData.totalEmployees}</p>
        </section>

        {/* --- Proposal Info --- */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-blue-900 mb-6">Proposal Details</h2>
          <p><strong>Plan:</strong> {proposalData.planName}</p>
          <p><strong>Status:</strong> {proposalData.status}</p>
          <p><strong>Created:</strong> {currentDate}</p>

          {proposalData.pdfPath && (
            <a
              href={`${BASE_URL}${proposalData.pdfPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              View PDF
            </a>
          )}
        </section>

        {/* --- Approve / Reject Buttons --- */}
        <div className="flex justify-end gap-4 mb-10">
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className={`px-5 py-2 rounded-lg font-semibold shadow-md transition-colors ${
              actionLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {actionLoading ? "Processing..." : "Approve ✅"}
          </button>

          <button
            onClick={handleReject}
            disabled={actionLoading}
            className={`px-5 py-2 rounded-lg font-semibold shadow-md transition-colors ${
              actionLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {actionLoading ? "Processing..." : "Reject ❌"}
          </button>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default ViewProposal;
