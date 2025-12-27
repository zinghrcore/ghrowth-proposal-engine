import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      if (!res.data.user || !res.data.user.role) {
        alert('Login failed: user role not found.');
        return;
      }

      // Save user data including role
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Reset form
      setEmail('');
      setPassword('');

      // Redirect everyone to the same dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="md:w-1/2 bg-gradient-to-br from-green-600 to-teal-600 flex flex-col justify-center items-center p-10 text-white">
        <h1 className="text-4xl font-extrabold mb-4">Welcome Back!</h1>
        <p className="text-lg mb-6 text-center max-w-md">
          Access your ZingHR Proposal Engine dashboard — personalized for Admins, Approvers, and Customers.
        </p>
        <img src="/assets/Zing-Logo.png" alt="ZingHR Login" className="w-full max-w-xs" />
      </div>

      {/* Right Side - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-10 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10 animate-fadeIn">
          <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">User Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300"
            />

            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition transform hover:scale-105"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Don’t have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              className="text-blue-600 font-medium cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
