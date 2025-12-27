import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCalendarAlt, FaSignature, FaCogs } from "react-icons/fa";

const CreateProposal = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedPlan = JSON.parse(localStorage.getItem("selectedPlan")) || {};

  const [formData, setFormData] = useState({
    planName: selectedPlan.name || "",
    propDate: "",
    propVersion: "",
    custSignName: "",
    custSignDesig: "",
    custSignDate: "",
    modulesOpted: selectedPlan.description
      ? selectedPlan.description.join(", ")
      : "",
    billingFreq: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const proposalData = {
        CustId: user.custId,
        planName: formData.planName,
        propDate: formData.propDate,
        propVersion: formData.propVersion,
        custSignName: formData.custSignName,
        custSignDesig: formData.custSignDesig,
        custSignDate: formData.custSignDate,
        modulesOpted: JSON.stringify(formData.modulesOpted.split(",")),
        billingFreq: formData.billingFreq,
      };

      await axios.post("http://localhost:5000/api/proposals", proposalData);
      alert("✅ Proposal created successfully!");
      setFormData({
        planName: "",
        propDate: "",
        propVersion: "",
        custSignName: "",
        custSignDesig: "",
        custSignDate: "",
        modulesOpted: "",
        billingFreq: "",
      });
      localStorage.removeItem("selectedPlan");
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("❌ Failed to create proposal. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Sidebar + Navbar */}
      <Sidebar role={user.role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Navbar user={user} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Header */}
      <div className="w-full bg-gradient-to-r from-green-700 to-teal-600 text-white pt-20 pb-12 px-6 md:px-12 shadow-md">
        <div className="text-center max-w-5xl mx-auto space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Create Proposal
          </h1>
          <p className="text-lg opacity-90">
            Review your selected plan and fill in your proposal details below.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <main className="flex justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-10 border border-gray-200 space-y-10"
        >
          {/* Selected Plan at Top */}
          {selectedPlan.name && (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-300 shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-green-700 mb-3 text-center">
                Selected Plan: {selectedPlan.name}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 max-w-3xl mx-auto">
                {selectedPlan.description?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-green-600" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Proposal Details */}
          <section className="border rounded-xl p-6 shadow-sm bg-gray-50">
            <div className="flex items-center gap-3 mb-6 border-b pb-2">
              <FaCalendarAlt className="text-green-600 text-xl" />
              <h2 className="text-xl font-bold text-green-700">Proposal Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Proposal Date
                </label>
                <input
                  type="date"
                  name="propDate"
                  value={formData.propDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Proposal Version
                </label>
                <input
                  type="number"
                  name="propVersion"
                  value={formData.propVersion}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="1.0"
                  required
                />
              </div>
            </div>
          </section>

          {/* Customer Signature */}
          <section className="border rounded-xl p-6 shadow-sm bg-gray-50">
            <div className="flex items-center gap-3 mb-6 border-b pb-2">
              <FaSignature className="text-green-600 text-xl" />
              <h2 className="text-xl font-bold text-green-700">
                Customer Signature Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="custSignName"
                  value={formData.custSignName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="custSignDesig"
                  value={formData.custSignDesig}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="custSignDate"
                  value={formData.custSignDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Proposal Preferences */}
          <section className="border rounded-xl p-6 shadow-sm bg-gray-50">
            <div className="flex items-center gap-3 mb-6 border-b pb-2">
              <FaCogs className="text-green-600 text-xl" />
              <h2 className="text-xl font-bold text-green-700">Proposal Preferences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Modules Opted
                </label>
                <textarea
                  name="modulesOpted"
                  value={formData.modulesOpted}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Example: Payroll, Attendance, Recruitment"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Billing Frequency
                </label>
                <select
                  name="billingFreq"
                  value={formData.billingFreq}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="1">Monthly</option>
                  <option value="3">Quarterly</option>
                  <option value="12">Yearly</option>
                </select>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-10 py-3 bg-gradient-to-r from-green-700 to-teal-600 text-white text-lg font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-green-300 transition-transform duration-200"
            >
              🚀 Create Proposal
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default CreateProposal;
