import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageBreadcrumb from "../components/PageBreadcrumb";

const BASE_URL = process.env.REACT_APP_API_URL;

const ClientInformation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const selectedPlan = localStorage.getItem("selectedPlan") || "ZingHR PRO";
  const regionInfo = JSON.parse(localStorage.getItem("region")) || {
    name: "India",
    currency: "INR",
  };
  const conversionRate =
  regionInfo?.conversionValue && regionInfo?.conversionBaseINR
    ? Number(regionInfo.conversionValue) /
      Number(regionInfo.conversionBaseINR)
    : 1 / 83; // fallback
  const savedModules = React.useMemo(() => {
  const data = localStorage.getItem("selectedModules");
  return data ? JSON.parse(data) : null;
  }, []);
  const source = localStorage.getItem("source");
  const isExploreModules = source === "exploreModules";
  const currencySymbol = regionInfo.currency === "USD" ? "$" : "₹";
  const [isSlabPricing, setIsSlabPricing] = useState(false);

const [slabs, setSlabs] = useState([
  { from: 0, to: 1000, rate: 0 },
]);
  //const INR_TO_USD_RATE = 1.94 / 175;
  const planMinEmployees = {
    pro: 1000,
    proplus: 600,
    ghrowth: 500,
  };
  const breadcrumbItems = [
  { label: "Region", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Client", path: "/client-info" },
  { label: "Contacts", path: "/contact-information" },
  { label: "Proposal", path: "/proposal" }
];
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
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
 const savedDraft =
  JSON.parse(localStorage.getItem("clientInformationDraft")) || {};

const skipModuleQuestionOnce =
  localStorage.getItem("skipModuleQuestionOnce") === "true";

const [showModuleQuestion, setShowModuleQuestion] = useState(
  !skipModuleQuestionOnce
);

const [modulesAreDifferent, setModulesAreDifferent] = useState(
  savedDraft.modulesAreDifferent ?? false
);

const [moduleAssignments, setModuleAssignments] = useState(
  savedDraft.moduleAssignments || {}
);

const [clientName, setClientName] = useState(savedDraft.clientName || "");
const [industry, setIndustry] = useState(savedDraft.industry || "");
const [whiteCollar, setWhiteCollar] = useState(savedDraft.whiteCollar || 0);
const [blueCollar, setBlueCollar] = useState(savedDraft.blueCollar || 0);
const [contract, setContract] = useState(savedDraft.contract || 0);
const [addPayroll, setAddPayroll] = useState(savedDraft.addPayroll || false);
const [companyName, setCompanyName] = useState(savedDraft.companyName || "");
const [isReadinessCompleted, setIsReadinessCompleted] = useState(false);
useEffect(() => {
  const readinessOpened =
    localStorage.getItem("readinessOpenedForCurrentProposal") === "true";

  if (!readinessOpened) {
    localStorage.removeItem("implementationReadinessScore");
    localStorage.removeItem("implementationReadinessDiscount");
    localStorage.removeItem("implementationReadinessCompleted");
    localStorage.removeItem("readinessAppliedThisSession");

    setReadinessScore(0);
    setReadinessDiscount(0);
    setIsReadinessCompleted(false);
  }
}, []);
useEffect(() => {
  const readinessApplied =
    localStorage.getItem("readinessAppliedThisSession") === "true";

  if (!readinessApplied) {
    localStorage.removeItem("implementationReadinessScore");
    localStorage.removeItem("implementationReadinessDiscount");
    localStorage.removeItem("implementationReadinessCompleted");

    setReadinessScore(0);
    setReadinessDiscount(0);
    setIsReadinessCompleted(false);
  }
}, []);
const [discountCode, setDiscountCode] = useState(savedDraft.discountCode || "");
const [billingFrequency, setBillingFrequency] = useState(
  savedDraft.billingFrequency || "Monthly"
);
  const [discountDetails, setDiscountDetails] = useState(null);
  const getBillingFrequencyDiscount = () => {
  if (billingFrequency === "Monthly") return 0;
  if (billingFrequency === "Quarterly") return 3;
  if (billingFrequency === "Half-Yearly") return 4;
  if (billingFrequency === "Annual") return 5;
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
  const readinessCompletedFromStorage =
  localStorage.getItem("implementationReadinessCompleted") === "true";

const [readinessDiscount, setReadinessDiscount] = useState(
  readinessCompletedFromStorage
    ? Number(localStorage.getItem("implementationReadinessDiscount")) || 0
    : 0
);

const [readinessScore, setReadinessScore] = useState(
  readinessCompletedFromStorage
    ? Number(localStorage.getItem("implementationReadinessScore")) || 0
    : 0
);
useEffect(() => {
  const refreshReadiness = () => {
    const savedCompleted =
      localStorage.getItem("implementationReadinessCompleted") === "true";

    const savedDiscount = savedCompleted
      ? Number(localStorage.getItem("implementationReadinessDiscount")) || 0
      : 0;

    const savedScore = savedCompleted
      ? Number(localStorage.getItem("implementationReadinessScore")) || 0
      : 0;

    setReadinessDiscount(savedDiscount);
    setReadinessScore(savedScore);
    setIsReadinessCompleted(savedCompleted);
  };

  refreshReadiness();

  // 🔥 this is key → runs when user comes back
  window.addEventListener("pageshow", refreshReadiness);

  return () => window.removeEventListener("pageshow", refreshReadiness);
}, []);
useEffect(() => {
  const handleFocus = () => {
    const savedDiscount =
      Number(localStorage.getItem("implementationReadinessDiscount")) || 0;
    const savedScore =
      Number(localStorage.getItem("implementationReadinessScore")) || 0;
    const savedCompleted =
      localStorage.getItem("implementationReadinessCompleted") === "true";

    setReadinessDiscount(savedDiscount);
    setReadinessScore(savedScore);
    setIsReadinessCompleted(savedCompleted);
  };

  window.addEventListener("focus", handleFocus);
  return () => window.removeEventListener("focus", handleFocus);
}, []);
useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);
const applyAdditionalImplementationDiscount = (fee) => {
  if (!fee) return 0;
  return +(fee * (1 - readinessDiscount / 100)).toFixed(2);
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
  const getSlabBreakdown = () => {
  let remaining = totalEmployees;
  const billingDiscount = getBillingFrequencyDiscount();

  return slabs
    .map((slab) => {
      if (remaining <= 0) return null;

      const from = Number(slab.from || 0);
      const to = Number(slab.to || 0);
      const rate = Number(slab.rate || 0);

      const slabSize = to - from;
      const employeeCount = Math.min(remaining, slabSize);

      if (employeeCount <= 0) return null;

      const finalRate = rate - (rate * billingDiscount) / 100;
      const amount = employeeCount * finalRate;

      remaining -= employeeCount;

      return {
        range: `${from}-${from + employeeCount}`,
        rate,
        finalRate,
        employeeCount,
        amount,
      };
    })
    .filter(Boolean);
};

const calculateSlabPricing = () => {
  return getSlabBreakdown().reduce((sum, row) => sum + row.amount, 0);
};
  const calculateRate = (packageName) => {
    if (source === "exploreModules" && savedModules?.modules?.length > 0) {
      const sumINR = savedModules.modules.reduce(
        (acc, mod) => acc + parseFloat(mod.PriceINR || 0),
        0
      );
      return regionInfo.currency === "USD"
  ? +(sumINR * conversionRate).toFixed(2)
  : sumINR;
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
    return regionInfo.currency === "USD"
  ? +(sumINR * conversionRate).toFixed(2)
  : sumINR;
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
    return regionInfo.currency === "USD"
  ? +(rate * conversionRate).toFixed(2)
  : rate;
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
      const res = await axios.get(`${BASE_URL}/api/modules`); // adjust endpoint if needed
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
  if (localStorage.getItem("skipModuleQuestionOnce") === "true") {
    localStorage.removeItem("skipModuleQuestionOnce");
  }
}, []);

useEffect(() => {
  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/packages`);
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
    const regionName = regionInfo.name.toLowerCase();const monthlyPlatform = isSlabPricing
  ? calculateSlabPricing()
  : modulesAreDifferent
  ? calculateMonthlyPlatform()
  : ratePEPM * effectiveEmployees;
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
    const monthlyPlatform = isSlabPricing
  ? calculateSlabPricing()
  : modulesAreDifferent
  ? calculateMonthlyPlatform()
  : finalRate * effectiveEmployees;
    const payrollFee = addPayroll ? regionInfo.name.toLowerCase().includes("middle east") || regionInfo.name.toLowerCase().includes("africa") || regionInfo.name.toLowerCase().includes("south east asia") ? 165.06 : 25000 : 0;
    const totalMonthly = monthlyPlatform + payrollFee;
    const firstYearTotal = totalMonthly * 12;
    let baseImplementationFee = prev.userEditedFee
  ? prev.implementationFee
  : totalMonthly * 3;

// apply discount code only if discount is for implementation fee
if (discountedImplementationFee > 0 && !prev.userEditedFee) {
  baseImplementationFee = discountedImplementationFee;
}

let newImplementationFee = applyAdditionalImplementationDiscount(baseImplementationFee);
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
      rate: baseRate,
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
  billingFrequency,
  readinessDiscount,
  isSlabPricing,
slabs
]);
useEffect(() => {
  localStorage.setItem(
    "clientInformationDraft",
    JSON.stringify({
      clientName,
      industry,
      whiteCollar,
      blueCollar,
      contract,
      addPayroll,
      companyName,
      discountCode,
      billingFrequency,
      modulesAreDifferent,
      moduleAssignments,
    })
  );
}, [
  clientName,
  industry,
  whiteCollar,
  blueCollar,
  contract,
  addPayroll,
  companyName,
  discountCode,
  billingFrequency,
  modulesAreDifferent,
  moduleAssignments,
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
const getBasePepmRate = () => {
  return Number(discountedRate || priceDetails.rate || originalRate || 0);
};

const getRateForFrequency = (freq) => {
  const baseRate = getBasePepmRate();

  let discount = 0;
  if (freq === "Quarterly") discount = 3;
  if (freq === "Half-Yearly") discount = 4;
  if (freq === "Annual") discount = 5;

  const finalRate = baseRate - (baseRate * discount) / 100;
  return finalRate;
};

const getSelectedFrequencyRate = () => {
  return getRateForFrequency(billingFrequency);
};

const applyDiscount = async () => {
  if (!discountCode) return;
  try {
    const res = await axios.get(`${BASE_URL}/api/discounts/${discountCode}`)
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
      error.response?.data?.message || "Invalid or expired price optimization code"
    );
  }
};  
const handleContinue = async () => {
  if (!isReadinessCompleted) {
  setPopupMessage("ZingHR Implementation Readiness is mandatory to fill.");
  setShowPopup(true);
  return;
}
  if (!isExploreModules && !isValidTotal) {
  alert(`Total employees must be at least ${minEmployees}`);
  return;
}

  try {
    localStorage.setItem("source", source);
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
const readinessDiscountPercent = readinessDiscount || 0;

const discountBreakdown = [
  {
    label: "Base Price",
    amount: baseRate,
  },
  {
  label: "Billing Frequency Price Optimization",
    percent: billingDiscount,
    amount: -((baseRate * billingDiscount) / 100),
  },
];
if (readinessDiscountPercent > 0) {
  discountBreakdown.push({
    label: "Implementation Readiness Price Optimization",
    percent: readinessDiscountPercent,
    amount: "Applied on One-Time Implementation Fee",
  });
}

// 👉 Add discount code breakdown ONLY if applied
if (discountPercent > 0) {
  discountBreakdown.push({
    label: "Price Optimization Code",
    percent: discountPercent,
    amount: -((baseRate * discountPercent) / 100),
  });
}
    localStorage.setItem(
  "clientInfo",
  JSON.stringify({
    ...payload,
    billingFrequency, // ✅ ADD THIS
    isSlabPricing,
    slabs,
    readinessScore,
    readinessDiscount,
    priceDetails: {
      ...priceDetails,
      discountBreakdown,
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
      `${BASE_URL}/api/customers/saveClientInformation`,
      payload
    );
    console.log("Client Info Saved:", res.data);
    localStorage.removeItem("clientInformationDraft");
localStorage.removeItem("readinessOpenedForCurrentProposal");
localStorage.removeItem("readinessAppliedThisSession");
localStorage.removeItem("implementationReadinessScore");
localStorage.removeItem("implementationReadinessDiscount");
localStorage.removeItem("implementationReadinessCompleted");

navigate("/contact-information");
  } catch (error) {
    console.error("Error saving client info:", error);
    alert("Failed to save client info. Check console for details.");
  }
};
return (
  <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 text-black">
    <Navbar user={user} />
    <div className="pt-20 flex justify-center">
  <PageBreadcrumb items={breadcrumbItems} currentStep={2} />
</div>
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
{/* Slab Pricing */}
<div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mt-6">
  <h2 className="text-lg font-bold text-blue-900 mb-4">
    📊 Slab-wise Pricing
  </h2>

  <label className="flex items-center gap-2 mb-4">
    <input
      type="checkbox"
      checked={isSlabPricing}
      onChange={(e) => setIsSlabPricing(e.target.checked)}
    />
    Is slab-wise pricing applicable?
  </label>

  {isSlabPricing && (
    <div className="space-y-3">
      {slabs.map((slab, index) => (
        <div key={index} className="flex gap-3 items-center">
          <input
            type="number"
            placeholder="From"
            value={slab.from}
            onChange={(e) => {
              const updated = [...slabs];
              updated[index].from = Number(e.target.value);
              setSlabs(updated);
            }}
            className="w-24 border p-2 rounded"
          />

          <input
            type="number"
            placeholder="To"
            value={slab.to}
            onChange={(e) => {
              const updated = [...slabs];
              updated[index].to = Number(e.target.value);
              setSlabs(updated);
            }}
            className="w-24 border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Rate (PEPM)"
            value={slab.rate}
            onChange={(e) => {
              const updated = [...slabs];
              updated[index].rate = Number(e.target.value);
              setSlabs(updated);
            }}
            className="w-32 border p-2 rounded"
          />

          <button
            onClick={() =>
              setSlabs(slabs.filter((_, i) => i !== index))
            }
            className="text-red-500"
          >
            ❌
          </button>
        </div>
      ))}

      <button
        onClick={() =>
          setSlabs([...slabs, { from: 0, to: 0, rate: 0 }])
        }
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        + Add Slab
      </button>
    </div>
  )}
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

          {/* Implementation Readiness */}
<div className="bg-white shadow-md rounded-2xl p-6 border border-gray-300 mb-4">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h2 className="text-lg font-bold text-blue-900">
        ZingHR Implementation Readiness
      </h2>
      <p className="text-sm text-gray-600 mt-1">
  ZingHR Implementation Readiness is mandatory to fill before continuing.
</p>
{!isReadinessCompleted && (
  <p className="text-sm text-red-600 font-medium mt-2">
    ZingHR Implementation Readiness is mandatory to fill.
  </p>
)}

      {isReadinessCompleted && (readinessScore > 0 || readinessDiscount > 0) && (
        <div className="mt-3 flex flex-wrap gap-3">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            Readiness Score: {readinessScore}%
          </span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            Discount: {readinessDiscount}%
          </span>
        </div>
      )}
    </div>

    <button
      type="button"
      onClick={() => {
  localStorage.setItem(
    "clientInformationDraft",
    JSON.stringify({
      clientName,
      industry,
      whiteCollar,
      blueCollar,
      contract,
      addPayroll,
      companyName,
      discountCode,
      billingFrequency,
      modulesAreDifferent,
      moduleAssignments,
    })
  );
  localStorage.setItem("readinessOpenedForCurrentProposal", "true");
navigate("/implementation-readiness");
}}
      className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-sm"
    >
      Open Checklist
    </button>
  </div>
</div>
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
    className={`flex flex-col items-center justify-center gap-1 border p-3 rounded-xl cursor-pointer transition-all duration-200
    ${
      billingFrequency === freq
        ? "bg-blue-600 text-white border-blue-600 shadow-md"
        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50"
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

    {!isSlabPricing && (
  <span
    className={`text-xs font-semibold ${
      billingFrequency === freq ? "text-white" : "text-green-600"
    }`}
  >
    {currencySymbol}
    {Number(getRateForFrequency(freq)).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  </span>
)}  
  </label>
))}
              </div>
            </div>
            <h2 className="text-lg font-bold mb-4">💰 Price Preview</h2>
            <div className="divide-y divide-blue-800"> 
              {!isSlabPricing && (
  <div className="flex justify-between items-center py-2">
    <span className="font-medium">
      Rate (PEPM) ({billingFrequency})
    </span>
    <div className="text-green-600 text-sm">
      Billing Frequency Price Optimization: {getBillingFrequencyDiscount()}%
    </div>
    <div className="flex items-center gap-1">
      <span>{currencySymbol}</span>
      <input
        type="text"
        value={
          getSelectedFrequencyRate() === 0
            ? ""
            : Number(getSelectedFrequencyRate()).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
        }
        onChange={(e) => {
          const val = e.target.value.replace(/,/g, "");
          if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
            setPriceDetails((prev) => ({
              ...prev,
              rate: val,
              userEditedRate: true,
            }));
          }
        }}
        onBlur={(e) => {
          const rawValue = e.target.value.replace(/,/g, "");
          const val = parseFloat(rawValue);

          if (isNaN(val) || rawValue.trim() === "") {
            setPriceDetails((prev) => ({
              ...prev,
              rate: minRate,
            }));
            return;
          }

          if (val < minRate) {
            setPopupMessage(`Rate (PEPM) cannot be less than ${currencySymbol}${minRate}`);
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
            userEditedRate: true,
          }));
        }}
        placeholder="Enter Rate"
        className="w-28 text-right text-blue-900 font-semibold border border-blue-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
      />
    </div>
  </div>
)}
              <div className="flex justify-between py-2">
                <span className="font-medium">Effective Employees</span>
                <span className="font-semibold">
                  {priceDetails.effectiveEmployees.toLocaleString()}
                </span>
              </div>
              {isSlabPricing && (
  <div className="mt-4 bg-white text-black p-4 rounded-lg">
    <h3 className="font-bold mb-2">Slab Breakdown</h3>

    <table className="w-full text-sm border">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">Range</th>
          <th className="p-2">Rate (PEPM)</th>
          <th className="p-2">Employees</th>
          <th className="p-2">Amount</th>
        </tr>
      </thead>

      <tbody>
  {getSlabBreakdown().map((row, index) => {
    return (
      <tr key={index}>
        <td className="p-2">{row.range}</td>

        <td className="p-2">
          {currencySymbol}
          {Number(row.finalRate).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </td>

        <td className="p-2">{row.employeeCount}</td>

        <td className="p-2">
          {currencySymbol}
          {row.amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </td>
      </tr>
    );
  })}
</tbody>
    </table>
  </div>
)}
              <div className="flex justify-between py-2">
                <span className="font-medium">Monthly Platform</span>
                <span className="font-semibold">
                  {currencySymbol}
{Number(priceDetails.monthlyPlatform || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Total Monthly</span>
                <span className="font-bold text-lg text white">
                  {currencySymbol}
{Number(priceDetails.totalMonthly || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-3 text-yellow-400 font-bold text-lg">
              <span>First Year Total</span>
              <span className="font-bold text-lg text-white-700">
                {currencySymbol}
{Number(priceDetails.firstYearTotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-blue-300 mt-2 pt-2">
              <span className="font-medium text-white">
                One-Time Implementation Fee
              </span>
              <div className="flex items-center gap-2">
                <span>{currencySymbol}</span>
                <input
  type="text"
  value={
    priceDetails.implementationFee !== "" &&
    priceDetails.implementationFee !== null &&
    priceDetails.implementationFee !== undefined
      ? Number(String(priceDetails.implementationFee).replace(/,/g, "")).toLocaleString("en-IN")
      : ""
  }
  onChange={(e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (rawValue === "" || /^[0-9]*\.?[0-9]*$/.test(rawValue)) {
      setPriceDetails((prev) => ({
        ...prev,
        implementationFee: rawValue,
        userEditedFee: true,
      }));
    }
  }}
  onBlur={(e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    const val = parseFloat(rawValue);

    setPriceDetails((prev) => ({
      ...prev,
      implementationFee:
        rawValue.trim() === "" || isNaN(val)
          ? Number((prev.totalMonthly || 0) * 3).toFixed(2)
          : val,
    }));
  }}
  className="w-32 text-right text-blue-900 font-semibold border border-yellow-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-yellow-400 outline-none"
/>
              </div>
            </div>
          </div>
        </div>
        
        {/* Discount Code */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-300 flex items-center gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium mb-1">
              Price Optimization Code
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
  Price Optimization applied: {discountDetails.discPercentage}% off{" "}
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
  disabled={!isReadinessCompleted || (!isExploreModules && !isValidTotal)}
  className={`px-6 py-3 rounded-xl font-semibold transition ${
    isReadinessCompleted && (isExploreModules || isValidTotal)
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-300 text-gray-600 cursor-not-allowed"
  }`}
>
  Continue
</button>
        </div>
      </div>
    </main>
    <div className="flex justify-center">
  <PageBreadcrumb items={breadcrumbItems} currentStep={2} bottom />
</div>
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

    const existingDraft =
      JSON.parse(localStorage.getItem("clientInformationDraft")) || {};

    localStorage.setItem(
      "clientInformationDraft",
      JSON.stringify({
        ...existingDraft,
        modulesAreDifferent: true,
      })
    );
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
>
  Yes
</button>

<button
  onClick={() => {
    setModulesAreDifferent(false);
    setShowModuleQuestion(false);

    const existingDraft =
      JSON.parse(localStorage.getItem("clientInformationDraft")) || {};

    localStorage.setItem(
      "clientInformationDraft",
      JSON.stringify({
        ...existingDraft,
        modulesAreDifferent: false,
      })
    );
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

