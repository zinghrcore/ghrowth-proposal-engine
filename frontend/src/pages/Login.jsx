import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // 👁️ import icons

const BASE_URL = process.env.REACT_APP_API_URL;
const PUBLIC_URL = (process.env.PUBLIC_URL || "").replace(/\/$/, "");

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 password toggle
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ✅ Show toast helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const user = res.data.user;

      if (!res.data.user || !res.data.user.role) {
        showToast("Login failed: user role not found.", "error");
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setEmail("");
      setPassword("");
      showToast("Login successful!", "success");

      navigate("/region-select");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Login failed.", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans relative">
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
      <div className="md:w-1/2 bg-gradient-to-br from-purple-600 to-blue-700 flex flex-col justify-center items-center p-10 text-white relative overflow-hidden">
        <div className="absolute -top-28 -left-28 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float animation-delay-500"></div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Welcome Back!
        </h1>
        <p className="text-lg md:text-xl mb-6 text-center max-w-md text-white/90 leading-relaxed">
          Simplify your HR journey and empower your workforce effortlessly.
        </p>
        <img
          src={`${PUBLIC_URL}/assets/Zing-Logo.png`}
          alt="ZingHR Login"
          className="w-full max-w-xs rounded-xl shadow-2xl border border-white/20"
        />
      </div>

      {/* ✅ Right Side - Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-10 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-10 animate-fadeIn border border-gray-100 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-6 text-center tracking-tight">
            User Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-300 shadow-sm placeholder-gray-400"
            />

            {/* ✅ Password field with show/hide toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-300 shadow-sm placeholder-gray-400 pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 cursor-pointer hover:text-purple-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-700 text-white rounded-xl shadow-lg hover:scale-105 hover:from-purple-700 hover:to-blue-800 transition transform font-semibold"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Don’t have an account?{" "}
            <span
              //onClick={() => navigate("/register")}
              className="text-purple-600 font-medium cursor-pointer hover:underline hover:text-blue-700 transition"
            >
              Register here
            </span>
          </p>
        </div>
      </div>

      {/* ✅ Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
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

export default Login;
