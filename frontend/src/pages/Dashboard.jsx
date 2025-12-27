import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { BsCheckCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlans, setEditPlans] = useState([]);

  const [modules, setModules] = useState([]);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editModules, setEditModules] = useState([]);

  const [notification, setNotification] = useState({ message: '', type: '' });

  const plansRef = useRef(null);
  const navigate = useNavigate();

  const gradientButtons = [
    'from-green-600 to-teal-500',
    'from-green-500 to-teal-400',
    'from-green-400 to-teal-300',
  ];

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/packages');
        setPlans(res.data);
      } catch (err) {
        console.error('Error fetching packages:', err);
      }
    };
    fetchPackages();

    const fetchModules = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/modules');
        setModules(res.data);
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };
    fetchModules();
  }, []);

  if (!user) return <p>Loading...</p>;

  const handleExploreClick = () => {
    const yOffset = -80;
    const element = plansRef.current;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // --- Notification Function ---
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // --- Plans Edit Handlers ---
  const handleEditClick = () => {
    setEditPlans(JSON.parse(JSON.stringify(plans)));
    setIsModalOpen(true);
  };

  const handlePlanChange = (index, field, value) => {
    const updated = [...editPlans];
    updated[index][field] = value;
    setEditPlans(updated);
  };

  const handleFeatureChange = (planIndex, featureIndex, value) => {
    const updated = [...editPlans];
    updated[planIndex].description[featureIndex] = value;
    setEditPlans(updated);
  };

  const handleAddFeature = (planIndex) => {
    const updated = [...editPlans];
    updated[planIndex].description.push('');
    setEditPlans(updated);
  };

  const handleRemoveFeature = (planIndex, featureIndex) => {
    const updated = [...editPlans];
    updated[planIndex].description.splice(featureIndex, 1);
    setEditPlans(updated);
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put('http://localhost:5000/api/packages', { packages: editPlans });
      setPlans(editPlans);
      setIsModalOpen(false);
      showNotification('Plans updated successfully!');
    } catch (err) {
      console.error('Error updating packages:', err);
      alert('Failed to update packages');
    }
  };

  // --- Modules Edit Handlers ---
  const handleEditModules = () => {
    setEditModules(JSON.parse(JSON.stringify(modules)));
    setIsModuleModalOpen(true);
  };

  const handleAddNewModule = () => {
    const newModule = {
      tempId: Date.now(),
      modName: '',
      modDesc: '',
      modFeatureList: '',
      modObjective: '',
      isNew: true,
    };
    setEditModules(prev => [newModule, ...prev]);
    setIsModuleModalOpen(true);
  };

  const handleModuleChange = (index, field, value) => {
    setEditModules(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // ✅ Updated Module Delete Handler
  const handleRemoveModule = async (id, isNew) => {
    if (isNew) {
      // Just remove locally
      setEditModules(prev => prev.filter(mod => (mod.tempId || mod.modId) !== id));
    } else {
      // Confirm before deleting from backend
      if (!window.confirm('Are you sure you want to delete this module?')) return;

      try {
        await axios.delete(`http://localhost:5000/api/modules/${id}`);
        // Remove from local states
        setEditModules(prev => prev.filter(mod => mod.modId !== id));
        setModules(prev => prev.filter(mod => mod.modId !== id));
        showNotification('Module deleted successfully!');
      } catch (err) {
        console.error('Error deleting module:', err);
        alert(err.response?.data?.message || 'Failed to delete module');
      }
    }
  };

  const handleSaveModules = async () => {
    // ✅ Frontend validation
    for (const mod of editModules) {
      if (!mod.modName || !mod.modDesc) {
        alert('Module Name and Description are required for all modules.');
        return;
      }
    }

    try {
      await axios.put('http://localhost:5000/api/modules/bulk', { modules: editModules });
      const res = await axios.get('http://localhost:5000/api/modules');
      setModules(res.data);
      setIsModuleModalOpen(false);
      showNotification('Modules saved successfully!');
    } catch (err) {
      console.error('Error updating modules:', err);
      alert(err.response?.data?.message || 'Failed to save modules');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Notification Popup */}
      {notification.message && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white z-50 animate-fadeIn ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {notification.message}
        </div>
      )}

      <Sidebar role={user.role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Navbar user={user} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-grow pt-20 px-0">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-green-700 to-teal-600 text-white pt-16 pb-16 px-6 md:px-12">
          <div className="text-center max-w-5xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold">Welcome, {user.custName}!</h1>
            <p className="text-lg md:text-xl">Get started with your favorite subscription plan today</p>
            <div className="space-y-4 text-left md:text-center">
              <p className="text-lg">
                ZingHR is an <span className="font-semibold">AI-powered, cloud-based Human Capital Management (HCM) platform</span>.
              </p>
              <div className="text-center mt-6">
                <button
                  onClick={handleExploreClick}
                  className="px-6 py-3 bg-white text-green-700 font-bold rounded-xl shadow-lg hover:scale-105 transition transform"
                >
                  Explore Plans
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div ref={plansRef} className="mt-12 px-6">
          {(user.role === 'customer' || user.role === 'admin') && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-700">Subscription Plans</h2>
                {user.role === 'admin' && (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    ✏️ Edit Plans
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, index) => {
                  const gradient = gradientButtons[index % gradientButtons.length];
                  const isPremium = index === plans.length - 1;
                  return (
                    <div key={index} className={`relative rounded-3xl shadow-xl overflow-hidden border transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isPremium ? 'border-green-500' : 'border-gray-200'}`}>
                      <div className={`p-6 text-center border-b ${isPremium ? 'border-green-500' : 'border-gray-200'}`}>
                        <h3 className={`text-2xl font-bold mb-2 ${isPremium ? 'text-green-700' : 'text-gray-800'}`}>{plan.name}</h3>
                        {plan.price && <p className="text-3xl font-extrabold mb-4">${plan.price}</p>}
                        {plan.oldPrice && <p className="text-sm line-through text-gray-400">${plan.oldPrice}</p>}
                      </div>
                      <div className="p-6 space-y-3">
                        <ul className="space-y-2 text-gray-700 text-left">
                          {plan.description.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <BsCheckCircleFill className="text-green-600" /> {feature}
                            </li>
                          ))}
                        </ul>
                        {user.role === 'customer' && (
                          <button
                            onClick={() => {
                              localStorage.setItem('selectedPlan', JSON.stringify(plan));
                              navigate('/create-proposal');
                            }}
                            className={`mt-4 w-full py-3 font-semibold rounded-lg text-white bg-gradient-to-r ${gradient} shadow-lg hover:scale-105 transition transform`}
                          >
                            Subscribe
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modules Section */}
        <div className="mt-12 px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-700">Available Modules</h2>
            {user.role === 'admin' && (
              <div className="flex gap-3">
                <button
                  onClick={handleEditModules}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  ✏️ Edit Modules
                </button>
                <button
                  onClick={handleAddNewModule}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  + Add New Module
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((mod) => (
              <div key={mod.modId} className="relative rounded-3xl shadow-xl overflow-hidden border border-gray-200 p-6 hover:shadow-2xl transition transform hover:-translate-y-1">
                <h3 className="text-xl font-bold mb-2 text-green-700">{mod.modName}</h3>
                <p className="text-gray-700 mb-2">{mod.modDesc}</p>
                {mod.modFeatureList && (
                  <ul className="text-gray-600 list-disc pl-5 mb-2">
                    {mod.modFeatureList.split(',').map((feature, i) => (
                      <li key={i}>{feature.trim()}</li>
                    ))}
                  </ul>
                )}
                {mod.modObjective && <p className="text-sm text-gray-500">Objective: {mod.modObjective}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Plan Edit Modal */}
      {isModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative animate-fadeIn border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Edit Subscription Plans</h2>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {editPlans.map((plan, index) => (
                <div key={index} className="border p-4 rounded-lg bg-white">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded mb-2 font-semibold text-lg"
                    placeholder="Plan Name"
                  />
                  {plan.description.map((feature, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, i, e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Feature"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index, i)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddFeature(index)}
                    className="mt-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition">
                Cancel
              </button>
              <button onClick={handleSaveChanges} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Edit Modal */}
      {isModuleModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative animate-fadeIn border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Edit Modules</h2>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {editModules.map((mod, index) => (
                <div key={mod.modId || mod.tempId} className="border p-4 rounded-lg bg-white">
                  <input
                    type="text"
                    value={mod.modName}
                    onChange={(e) => handleModuleChange(index, 'modName', e.target.value)}
                    className="w-full p-2 border rounded mb-2 font-semibold text-lg"
                    placeholder="Module Name"
                  />
                  <input
                    type="text"
                    value={mod.modDesc}
                    onChange={(e) => handleModuleChange(index, 'modDesc', e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm"
                    placeholder="Module Description"
                  />
                  <input
                    type="text"
                    value={mod.modFeatureList}
                    onChange={(e) => handleModuleChange(index, 'modFeatureList', e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm"
                    placeholder="Features (comma separated)"
                  />
                  <input
                    type="text"
                    value={mod.modObjective}
                    onChange={(e) => handleModuleChange(index, 'modObjective', e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm"
                    placeholder="Module Objective"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(mod.modId || mod.tempId, !mod.modId)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm mt-1"
                  >
                    Remove Module
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModuleModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition">
                Cancel
              </button>
              <button onClick={handleSaveModules} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
