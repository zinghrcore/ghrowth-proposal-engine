import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  //const region = JSON.parse(localStorage.getItem("region"));
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlans, setEditPlans] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [packageNames, setPackageNames] = useState([]);
  const [modules, setModules] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [editDiscounts, setEditDiscounts] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  // const [selectedType, setSelectedType] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [moduleSummary, setModuleSummary] = useState({
  pro: 0,
  proPlus: 0,
  ghrowth: 0,
  });
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editModules, setEditModules] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [selectedPlan, setSelectedPlan] = useState('');
  //const plansRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "new"; 
  
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/packages`);
        const packagesWithDesc = res.data.map(pkg => ({
          ...pkg,
          pkgDescList: pkg.pkgDesc ? pkg.pkgDesc.split(',').map(f => f.trim()) : []
        }));
        setPlans(packagesWithDesc);
        setPackageNames(packagesWithDesc);
      } catch (err) {
        console.error('Error fetching packages:', err);
      }
    };
    const fetchModulesAndSummary = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/modules`);
        setModules(res.data);
        console.log("Modules fetched from backend:", res.data);
        const summaryRes = await axios.get(`${BASE_URL}/api/modules/summary`);
        setModuleSummary({
          pro: summaryRes.data.Pro || 0,
          proPlus: summaryRes.data.ProPlus || 0,
          ghrowth: summaryRes.data.GHROWTH || 0,
        });
      } catch (err) {
      console.error('Error fetching modules or summary:', err);
    }
  };
  fetchPackages();
  fetchModulesAndSummary();
}, []);

useEffect(() => {
  if (!selectedPlan || modules.length === 0) {
    setSelectedModules([]);
    return;
  }
  let columnKey = "pkgPro";
  if (selectedPlan.toLowerCase().includes("pro plus")) columnKey = "pkgProPlus";
  else if (selectedPlan.toLowerCase().includes("ghrowth")) columnKey = "pkgGrowth";
  const includedModules = modules.filter(
    (mod) => mod[columnKey]?.toLowerCase() === "included"
  );
  setSelectedModules(includedModules);
}, [selectedPlan, modules]);

useEffect(() => {
  const fetchComparison = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/modules/feature-comparison`);
      setPackageNames(res.data.packages || []);
      setComparisonData(res.data.modules || []);
    } catch (err) {
      console.error("Error fetching feature comparison:", err);
    }
  };
  fetchComparison();
}, []);

useEffect(() => {
  const fetchDiscounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/discounts`); // Your API endpoint
      setDiscounts(res.data);
    } catch (err) {
      console.error('Error fetching discounts:', err);
    }
  };
  fetchDiscounts();
}, []);

