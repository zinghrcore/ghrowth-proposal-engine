import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BASE_URL = process.env.REACT_APP_API_URL;

const ContactInformation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [clientInfo, setClientInfo] = useState(null);

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem("clientInfo")) || null;
    if (!info || !info.custName) {
      alert("Please fill in client information first.");
      navigate("/client-info");
    } else {
      setClientInfo(info);
    }
  }, [navigate]);

  // Client SPOC
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientMobile, setClientMobile] = useState("");

  // ZingHR POC
  const [zinghrName, setZinghrName] = useState("");
  const [zinghrEmail, setZinghrEmail] = useState("");
  const [zinghrMobile, setZinghrMobile] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const handleGenerateProposal = async () => {
    if (!clientInfo || !clientInfo.custName) {
      alert("Please fill in client information first.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...clientInfo, // client info from previous page
        clientSPOC: { name: clientName, email: clientEmail, mobile: clientMobile },
        zinghrSPOC: { name: zinghrName, email: zinghrEmail, mobile: zinghrMobile },
      };

      // ✅ Save contact details in localStorage for ProposalPage
      localStorage.setItem(
        "contactData",
        JSON.stringify({
          client: {
            name: clientName,
            email: clientEmail,
            mobile: clientMobile,
          },
          zinghr: {
            name: zinghrName,
            email: zinghrEmail,
            mobile: zinghrMobile,
          },
        })
      );

      // Save to backend
      const res = await axios.post(
        `${BASE_URL}/api/customers/saveClientInformation`,
        payload
      );

      console.log("✅ Client info saved:", res.data);

      // ✅ Navigate directly (removed success alert)
      navigate("/proposal");
    } catch (error) {
      console.error("❌ Error saving client info:", error);
      alert("Failed to save client info. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 text-black">
      <Navbar user={user} />

      <main className="flex-grow pt-20 px-6 md:px-10">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-10 text-center">
          Contact Information
        </h1>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Client SPOC */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Client SPOC</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Full name"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email ID</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@company.com"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile</label>
                <input
                  type="tel"
                  value={clientMobile}
                  onChange={(e) => setClientMobile(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ZingHR POC */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-blue-900 mb-4">ZingHR SPOC</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={zinghrName}
                  onChange={(e) => setZinghrName(e.target.value)}
                  placeholder="Full name"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email ID</label>
                <input
                  type="email"
                  value={zinghrEmail}
                  onChange={(e) => setZinghrEmail(e.target.value)}
                  placeholder="email@zinghr.com"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile</label>
                <input
                  type="tel"
                  value={zinghrMobile}
                  onChange={(e) => setZinghrMobile(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-6 mt-8 pb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-black rounded-xl hover:bg-gray-300 transition font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleGenerateProposal}
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                loading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Generating..." : "Generate Proposal"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactInformation;
