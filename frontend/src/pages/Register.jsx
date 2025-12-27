import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    custType: '', // Role: admin, approver, customer
    custName: '',
    custCHRO: '',
    custCHROEmail: '',
    custCHROPhone: '',
    custRegion: '',
    custAddress: '',
    password: '',
    confirmPassword: '',
  });

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time email validation
    if (name === 'custCHROEmail') {
      if (formData.custType === 'admin' || formData.custType === 'approver') {
        const pattern = /^[a-zA-Z0-9._%+-]+@zinghr\.com$/;
        setEmailError(pattern.test(value) ? '' : 'Email must be @zinghr.com for Admin/Approver');
      } else {
        setEmailError('');
      }
    }

    // Real-time password confirmation
    if (name === 'confirmPassword' || name === 'password') {
      setPasswordError(
        name === 'confirmPassword'
          ? value !== formData.password
            ? 'Passwords do not match'
            : ''
          : formData.confirmPassword && value !== formData.confirmPassword
          ? 'Passwords do not match'
          : ''
      );
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError || passwordError) {
      alert('Please fix the errors before submitting.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/customers/register', formData);
      alert(res.data.message || 'Registration successful!');
      setFormData({
        custType: '',
        custName: '',
        custCHRO: '',
        custCHROEmail: '',
        custCHROPhone: '',
        custRegion: '',
        custAddress: '',
        password: '',
        confirmPassword: '',
      });
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed.');
    }
  };

  const renderStep = () => {
    const inputClasses =
      'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition duration-300 ease-in-out';

    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fadeIn">
            <label className="block text-gray-700 font-medium">Select Role</label>
            <select
              name="custType"
              value={formData.custType}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">-- Select Role --</option>
              <option value="customer">Customer</option>
              <option value="approver">Approver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fadeIn">
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
              name="custRegion"
              placeholder="Region"
              value={formData.custRegion}
              onChange={handleChange}
              className={inputClasses}
            />
            <input
              name="custAddress"
              placeholder="Address"
              value={formData.custAddress}
              onChange={handleChange}
              className={inputClasses}
            />
            {formData.custType === 'customer' && (
              <input
                name="custName"
                placeholder="Company Name"
                value={formData.custName}
                onChange={handleChange}
                className={inputClasses}
              />
            )}
            {formData.custType === 'customer' && (
              <input
                name="custCHRO"
                placeholder="CHRO Name"
                value={formData.custCHRO}
                onChange={handleChange}
                className={inputClasses}
              />
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fadeIn">
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
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="md:w-1/2 bg-gradient-to-br from-green-500 to-green-800 flex flex-col justify-center items-center p-10 text-white">
        <h1 className="text-4xl font-extrabold mb-4">Welcome to ZingHR</h1>
        <p className="text-lg mb-6 text-center">Streamline your HR operations and manage customers efficiently.</p>
        <img src="/assets/Zing-Logo.png" alt="HR Management" className="w-full max-w-sm" />
      </div>

      {/* Right Side - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-10 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10 animate-fadeIn">
          <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Create Your Account</h2>

          {/* Progress Bar */}
          <div className="flex mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ease-in-out ${step >= s ? 'bg-green-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>

          <form
            onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}
            className="space-y-5"
          >
            {renderStep()}

            <div className="flex justify-between mt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition transform hover:scale-105"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition transform hover:scale-105"
              >
                {step === 3 ? 'Register' : 'Next'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-green-600 font-medium cursor-pointer hover:underline"
            >
              Login
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

export default Register;