useEffect(() => {
  const fetchDiscountTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/discounts/types/all`);
      console.log("Discount types API response:", res.data); // <-- check this
      setDiscountTypes(res.data.types || res.data || []); // <-- set correctly
    } catch (err) {
      console.error("Error fetching discount types:", err);
    }
  };
  fetchDiscountTypes();
}, []);

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const section = params.get("section");
  let targetId = null;
  if (section === "modules") targetId = "modules-section";
  else if (section === "packages") targetId = "packages-section";
  if (targetId) {
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }
}, [location.search]);

if (!user) return <p className="text-center text-black font-semibold mt-20">Loading...</p>;

/*const handleExploreClick = () => {
  const yOffset = -80;
  const element = plansRef.current;
  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
  window.scrollTo({ top: y, behavior: 'smooth' });
};*/

const showNotification = (message, type = 'success') => {
  setNotification({ message, type });
  setTimeout(() => setNotification({ message: '', type: '' }), 3000);
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
    await axios.put(`${BASE_URL}/api/packages`, { packages: editPlans });
    const res = await axios.get(`${BASE_URL}/api/packages`);
    setPlans(res.data);
    setIsModalOpen(false);
    showNotification('Plans updated successfully!');
  } catch (err) {
    console.error('Error updating packages:', err);
    alert('Failed to update packages');
  }
};

const handleModuleChange = (index, field, value) => {
  setEditModules(prev => {
    const updated = [...prev];
    updated[index][field] = value;
    return updated;
  });
};

const handleRemoveModule = async (id, isNew) => {
  if (isNew) {
    setEditModules(prev => prev.filter(mod => (mod.tempId || mod.modId) !== id));
  } else {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    try {
      await axios.delete(`${BASE_URL}/api/modules/${id}`);
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
  for (const mod of editModules) {
    if (!mod.modName || !mod.modDesc) {
      alert('Module Name and Description are required for all modules.');
      return;
    }
  }
  try {
    await axios.put(`${BASE_URL}/api/modules/bulk`, { modules: editModules });
    const res = await axios.get(`${BASE_URL}/api/modules`);
    setModules(res.data);
    setIsModuleModalOpen(false);
    showNotification('Modules saved successfully!');
  } catch (err) {
    console.error('Error updating modules:', err);
    alert(err.response?.data?.message || 'Failed to save modules');
  }
};

const handleAddDiscount = () => {
  setEditDiscounts([
    ...editDiscounts,
    { discCode: '', discDesc: '', discPercentage: 0, discType: 'Rate(PEPM)', validFromMonth: 1, validToMonth: 12, tempId: Date.now() }
  ]);
  setIsDiscountModalOpen(true);
};

const handleEditDiscount = (index) => {
  setEditDiscounts([discounts[index]]);
  setIsDiscountModalOpen(true);
};

const handleDiscountChange = (index, field, value) => {
  const updated = [...editDiscounts];
  updated[index][field] = value;
  setEditDiscounts(updated);
};

const handleDeleteDiscount = async (id) => {
  if (!window.confirm('Are you sure you want to delete this discount?')) return;
  try {
    await axios.delete(`${BASE_URL}/api/discounts/${id}`);
    setDiscounts(prev => prev.filter(d => d.discId !== id));
    showNotification('Discount deleted successfully!');
  } catch (err) {
    console.error(err);
    alert('Failed to delete discount.');
  }
};

const handleSaveDiscounts = async () => {
  try {
    await axios.put(`${BASE_URL}/api/discounts`, { discounts: editDiscounts });
    const res = await axios.get(`${BASE_URL}/api/discounts`);
    setDiscounts(res.data);
    setIsDiscountModalOpen(false);
    showNotification('Discounts saved successfully!');
  } catch (err) {
    console.error(err);
    alert('Failed to save discounts.');
  }
};

const comparisonDataGroupedByCategory = comparisonData
  .filter(mod => mod.category !== "Plan Benefits")
  .reduce((acc, mod) => {
    const category = mod.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push({
      feature: mod.modName,
      desc: mod.modDesc,
      status: mod.packages,
    });
    return acc;
  }, {});
  const planBenefitFeatures = Array.from(
    new Set(
      packageNames
        .map(pkg => (pkg.pkgDesc ? pkg.pkgDesc.split(',').map(f => f.trim()) : []))
        .flat()
    )
  );
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 font-sans text-black">
      {/* Notification Popup */}
      {notification.message && (
        <div
          className={`fixed top-5 right-5 px-6 py-3 rounded-2xl shadow-xl text-white z-50 animate-fadeIn flex items-center gap-3 font-medium transition-transform transform ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {notification.type === 'success' ? '✔️' : '❌'} {notification.message}
        </div>
      )}
      <Navbar user={user} />
      <main className="flex-grow pt-20 px-4 md:px-8">
        {/* ✅ Admin Edit Buttons */}
        {user.role === 'admin' && (
          <div className="flex justify-end mb-6 gap-2">
            <button
              onClick={() => { setEditPlans(plans); setIsModalOpen(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Edit Plans
            </button>
            <button
              onClick={() => { setEditModules(modules); setIsModuleModalOpen(true); }}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
            >
              Edit Modules
            </button>
          </div>
        )}

        {/* ✅ Approver Button */}
        {user.role === 'approver' && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate('/pending-approvals')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              View Pending Approvals
            </button>
          </div>
        )}

        {/* ✅ Admin Button */}
        {user.role === 'admin' && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate('/admin/all-proposals')}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition"
            >
              View All Proposals
            </button>
          </div>
        )}

        {/* Combined Buttons for Users */}
        {user.role !== 'approver' && user.role !== 'admin' && (
          <div className="flex justify-center gap-6 mb-10">
            <button
              onClick={() => navigate('/my-proposals')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              View My Proposals
            </button>
            {mode === "existing" && (
              <button
                onClick={() => navigate("/explore-modules")}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Explore All Modules
              </button>
            )}
          </div>
        )}
        <div className="mt-16 overflow-x-auto">
          <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-3">
            Compare Plans & Choose
          </h1>
          <p className="text-center text-blue-700 mb-10 text-lg">
            Review all features and select the plan that best fits your organization
          </p>
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-200 max-w-7xl mx-auto px-4 md:px-6 hover:shadow-3xl transition-shadow duration-300">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead className="sticky top-0 z-10 bg-blue-100">
                <tr>
                  <th className="px-6 py-4 text-left w-1/3"></th>
                  {packageNames.map((pkg, idx) => (
                    <th key={idx} className="px-6 py-4 text-center align-top">
                      <div className="p-5 rounded-2xl border border-blue-200 shadow-md flex flex-col items-center bg-white hover:scale-105 transform transition-all duration-300">
                        {pkg.pkgLabel && (
                          <span className="text-xs bg-blue-700 text-white px-3 py-1 rounded-full font-semibold mb-1">
                            {pkg.pkgLabel.toUpperCase()}
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-blue-900">{pkg.pkgName}</h3>
                        {pkg.pkgDescHeader && (
                          <div className="text-sm text-blue-700 mt-2 text-center">
                            {pkg.pkgDescHeader}
                          </div>
                        )}
                        {pkg.price && (
                          <p className="text-blue-800 font-semibold mt-2 text-lg">₹{pkg.price} / month</p>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-800 text-white font-bold sticky top-12 z-20">
                  <td className="px-4 py-3 text-left text-lg" colSpan={packageNames.length + 1}>
                    Plan Benefits
                  </td>
                </tr>
                {planBenefitFeatures.map((feature, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50 transition duration-200">
                    <td className="px-4 py-3 font-semibold text-blue-900">{feature}</td>
                    {packageNames.map((pkg, j) => {
                      const features = pkg.pkgDesc?.split(',').map(f => f.trim()) || [];
                      const included = features.includes(feature);
                      return (
                        <td key={j} className="text-center px-4 py-3">
                          {included ? (
                            <span className="inline-block bg-green-100 text-green-600 font-bold rounded-full w-8 h-8 leading-8 text-center">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-block bg-gray-100 text-gray-400 font-bold rounded-full w-8 h-8 leading-8 text-center">
                              ✗
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {Object.entries(comparisonDataGroupedByCategory).map(([category, features]) => (
                  <React.Fragment key={category}>
                    <tr className="bg-blue-800 text-white font-bold sticky top-12 z-20">
                      <td className="px-4 py-3 text-left text-lg" colSpan={packageNames.length + 1}>
                        {category}
                      </td>
                    </tr>
                    {features.map((feature, i) => (
                      <tr key={i} className="border-b hover:bg-blue-50 transition duration-200 align-top">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-blue-900">{feature.feature}</div>
                          {feature.desc && (
                            <div className="text-sm text-blue-700 mt-1">{feature.desc}</div>
                          )}
                        </td>
                        {packageNames.map((pkg, j) => {
                          const included = feature.status?.[pkg.pkgName]?.toLowerCase() === "included";
                          const toggleInclusion = async () => {
                            if (user.role !== "admin") return;
                            setComparisonData((prev) => {
                              const updated = prev.map((mod) => {
                                if (mod.modName === feature.feature) {
                                  const newMod = { ...mod, status: { ...mod.status } };
                                  newMod.status[pkg.pkgName] = included ? "excluded" : "included";
                                  return newMod;
                                }
                                return { ...mod };
                              });
                              return [...updated]; 
                            });
                            try {
                              await axios.put(`${BASE_URL}/api/modules/update-status`, {
                                moduleName: feature.feature,
                                packageName: pkg.pkgName,
                                status: included ? "excluded" : "included",
                              });
                              showNotification("Module status updated successfully!", "success");
                            } catch (err) {
                              console.error("Error updating module status:", err);
                              showNotification("Failed to update status. Please try again.", "error");
                            }
                          };
                          return (
                            <td
                              key={j}
                              className={`text-center px-4 py-3 ${
                                user.role === "admin" ? "cursor-pointer hover:scale-110 transition-transform" : ""
                              }`}
                              onClick={toggleInclusion}
                              title={user.role === "admin" ? "Click to toggle" : ""}
                            >
                              {included ? (
                                <span
                                  className={`fade-toggle inline-block ${
                                    user.role === "admin" ? "bg-green-200 hover:bg-green-300" : "bg-green-100"
                                  } text-green-600 font-bold rounded-full w-8 h-8 leading-8 text-center`}
                                >
                                  ✓
                                </span>
                              ) : (
                                <span
                                  className={`fade-toggle inline-block ${
                                    user.role === "admin" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100"
                                  } text-gray-500 font-bold rounded-full w-8 h-8 leading-8 text-center`}
                                >
                                  ✗
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>  
        </div>
        {/* Module Summary Section */}
        <div className="mt-16 mb-20">
          <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-10">
            Module Summary
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-white shadow-xl rounded-3xl p-6 w-72 text-center border border-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Modules in <span className="text-blue-600 font-bold">Pro</span>
              </h3>
              <p className="text-4xl font-extrabold text-blue-900">{moduleSummary.pro}</p>
            </div>
            <div className="bg-white shadow-xl rounded-3xl p-6 w-72 text-center border border-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Modules in <span className="text-blue-600 font-bold">Pro Plus</span>
              </h3>
              <p className="text-4xl font-extrabold text-blue-900">{moduleSummary.proPlus}</p>
            </div>
            <div className="bg-white shadow-xl rounded-3xl p-6 w-72 text-center border border-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Modules in <span className="text-blue-600 font-bold">GHROWTH</span>
              </h3>
              <p className="text-4xl font-extrabold text-blue-900">{moduleSummary.ghrowth}</p>
            </div>
          </div>
        </div>
        {user.role === 'admin' && (
          <div className="mt-16 mb-20">
            <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-10">
              Manage Discounts
            </h2>
            <div className="overflow-x-auto max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl border border-blue-200 p-6">
              {user.role === 'admin' && (
                <button
                  onClick={handleAddDiscount}
                  className="mb-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >
                  + Add Discount
                </button>
              )}
              <table className="w-full text-sm md:text-base text-left text-gray-700 border-collapse">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Valid From</th>
                    <th className="px-4 py-3">Valid To</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map((disc, index) => (
                    <tr key={disc.discId} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-900">{disc.discCode}</td>
                      <td className="px-4 py-3 text-gray-700">{disc.discDesc || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{disc.discPercentage || 0}%</td>
                      <td className="px-4 py-3 text-gray-700">{disc.discType}</td>
                      <td className="px-4 py-3 text-gray-700">{disc.validFromMonth}</td>
                      <td className="px-4 py-3 text-gray-700">{disc.validToMonth}</td>
                      <td className="px-4 py-3 text-center flex justify-center gap-2">
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          onClick={() => handleEditDiscount(index)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                          onClick={() => handleDeleteDiscount(disc.discId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Select Your Plan Section */}
        {user.role !== 'approver' && (
          <div className="mt-16 mb-24">
            <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-10">
              Select Your Plan
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              <label
                className={`cursor-pointer bg-white border-2 rounded-3xl p-6 w-80 shadow-md hover:shadow-2xl transition-all duration-300 text-center ${
                  selectedPlan === 'ZingHR Pro' ? 'border-blue-600 ring-4 ring-blue-200' : 'border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="ZingHR Pro"
                  checked={selectedPlan === 'ZingHR Pro'}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="hidden"
                />
                <h3 className="text-xl font-bold text-blue-900 mb-2">ZingHR Pro</h3>
                <p className="text-blue-700">Essential HR Management</p>
              </label>
              <label
                className={`cursor-pointer bg-white border-2 rounded-3xl p-6 w-80 shadow-md hover:shadow-2xl transition-all duration-300 text-center ${
                  selectedPlan === 'ZingHR Pro Plus' ? 'border-blue-600 ring-4 ring-blue-200' : 'border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="ZingHR Pro Plus"
                  checked={selectedPlan === 'ZingHR Pro Plus'}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="hidden"
                />
                <h3 className="text-xl font-bold text-blue-900 mb-2">ZingHR Pro Plus</h3>
                <p className="text-blue-700">Advanced HR Suite</p>
              </label>
              <label
                className={`cursor-pointer bg-white border-2 rounded-3xl p-6 w-80 shadow-md hover:shadow-2xl transition-all duration-300 text-center ${
                  selectedPlan === 'ZingHR GHROWTH' ? 'border-blue-600 ring-4 ring-blue-200' : 'border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="ZingHR GHROWTH"
                  checked={selectedPlan === 'ZingHR GHROWTH'}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="hidden"
                />
                <h3 className="text-xl font-bold text-blue-900 mb-2">ZingHR GHROWTH</h3>
                <p className="text-blue-700">Complete Enterprise Solution</p>
              </label>
            </div>
            {selectedPlan && (
              <p className="mt-10 text-center text-lg font-semibold text-blue-800">
                You have selected: <span className="text-blue-900 font-bold">{selectedPlan}</span>
              </p>
            )}
            <div className="mt-10 flex justify-center gap-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 bg-gray-300 text-black rounded-xl hover:bg-gray-400 transition font-semibold"
              >
                Back
              </button>
              <button
                disabled={!selectedPlan}
                onClick={() => {
                  if (selectedPlan) {
                    localStorage.setItem("selectedPlan", selectedPlan);
                    localStorage.setItem("selectedModules", JSON.stringify(selectedModules)); // save modules
                    localStorage.setItem("source", "dashboard");
                    navigate("/client-info");
                  }
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  selectedPlan
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {selectedPlan ? `Continue with ${selectedPlan}` : "Select a Plan to Continue"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Footer */}
      {isModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-md z-50">
          <div className="bg-white rounded-3xl shadow-3xl w-full max-w-3xl p-6 relative animate-fadeIn border border-blue-200">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-blue-700">
              Edit Subscription Plans
            </h2>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {editPlans.map((plan, index) => (
                <div key={index} className="border p-4 rounded-xl bg-blue-50 border-blue-200 hover:shadow-lg transition duration-200">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded mb-2 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Plan Name"
                  />
                  <input
                    type="text"
                    value={plan.label || ''}
                    onChange={(e) => handlePlanChange(index, 'label', e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Plan Label"
                  />
                  <input
                    type="number"
                    value={plan.price || ''}
                    onChange={(e) => handlePlanChange(index, 'price', e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Plan Price (₹ per employee / month)"
                  />
                  {plan.description.map((feature, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, i, e.target.value)}
                        className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-semibold"
                  >
                    + Add Feature
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {isModuleModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-md z-50">
          <div className="bg-white rounded-3xl shadow-3xl w-full max-w-3xl p-6 relative animate-fadeIn border border-blue-200">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-blue-700">Edit Modules</h2>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {editModules.map((mod, index) => (
                <div key={mod.modId || mod.tempId} className="border p-4 rounded-xl bg-blue-50 border-blue-200 hover:shadow-lg transition duration-200">
                  <input
                    type="text"
                    value={mod.modName}
                    onChange={(e) => handleModuleChange(index, 'modName', e.target.value)}
                    className="w-full p-2 border rounded mb-2 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Module Name"
                  />
                  <input
                    type="text"
                    value={mod.modDesc}
                    onChange={(e) => handleModuleChange(index, 'modDesc', e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Module Description"
                  />
                  <input
                    type="text"
                    value={mod.modFeatureList}
                    onChange={(e) => handleModuleChange(index, 'modFeatureList', e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Features (comma separated)"
                  />
                  <input
                    type="text"
                    value={mod.modObjective}
                    onChange={(e) => handleModuleChange(index, 'modObjective', e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              <button onClick={handleSaveModules} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {isDiscountModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-md z-50">
          <div className="bg-white rounded-3xl shadow-3xl w-full max-w-3xl p-6 relative animate-fadeIn border border-blue-200">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-blue-700">
              {editDiscounts.length === 1 ? 'Edit Discount' : 'Add Discounts'}
            </h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {editDiscounts.map((disc, index) => (
                <div key={disc.discId || disc.tempId} className="border p-4 rounded-xl bg-blue-50 border-blue-200 hover:shadow-lg transition duration-200">
                  <input
                    type="text"
                    value={disc.discCode}
                    onChange={(e) => handleDiscountChange(index, 'discCode', e.target.value)}
                    className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Discount Code"
                  />
                  <input
                    type="text"
                    value={disc.discDesc}
                    onChange={(e) => handleDiscountChange(index, 'discDesc', e.target.value)}
                    className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    value={disc.discPercentage}
                    onChange={(e) => handleDiscountChange(index, 'discPercentage', e.target.value)}
                    className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Percentage"
                  />
                  <select
                    value={disc.discType || ""}
                    onChange={(e) => handleDiscountChange(index, "discType", e.target.value)}
                    className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {discountTypes.length === 0 ? (
                      <option>Loading types...</option>
                    ) : (
                      discountTypes.map((type, i) => (
                        <option key={i} value={type}>
                          {type}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={disc.validFromMonth}
                      onChange={(e) => handleDiscountChange(index, 'validFromMonth', e.target.value)}
                      className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Valid From (Month)"
                      min={1} max={12}
                    />
                    <input
                      type="number"
                      value={disc.validToMonth}
                      onChange={(e) => handleDiscountChange(index, 'validToMonth', e.target.value)}
                      className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Valid To (Month)"
                      min={1} max={12}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditDiscounts(prev => prev.filter((_, i) => i !== index))}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsDiscountModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition">
                Cancel
              </button>
              <button onClick={handleSaveDiscounts} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
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
          .fade-toggle {
            transition: all 0.2s ease;
            transform: scale(1);
            display: inline-block;
          }
          .fade-toggle:active {
            transform: scale(0.85);
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
