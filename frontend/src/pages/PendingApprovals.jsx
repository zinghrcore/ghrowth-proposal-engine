// PendingApprovals.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

const PendingApprovals = () => {
  const [user, setUser] = useState(null);
  const [pendingProposals, setPendingProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectComment, setRejectComment] = useState('');
const [rejectingProposalId, setRejectingProposalId] = useState(null);


  // ✅ Fetch pending approvals
  const fetchPending = async (custId) => {
  if (!custId) return;
  try {
    const res = await axios.get(
      `${BASE_URL}/api/approvals/pending-approvals/${custId}`
    );
    console.log("Fetched proposals:", res.data);
    setPendingProposals(res.data); // ✅ only this line
  } catch (err) {
    console.error('Error fetching pending approvals:', err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchPending(storedUser.custId);
    }
  }, []);

  // ✅ Approve Proposal
  const handleApprove = async (proposalId) => {
    try {
      await axios.put(`${BASE_URL}/api/approvals/approve/${proposalId}`);
      alert('✅ Proposal approved successfully!');
      fetchPending(user.custId);
    } catch (err) {
      console.error('Error approving proposal:', err.response?.data || err.message);
      alert('❌ Failed to approve proposal');
    }
  };

  // ❌ Reject Proposal
  const handleReject = async () => {
  if (!rejectingProposalId) return;
  if (!rejectComment.trim()) {
    alert("Please provide a comment before rejecting.");
    return;
  }

  try {
    await axios.put(`${BASE_URL}/api/approvals/reject/${rejectingProposalId}`, {
      comment: rejectComment.trim()
    });
    alert('❌ Proposal rejected successfully!');
    fetchPending(user.custId);
  } catch (err) {
    console.error('Error rejecting proposal:', err.response?.data || err.message);
    alert('⚠️ Failed to reject proposal');
  } finally {
    setRejectingProposalId(null);
    setRejectComment('');
  }
};


  if (!user) return <p className="p-6 text-center">Loading approver info...</p>;
  if (loading) return <p className="p-6 text-center">Loading pending approvals...</p>;

 return (
  <div className="flex min-h-screen bg-gray-50">
    <div className="flex-1 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 flex flex-col items-center pt-28 px-6">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-blue-800 mb-8">All Proposals</h1>

        {loading ? (
          <p className="text-gray-500">Loading pending approvals...</p>
        ) : pendingProposals.length === 0 ? (
          <p className="text-gray-600 text-lg">No proposals available.</p>
        ) : (
          <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-blue-50 text-blue-900 text-base">
                <tr>
                  <th className="px-6 py-3 font-semibold">Proposal ID</th>
                  <th className="px-6 py-3 font-semibold">Client Name</th>
                  <th className="px-6 py-3 font-semibold">Company</th>
                  <th className="px-6 py-3 font-semibold">Plan</th>
                  <th className="px-6 py-3 font-semibold">Region</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pendingProposals.map((proposal, index) => (
                  <tr
                    key={proposal.proposalId || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {proposal.proposalId || "-"}
                    </td>
                    <td className="px-6 py-3">{proposal.clientName || "-"}</td>
                    <td className="px-6 py-3">{proposal.companyName || "-"}</td>
                    <td className="px-6 py-3">{proposal.planName || "-"}</td>
                    <td className="px-6 py-3">{proposal.proposalRegion || proposal.region || "N/A"}</td>

                    {/* Status badge */}
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          proposal.status?.toLowerCase() === "approved"
                            ? "bg-green-100 text-green-700"
                            : proposal.status?.toLowerCase() === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {proposal.status || "pending"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 text-center">
                      <div className="flex justify-center items-center gap-2 flex-wrap">
                        {/* View PDF */}
                        <button
                          onClick={() =>
                            window.open(
                              `/view-proposal/${proposal.proposalId}?mode=view`,
                              "_blank"
                            )
                          }
                          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
                        >
                          View PDF
                        </button>

                        {/* Approve */}
                        <button
                          onClick={() => handleApprove(proposal.proposalId)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition"
                        >
                          Approve
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => {
                            setRejectingProposalId(proposal.proposalId);
                            setRejectComment("");
                          }}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectingProposalId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-blue-700 mb-3">
              Reason for Rejection
            </h2>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
              placeholder="Enter reason for rejection"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingProposalId(null);
                  setRejectComment("");
                }}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  </div>
);

};

export default PendingApprovals;
