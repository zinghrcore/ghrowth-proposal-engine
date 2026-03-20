import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ClientInformation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const selectedPlan = localStorage.getItem("selectedPlan") || "ZingHR PRO";
  const regionInfo = JSON.parse(localStorage.getItem("region")) || {
    name: "India",
    currency: "INR",
  };
  const savedModules = React.useMemo(() => {
  const data = localStorage.getItem("selectedModules");
  return data ? JSON.parse(data) : null;
  }, []);
  const source = localStorage.getItem("source");
  const isExploreModules = source === "exploreModules";
  const currencySymbol = regionInfo.currency === "USD" ? "$" : "₹";
  const INR_TO_USD_RATE = 1.94 / 175;
  const planMinEmployees = {
    pro: 1000,
    proplus: 600,
    ghrowth: 500,
  };
  const normalizedPlan = selectedPlan.replace(/\s+/g, "").toLowerCase();
  let minEmployees = 1000;
  if (normalizedPlan.includes("proplus")) {
    minEmployees = planMinEmployees.proplus;
  } else if (normalizedPlan.includes("ghrowth")) {
    minEmployees = planMinEmployees.ghrowth;
  } else if (normalizedPlan.includes("pro")) {
    minEmployees = planMinEmployees.pro;
  }
  const [, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showModuleQuestion, setShowModuleQuestion] = useState(true); 
  const [modulesAreDifferent, setModulesAreDifferent] = useState(false);
  const [moduleAssignments, setModuleAssignments] = useState({});
  const [whiteCollar, setWhiteCollar] = useState(0);
  const [blueCollar, setBlueCollar] = useState(0);
  const [contract, setContract] = useState(0);
  const [addPayroll, setAddPayroll] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountDetails, setDiscountDetails] = useState(null);
  const [billingFrequency, setBillingFrequency] = useState("Monthly");
  const getBillingFrequencyDiscount = () => {
  if (billingFrequency === "Monthly") return 4;
  if (billingFrequency === "Quarterly") return 3;
  if (billingFrequency === "Half-Yearly") return 2;
  if (billingFrequency === "Annual") return 1;
  return 0;
  };
  const [discountError, setDiscountError] = useState("");
  const [discountedRate, setDiscountedRate] = useState(0);
  const [discountedImplementationFee, setDiscountedImplementationFee] = useState(0);
  const [originalRate, setOriginalRate] = useState(0);
  const [minRate, setMinRate] = useState(0);
  const [originalImplementationFee, setOriginalImplementationFee] = useState(0);
  const selectedModules = JSON.parse(localStorage.getItem("selectedModules"));
  const [priceDetails, setPriceDetails] = useState({
    rate: 0,
    effectiveEmployees: minEmployees,
    monthlyPlatform: 0,
    totalMonthly: 0,
    firstYearTotal: 0,
    implementationFee: 0,
  });
  const [employeeMasterReady, setEmployeeMasterReady] = useState(false);
  const [policiesReady, setPoliciesReady] = useState(false);
  useEffect(() => {
  setPriceDetails((prev) => {
    const newImplementationFee = applyAdditionalImplementationDiscount(
      discountedImplementationFee > 0
        ? discountedImplementationFee
        : prev.implementationFee
    );
    if (prev.implementationFee === newImplementationFee) return prev;
    return {
      ...prev,
      implementationFee: newImplementationFee,
    };
  });
}, [employeeMasterReady, policiesReady, discountedImplementationFee]);
const applyAdditionalImplementationDiscount = (fee) => {
  if (employeeMasterReady && policiesReady) {
    return +(fee * 0.95).toFixed(2); // reduce 5%
  }
  return fee;
};
const [modules, setModules] = useState([]);
const [modulesToAssign, setModulesToAssign] = useState([]);
useEffect(() => {
  let newModules = [];
  if (source === "exploreModules" && savedModules?.modules?.length > 0) {
    newModules = savedModules.modules;
  } 
  else if (selectedPackage && modules.length > 0) {
    const normalizedPlan = (selectedPackage.pkgName || selectedPackage.name)
      .replace(/\s+/g, "")
      .toLowerCase();
      let columnKey = "pkgPro";
      if (normalizedPlan.includes("proplus")) columnKey = "pkgProPlus";
      else if (normalizedPlan.includes("ghrowth")) columnKey = "pkgGrowth";
      newModules = modules.filter(
        (mod) => mod[columnKey]?.toLowerCase() === "included"
      );
    }
    setModulesToAssign((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(newModules)) {
        return prev;
      }
      return newModules;
    });
  }, [selectedPackage, modules, savedModules, source]);
  const calculateRate = (packageName) => {
    if (source === "exploreModules" && savedModules?.modules?.length > 0) {
      const sumINR = savedModules.modules.reduce(
        (acc, mod) => acc + parseFloat(mod.PriceINR || 0),
        0
      );
      return regionInfo.currency === "USD" ? +(sumINR * INR_TO_USD_RATE).toFixed(2) : sumINR;
    }
    if (!modules.length) return 0;
    let columnKey = "";
    const normalizedPlan = packageName.replace(/\s+/g, "").toLowerCase();
    if (normalizedPlan.includes("proplus")) columnKey = "pkgProPlus";
    else if (normalizedPlan.includes("ghrowth")) columnKey = "pkgGrowth";
    else columnKey = "pkgPro"; 
    const includedModules = modules.filter(
      (mod) => mod[columnKey]?.toLowerCase() === "included"
    );
    const sumINR = includedModules.reduce(
      (acc, mod) => acc + parseFloat(mod.PriceINR || 0),
      0
    );
    return regionInfo.currency === "USD" ? +(sumINR * INR_TO_USD_RATE).toFixed(2) : sumINR;
  };
  const calculateDynamicRate = () => {
    if (!modulesAreDifferent) return originalRate;
    let rate = 0;
    Object.entries(moduleAssignments).forEach(([modId, employeeTypes]) => {
      const mod = modules.find((m) => String(m.modId) === String(modId));
      if (!mod) return;
      const price = parseFloat(mod.PriceINR || 0);
      if (employeeTypes.includes("White Collar") && Number(whiteCollar) > 0) {
        rate += price;
      }
      if (employeeTypes.includes("Blue Collar") && Number(blueCollar) > 0) {
        rate += price;
      }
      if (employeeTypes.includes("Contract") && Number(contract) > 0) {
        rate += price;
      }
    });
    return regionInfo.currency === "USD" ? +(rate * INR_TO_USD_RATE).toFixed(2) : rate;
  };
  const calculateMonthlyPlatform = () => {
    let total = 0;
    Object.entries(moduleAssignments).forEach(([modId, employeeTypes]) => {
      const module = modulesToAssign.find(
      (m) => String(m.modId) === String(modId)
    );
    if (!module) return;
    const price = Number(module.PriceINR || 0);
    employeeTypes.forEach((type) => {
      if (type === "White Collar") {
        total += Number(whiteCollar || 0) * price;
      }
      if (type === "Blue Collar") {
        total += Number(blueCollar || 0) * price;
      }
      if (type === "Contract") {
        total += Number(contract || 0) * price;
      }
    });
  });
  return total;
};
useEffect(() => {
  if (!modulesAreDifferent) return;
  const dynamicRate = calculateDynamicRate();
  if (dynamicRate === originalRate) return;
  setOriginalRate(dynamicRate);
  setPriceDetails((prev) => {
    if (prev.rate === dynamicRate) return prev;
    return {
      ...prev,
      rate: dynamicRate
    };
  });
}, [
  moduleAssignments,
  whiteCollar,
  blueCollar,
  contract,
  modulesAreDifferent
]);
useEffect(() => {
  const fetchModules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/modules"); // adjust endpoint if needed
      setModules(res.data);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    }
  };
  fetchModules();
}, []);
useEffect(() => {
  if (!selectedPackage || !modules.length) return;
  const dynamicRate = calculateRate(selectedPackage.name || selectedPackage.pkgName);
  setOriginalRate(dynamicRate);
  setMinRate((prev) => (prev === 0 ? dynamicRate : prev));
  setPriceDetails((prev) => ({
    ...prev,
    rate: dynamicRate,
  }));
}, [modules, selectedPackage, regionInfo.currency]);
useEffect(() => {
  const fetchPackages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/packages");
      setPackages(res.data);
      const pkg = res.data.find(
        (p) =>
          (p.name?.toLowerCase?.() || p.pkgName?.toLowerCase?.()) === selectedPlan.toLowerCase()
      );
      if (pkg) {
        setSelectedPackage(pkg);
        if (savedModules && savedModules.modules?.length > 0) {
          const dynamicRate = calculateRate(selectedPlan);
          setOriginalRate(dynamicRate);
          setPriceDetails((prev) => ({ ...prev, rate: dynamicRate }));
          return; 
        }
        const dynamicRate = modules.length ? calculateRate(pkg.name || pkg.pkgName) : 0;
        setOriginalRate(dynamicRate);
        setOriginalImplementationFee(pkg.implementationFee || 0);
        setPriceDetails((prev) => ({
          ...prev,
          rate: dynamicRate,
          implementationFee: pkg.implementationFee || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    }
  };
  fetchPackages();
}, [selectedPlan, modules, regionInfo.currency]);  
const totalEmployees = parseInt(whiteCollar || 0) + parseInt(blueCollar || 0) + parseInt(contract || 0);
const isValidTotal = isExploreModules ? true : totalEmployees >= minEmployees;
useEffect(() => {
  if (!selectedPackage) return;
  const billingDiscount = getBillingFrequencyDiscount();
  const baseRate = priceDetails.rate || 0;
  const ratePEPM = baseRate - (baseRate * billingDiscount) / 100;
  const effectiveEmployees = isExploreModules
  ? totalEmployees
  : totalEmployees < minEmployees
  ? minEmployees
  : totalEmployees;
  const monthlyPlatform = modulesAreDifferent ? calculateMonthlyPlatform() : ratePEPM * effectiveEmployees;
  let payrollFee = 0;
  if (addPayroll) {
    const regionName = regionInfo.name.toLowerCase();
    if (
      regionName.includes("middle east") || regionName.includes("africa") || regionName.includes("south east asia")
    ) {
      payrollFee = 165.06;
    } else {
      payrollFee = 25000;
    }
  }
  const totalMonthly = monthlyPlatform + payrollFee;
  const firstYearTotal = totalMonthly * 12;
  setPriceDetails((prev) => {
    const effectiveEmployees = isExploreModules
  ? totalEmployees
  : totalEmployees < minEmployees
  ? minEmployees
  : totalEmployees;
    const billingDiscount = getBillingFrequencyDiscount();
    const baseRate = discountedRate || originalRate;
    const finalRate = baseRate - (baseRate * billingDiscount) / 100;
    const monthlyPlatform = modulesAreDifferent ? calculateMonthlyPlatform() : finalRate * effectiveEmployees;
    const payrollFee = addPayroll ? regionInfo.name.toLowerCase().includes("middle east") || regionInfo.name.toLowerCase().includes("africa") || regionInfo.name.toLowerCase().includes("south east asia") ? 165.06 : 25000 : 0;
    const totalMonthly = monthlyPlatform + payrollFee;
    const firstYearTotal = totalMonthly * 12;
    let newImplementationFee = prev.userEditedFee ? prev.implementationFee : discountedImplementationFee > 0 ? discountedImplementationFee : monthlyPlatform * 3;
    newImplementationFee = applyAdditionalImplementationDiscount(newImplementationFee);
    if (
      prev.rate === (discountedRate || originalRate) &&
      prev.effectiveEmployees === effectiveEmployees &&
      prev.monthlyPlatform === monthlyPlatform &&
      prev.totalMonthly === totalMonthly &&
      prev.firstYearTotal === firstYearTotal &&
      prev.implementationFee === newImplementationFee
    ) {
      return prev;
    }
    return {
      ...prev,
      rate: finalRate,
      effectiveEmployees,
      monthlyPlatform,
      totalMonthly,
      firstYearTotal,
      implementationFee: newImplementationFee,
    };
  });
}, [
  totalEmployees,
  addPayroll,
  selectedPackage,
  minEmployees,
  discountedRate,
  discountedImplementationFee,
  originalRate,
  originalImplementationFee,
  regionInfo.name,
  billingFrequency
]);
const handleSaveModules = () => {
  if (!modulesAreDifferent) return;
  let newRate = 0;
  const selectedModulesData = modulesToAssign;
  Object.entries(moduleAssignments).forEach(([modId, employeeTypes]) => {
    const mod = selectedModulesData.find(
      (m) => String(m.modId) === String(modId)
    );
    if (!mod) return;
    const price = Number(mod.PriceINR || 0);
    if (employeeTypes.includes("White Collar")) {
      newRate += (Number(whiteCollar) || 0) * price;
    }
    if (employeeTypes.includes("Blue Collar")) {
      newRate += (Number(blueCollar) || 0) * price;
    }
    if (employeeTypes.includes("Contract")) {
      newRate += (Number(contract) || 0) * price;
    }
  });
  console.log("Calculated Rate:", newRate);
  setOriginalRate(newRate);
  setPriceDetails((prev) => ({
    ...prev,
    rate: newRate
  }));
};
const applyDiscount = async () => {
  if (!discountCode) return;
  try {
    const res = await axios.get(
      `http://localhost:5000/api/discounts/${discountCode}`
    );
    const discount = res.data;
    setDiscountDetails(discount);
    setDiscountError("");
    const discPercentage = discount.discPercentage || 0;
    const baseRate = originalRate || priceDetails.rate;
    const baseImplementationFee = priceDetails.implementationFee; // ✅ use current one, not original 0
    let newRate = baseRate;
    let newImplementationFee = baseImplementationFee;
    if (discount.discType === "Rate(PEPM)") {
      newRate = baseRate * (1 - discPercentage / 100);
    } else if (discount.discType === "One-Time Implementation Fee") {
      newImplementationFee = baseImplementationFee * (1 - discPercentage / 100);
    } else if (discount.discType === "Both") {
      newRate = baseRate * (1 - discPercentage / 100);
      newImplementationFee = baseImplementationFee * (1 - discPercentage / 100);
    }
    setDiscountedRate(+newRate.toFixed(2));
    setDiscountedImplementationFee(+newImplementationFee.toFixed(2));
    setPriceDetails((prev) => ({
      ...prev,
      rate: +newRate.toFixed(2),
      implementationFee: +newImplementationFee.toFixed(2),
    }));
  } catch (error) {
    console.error(error);
    setDiscountDetails(null);
    setDiscountError(
      error.response?.data?.message || "Invalid or expired discount code"
    );
  }
};  
const handleContinue = async () => {
  if (!isExploreModules && !isValidTotal) {
  alert(`Total employees must be at least ${minEmployees}`);
  return;
}
  try {
    const payload = {
      custId: `CUST-${Date.now()}`,
      custName: clientName,
      companyName,  
      industry,
      whiteCollar,
      blueCollar,
      contract,
      selectedPlan,
      rateINR: priceDetails.rate,
      implementationFee: priceDetails.implementationFee,
      custRegion: user?.custRegion || regionInfo.name || "India",
      currency: regionInfo.currency,
      custAddress: "Not Provided",
      custCHRO: user?.custName || "",
      custCHROPhone: "",
      custCHROEmail: user?.email || "",
      modules: moduleAssignments,
    };  
    // 🔥 Create Discount Breakdown (STEP-BY-STEP)
const baseRate = originalRate || priceDetails.rate;
const billingDiscount = getBillingFrequencyDiscount();
const discountPercent = discountDetails?.discPercentage || 0;

const discountBreakdown = [
  {
    label: "Base Price",
    amount: baseRate,
  },
  {
    label: "Billing Frequency Discount",
    percent: billingDiscount,
    amount: -((baseRate * billingDiscount) / 100),
  },
];

// 👉 Add discount code breakdown ONLY if applied
if (discountPercent > 0) {
  discountBreakdown.push({
    label: "Discount Code",
    percent: discountPercent,
    amount: -((baseRate * discountPercent) / 100),
  });
}
    localStorage.setItem(
      "clientInfo",
      JSON.stringify({
  ...payload,
  priceDetails: {
    ...priceDetails,
    discountBreakdown, // 🔥 ADD THIS
  },
})
    );
    localStorage.setItem(
      "moduleAssignments",
      JSON.stringify(moduleAssignments)
    );
    console.log("✅ Client info saved:", { ...payload, priceDetails });
    console.log("🚀 Payload being sent to backend:", payload);
    const res = await axios.post(
      "http://localhost:5000/api/customers/saveClientInformation",
      payload
    );
    console.log("Client Info Saved:", res.data);
    navigate("/contact-information");
  } catch (error) {
    console.error("Error saving client info:", error);
    alert("Failed to save client info. Check console for details.");
  }
};
return (
  <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 text-black">
    <Navbar user={user} />
    <main className="flex-grow pt-20 px-6 md:px-10">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-2 text-center">Client Information</h1>
      <p className="text-center text-gray-600 mb-1">
        Selected Plan:{" "}
        <span className="font-semibold text-blue-800">{selectedPlan}</span>
      </p>
      <p className="text-center text-gray-600 mb-10">
        Enter client details and workforce composition
      </p>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Company Details */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-blue-900 flex items-center mb-4">
            🏢 Company Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Company Name *
                </label>
                <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-12 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-gray-400"
                placeholder="Enter Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Client Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter Client Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Industry *
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Software">Software</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Travel and Tourism">Travel and Tourism</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Banking">Banking</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Insurance">Insurance</option>
                <option value="Construction">Construction</option>
                <option value="Engineering">Engineering</option>
                <option value="Logistics">Logistics</option>
                <option value="Transportation">Transportation</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Government">Government</option>
                <option value="Public Sector">Public Sector</option>
                <option value="Media">Media</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Energy">Energy</option>
                <option value="Utilities">Utilities</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Food Processing">Food Processing</option>
                <option value="Consulting">Consulting</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Automotive">Automotive</option>
                <option value="Non-Profit">Non-Profit</option>
                <option value="Aerospace">Aerospace</option>
                <option value="Defense">Defense</option>
              </select>
            </div>
          </div>
        </div>
        {/* Workforce Composition */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-blue-900 mb-4">
            👥 Workforce Composition
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                White Collar Employees
              </label>
              <input
                type="number"
                value={whiteCollar}
                onChange={(e) => setWhiteCollar(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Blue Collar / Frontline
              </label>
              <input
                type="number"
                value={blueCollar}
                onChange={(e) => setBlueCollar(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contract Workforce
              </label>
              <input
                type="number"
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl border border-blue-100 bg-blue-50">
            <p
              className={`text-lg font-semibold ${
                isValidTotal ? "text-blue-900" : "text-red-600"
              }`}>
            Total Employees:{" "}
            <span className="text-2xl font-bold">{totalEmployees}</span>
            </p>
            {source !== "exploreModules" && (
  <p
    className={`text-sm mt-1 ${
      isValidTotal ? "text-gray-600" : "text-red-500"
    }`}
  >
    * Minimum billing applies for {minEmployees} employees
  </p>
)}
          </div>
        </div>
        {/* Module Assignment UI */}
        {modulesAreDifferent && modules?.length > 0 && (
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mt-6">
            <div className="space-y-4">
              {/* Module Assignment UI */}
              {modulesAreDifferent && modulesToAssign.length > 0 && (
                <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mt-6">
                  <h2 className="text-lg font-bold text-blue-900 mb-4">📋 Assign Modules to Employee Types</h2>
                  {/* Header Row with Employee Types + Select All */}
                  <div className="grid grid-cols-4 gap-4 font-medium items-center mb-2 px-2">
                    <span>Module Name</span>
                    {["White Collar", "Blue Collar", "Contract"].map((type) => {
                      const allSelected = modulesToAssign.every(
                        (mod) => moduleAssignments[mod.modId]?.includes(type)
                      );
                      return (
                      <div key={type} className="flex items-center justify-center gap-2">
                        <span>{type}</span>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => {
                            setModuleAssignments((prev) => {
                              const updated = { ...prev };
                              modulesToAssign.forEach((mod) => {
                                const current = updated[mod.modId] || [];
                                if (allSelected) {
                                  updated[mod.modId] = current.filter((t) => t !== type);
                                } else {
                                  if (!current.includes(type)) {
                                    updated[mod.modId] = [...current, type];
                                  }
                                }
                              });
                              return updated;
                            });
                          }}
                          className="w-4 h-4 cursor-pointer"
                          />
                        </div>
                        );
                        })}
                      </div>
                      {/* Module Rows */}
                      <div className="space-y-2">
                        {modulesToAssign.map((mod) => (
                          <div key={mod.modId}className="grid grid-cols-4 gap-4 border rounded-lg items-center hover:bg-gray-50 transition">
                            <span className="font-medium p-2">{mod.modName}</span>
                            {["White Collar", "Blue Collar", "Contract"].map((type) => {
                              const isSelected = moduleAssignments[mod.modId]?.includes(type);
                              return (
                              <div key={type}
                                className="flex items-center justify-center cursor-pointer p-2"
                                onClick={() => {
                                  setModuleAssignments((prev) => {
                                    const currentTypes = prev[mod.modId] || [];
                                    let updatedTypes;
                                    if (currentTypes.includes(type)) {
                                      updatedTypes = currentTypes.filter((t) => t !== type);
                                    } else {
                                      updatedTypes = [...currentTypes, type];
                                    }
                                    return {
                                      ...prev,
                                      [mod.modId]: updatedTypes,
                                    };
                                  });
                                }}
                                >
                                <input
                                  type="checkbox"
                                  checked={isSelected || false}
                                  readOnly
                                  className="w-5 h-5"
                                />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Add Payroll */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-blue-900">
                Add Payroll Processing Services
              </h2>
              <p className="text-blue-700 text-sm">
                Managed payroll services with dedicated support
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={addPayroll}
                onChange={(e) => setAddPayroll(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
          {/* Price Preview */}
          <div className="bg-blue-950 text-white rounded-2xl shadow-lg p-6">
            {/* Billing Frequency */}
            <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Payment Frequency
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Monthly", "Quarterly", "Half-Yearly", "Annual"].map((freq) => (
                  <label
                    key={freq}
                    className={`flex items-center justify-center gap-2 border p-3 rounded-xl cursor-pointer transition-all duration-200
                    ${
                      billingFrequency === freq ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="billingFrequency"
                      value={freq}
                      checked={billingFrequency === freq}
                      onChange={(e) => setBillingFrequency(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="font-medium">{freq}</span>
                  </label>
                ))}
              </div>
            </div>
            <h2 className="text-lg font-bold mb-4">💰 Price Preview</h2>
            <div className="divide-y divide-blue-800"> 
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">
                  Rate (PEPM) ({billingFrequency})
                </span>
                <div className="text-green-600 text-sm">
                  Billing Frequency Discount: {getBillingFrequencyDiscount()}%
                </div>
                <div className="flex items-center gap-1">
                  <span>{currencySymbol}</span>
                  <input
                    type="text"
                    value={
                      priceDetails.rate === 0 && priceDetails.rate !== "" ? "" : priceDetails.rate
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                        setPriceDetails((prev) => ({
                          ...prev,
                          rate: val,
                          userEditedRate: true,
                        }));
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (isNaN(val) || e.target.value.trim() === "") {
                        setPriceDetails((prev) => ({
                          ...prev,
                          rate: minRate,
                        }));
                        return;
                      }
                      if (val < minRate) {
                        setPopupMessage(`Rate (PEPM) cannot be less than ₹${minRate}`);
                        setShowPopup(true);
                        setPriceDetails((prev) => ({
                          ...prev,
                          rate: minRate,
                        }));
                        return;
                      }
                      setPriceDetails((prev) => ({
                        ...prev,
                        rate: val,
                      }));
                    }}
                    placeholder="Enter Rate"
                    className="w-28 text-right text-blue-900 font-semibold border border-blue-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Effective Employees</span>
                <span className="font-semibold">
                  {priceDetails.effectiveEmployees.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Monthly Platform</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {modulesAreDifferent ? calculateMonthlyPlatform().toLocaleString() : ((discountedRate || priceDetails.rate) * priceDetails.effectiveEmployees).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Total Monthly</span>
                <span className="font-bold text-lg text white">
                  {currencySymbol}
                  {(
                    (modulesAreDifferent ? calculateMonthlyPlatform() : (discountedRate || priceDetails.rate) * priceDetails.effectiveEmployees) +
                    (addPayroll
                      ? regionInfo.name.toLowerCase().includes("middle east") ||
                      regionInfo.name.toLowerCase().includes("africa") ||
                      regionInfo.name.toLowerCase().includes("south east asia")
                      ? 165.06
                      : 25000
                      : 0
                    )
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-3 text-yellow-400 font-bold text-lg">
              <span>First Year Total</span>
              <span className="font-bold text-lg text-white-700">
                {currencySymbol}
                {(
                  ((modulesAreDifferent ? calculateMonthlyPlatform() : (discountedRate || priceDetails.rate) * priceDetails.effectiveEmployees) +
                  (addPayroll
                    ? regionInfo.name.toLowerCase().includes("middle east") ||
                    regionInfo.name.toLowerCase().includes("africa") ||
                    regionInfo.name.toLowerCase().includes("south east asia")
                    ? 165.06
                    : 25000
                    : 0
                  )) * 12
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-blue-300 mt-2 pt-2">
              <span className="font-medium text-white">
                One-Time Implementation Fee
              </span>
              <div className="flex items-center gap-2">
                <span>{currencySymbol}</span>
                <input
                  type="number"
                  value={discountedImplementationFee || priceDetails.implementationFee}
                  onChange={(e) =>
                    setPriceDetails((prev) => ({
                      ...prev,
                      implementationFee: parseFloat(e.target.value) || 0,
                      userEditedFee: true,
                    }))
                  }
                  className="w-32 text-right text-blue-900 font-semibold border border-yellow-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Employee Master & Policies Ready */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-300 flex flex-col md:flex-row items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={employeeMasterReady}
              onChange={(e) => setEmployeeMasterReady(e.target.checked)}
              className="w-4 h-4"
            />
            Is the Employee Master data prepared and up-to-date?
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={policiesReady}
              onChange={(e) => setPoliciesReady(e.target.checked)}
              className="w-4 h-4"
            />
            Have all relevant policies been finalized and approved?
          </label>
        </div>
        {/* Discount Code */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-300 flex items-center gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium mb-1">
              Discount Code
            </label>
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter discount code"
            />
            {discountError && (
              <p className="text-red-500 text-sm mt-1">{discountError}</p>
            )}
            {discountDetails && (
              <p className="text-green-600 text-sm mt-1">
                Discount applied: {discountDetails.discPercentage}% off{" "}
                {discountDetails.discType === "Rate(PEPM)"
                  ? "Rate (PEPM)"
                  : discountDetails.discType === "One-Time Implementation Fee"
                  ? "Implementation Fee"
                  : "Both"
                }
              </p>
            )}
          </div>
          <button
            onClick={applyDiscount}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Apply
          </button>
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
            onClick={handleContinue}
            disabled={!isExploreModules && !isValidTotal}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              isValidTotal
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
             Continue
          </button>
        </div>
      </div>
    </main>
  <Footer/>
  {showPopup && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h2 className="text-lg font-bold text-red-600 mb-3">⚠️ Validation Error</h2>
        <p className="text-gray-800 mb-4">{popupMessage}</p>
        <button
          onClick={() => setShowPopup(false)}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          OK
        </button>
      </div>
    </div>
  )}
  {showModuleQuestion && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-lg font-bold text-blue-900 mb-4">
          ℹ️ Module Configuration
        </h2>
        <p className="text-gray-700 mb-6">
          Are the modules different for Blue Collar, White Collar, and Contract employees?
        </p>
        <div className="flex justify-center gap-6">
          <button
            onClick={() => {
              setModulesAreDifferent(true);
              setShowModuleQuestion(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Yes
          </button>
          <button
            onClick={() => {
              setModulesAreDifferent(false);
              setShowModuleQuestion(false);
            }}
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition"
          >
            No
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
};

export default ClientInformation;

