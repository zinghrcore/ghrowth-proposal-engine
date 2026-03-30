import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = (process.env.PUBLIC_URL || "").replace(/\/$/, "");

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    custName: "", 
    custType: "",
    custCHROEmail: "",
    custCHROPhone: "",
    password: "",
    confirmPassword: "",
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "custCHROEmail") {
      if (formData.custType === "admin" || formData.custType === "approver") {
        const pattern = /^[a-zA-Z0-9._%+-]+@zinghr\.com$/;
        setEmailError(pattern.test(value) ? "" : "Email must be @zinghr.com for Admin/Approver");
      } else {
        setEmailError("");
      }
    }

    if (name === "confirmPassword" || name === "password") {
      setPasswordError(
        name === "confirmPassword"
          ? value !== formData.password
            ? "Passwords do not match"
            : ""
          : formData.confirmPassword && value !== formData.confirmPassword
          ? "Passwords do not match"
          : ""
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError || passwordError) {
      alert("Please fix the errors before submitting.");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/customers/register`, formData);
      showToast(res.data.message || "Registration successful!", "success");

      setFormData({
        custType: "",
        custCHROEmail: "",
        custCHROPhone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Registration failed.", "error");
    }
  };

  const inputClasses =
    "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-300 ease-in-out shadow-sm bg-white placeholder-gray-400";

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* ✅ Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg transition-all duration-500 transform
            ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            } animate-toastIn`}
        >
          {toast.message}
        </div>
      )}

      {/* ✅ Left Side - Branding */}
      <div className="md:w-1/2 bg-gradient-to-br from-purple-600 to-blue-700 flex flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute -top-28 -left-28 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float animation-delay-500"></div>

        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-wide">
          Welcome to ZingHR
        </h1>

        <p className="text-lg md:text-xl mb-8 text-center max-w-lg leading-relaxed text-white/90">
          Simplify your HR journey and empower your team effortlessly.
        </p>

        <img
          src={`${PUBLIC_URL}/assets/Zing-Logo.png`}
          alt="HR Management"
          className="w-64 md:w-80 rounded-xl shadow-2xl border border-white/20"
        />
      </div>

      {/* ✅ Right Side - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-12 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-10 animate-fadeIn border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-6 text-center tracking-tight">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-gray-700 font-medium">Select Role</label>
            <select
              name="custType"
              value={formData.custType}
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="">-- Select Role --</option>
              <option value="customer">User</option>
              <option value="approver">Approver</option>
              <option value="admin">Admin</option>
            </select>

            <input
  name="custName"
  type="text"
  placeholder="Full Name"
  value={formData.custName}
  onChange={handleChange}
  className={inputClasses}
  required
/>

            <input
              name="custCHROEmail"
              type="email"
              placeholder="Email"
              value={formData.custCHROEmail}
              onChange={handleChange}
              className={inputClasses}
              required
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

            <input
              name="custCHROPhone"
              placeholder="Phone"
              value={formData.custCHROPhone}
              onChange={handleChange}
              className={inputClasses}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={inputClasses}
              required
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputClasses}
              required
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-700 text-white rounded-xl shadow-lg hover:scale-105 hover:from-purple-700 hover:to-blue-800 transition transform font-semibold"
            >
              Register
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-purple-600 font-medium cursor-pointer hover:underline hover:text-blue-700 transition"
            >
              Login
            </span>
          </p>
        </div>
      </div>

      {/* ✅ Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease forwards;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animation-delay-500 {
            animation-delay: 0.5s;
          }

          @keyframes toastIn {
            0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-toastIn { animation: toastIn 0.5s ease forwards; }
        `}
      </style>
    </div>
  );
};

export default Register;
