import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ClientInformation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const selectedPlan = localStorage.getItem("selectedPlan") || "ZingHR PRO";

  // ✅ Region and Currency
  const regionInfo = JSON.parse(localStorage.getItem("region")) || {
    name: "India",
    currency: "INR",
  };
  // ✅ Get selected modules from ExploreModules
const savedModules = JSON.parse(localStorage.getItem("selectedModules")) || null;
const source = localStorage.getItem("source");
  const currencySymbol = regionInfo.currency === "USD" ? "$" : "₹";
  const INR_TO_USD_RATE = 1.94 / 175; // 1 INR = $0.0110857

  // ===== Hardcoded minimum employees per plan =====
  const planMinEmployees = {
    pro: 1000,
    proplus: 600,
    ghrowth: 500,
  };

  const normalizedPlan = selectedPlan.replace(/\s+/g, "").toLowerCase();
  let minEmployees = 1000; // default fallback

  if (normalizedPlan.includes("proplus")) {
    minEmployees = planMinEmployees.proplus;
  } else if (normalizedPlan.includes("ghrowth")) {
    minEmployees = planMinEmployees.ghrowth;
  } else if (normalizedPlan.includes("pro")) {
    minEmployees = planMinEmployees.pro;
  }
  // ========================================================================

  // ✅ State for packages from DB
  const [, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Client info
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [showPopup, setShowPopup] = useState(false);
const [popupMessage, setPopupMessage] = useState("");

  // Workforce inputs
  const [whiteCollar, setWhiteCollar] = useState(0);
  const [blueCollar, setBlueCollar] = useState(0);
  const [contract, setContract] = useState(0);

  // Payroll add-on toggle
  const [addPayroll, setAddPayroll] = useState(false);
  const [companyName, setCompanyName] = useState("");

  // Discount state
const [discountCode, setDiscountCode] = useState("");
const [discountDetails, setDiscountDetails] = useState(null);
const [discountError, setDiscountError] = useState("");
const [discountedRate, setDiscountedRate] = useState(0);
const [discountedImplementationFee, setDiscountedImplementationFee] = useState(0);
const [originalRate, setOriginalRate] = useState(0);
const [minRate, setMinRate] = useState(0);
const [originalImplementationFee, setOriginalImplementationFee] = useState(0);


  // Pricing state
  const [priceDetails, setPriceDetails] = useState({
    rate: 0,
    effectiveEmployees: minEmployees,
    monthlyPlatform: 0,
    totalMonthly: 0,
    firstYearTotal: 0,
    implementationFee: 0,
  });
  const [tempRate, setTempRate] = useState("");

  // ✅ Modules from DB
const [modules, setModules] = useState([]);

// ✅ Calculate Rate(PEPM)
const calculateRate = (packageName) => {
  // 🟦 CASE 2: Only when user came from ExploreModules
  if (source === "exploreModules" && savedModules?.modules?.length > 0) {
    const sumINR = savedModules.modules.reduce(
      (acc, mod) => acc + parseFloat(mod.PriceINR || 0),
      0
    );

    return regionInfo.currency === "USD"
      ? +(sumINR * INR_TO_USD_RATE).toFixed(2)
      : sumINR;
  }

  // 🟩 CASE 1: Normal flow based on plan
  if (!modules.length) return 0;

  let columnKey = "";
  const normalizedPlan = packageName.replace(/\s+/g, "").toLowerCase();
  if (normalizedPlan.includes("proplus")) columnKey = "pkgProPlus";
  else if (normalizedPlan.includes("ghrowth")) columnKey = "pkgGrowth";
  else columnKey = "pkgPro"; // default PRO

  const includedModules = modules.filter(
    (mod) => mod[columnKey]?.toLowerCase() === "included"
  );

  const sumINR = includedModules.reduce(
    (acc, mod) => acc + parseFloat(mod.PriceINR || 0),
    0
  );

  return regionInfo.currency === "USD"
    ? +(sumINR * INR_TO_USD_RATE).toFixed(2)
    : sumINR;
};

// ✅ Fetch modules
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

// ✅ Recalculate Rate(PEPM) whenever modules are loaded or package changes
useEffect(() => {
  if (!selectedPackage || !modules.length) return;

  const dynamicRate = calculateRate(selectedPackage.name || selectedPackage.pkgName);

  // ✅ Set originalRate every time for calculations
  setOriginalRate(dynamicRate);

  // ✅ Set minRate ONLY once (when still 0)
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
          (p.name?.toLowerCase?.() || p.pkgName?.toLowerCase?.()) ===
          selectedPlan.toLowerCase()
      );

      if (pkg) {
        setSelectedPackage(pkg);
        if (savedModules && savedModules.modules?.length > 0) {
  const dynamicRate = calculateRate(selectedPlan);
  setOriginalRate(dynamicRate);
  setPriceDetails((prev) => ({ ...prev, rate: dynamicRate }));
  return; // skip package-based logic
}

        // ✅ If modules are already loaded, calculate Rate(PEPM)
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



  // Calculate total employees
  const totalEmployees =
    parseInt(whiteCollar || 0) +
    parseInt(blueCollar || 0) +
    parseInt(contract || 0);

  // Validation: check if total meets minimum
  const isValidTotal = totalEmployees >= minEmployees;

  // ✅ Dynamic price calculation
  useEffect(() => {
  if (!selectedPackage) return;

  // Use discountedRate if applied
  const rate = discountedRate || originalRate || 0;

  const effectiveEmployees =
    totalEmployees < minEmployees ? minEmployees : totalEmployees;

  const monthlyPlatform = rate * effectiveEmployees;

  let payrollFee = 0;
  if (addPayroll) {
    const regionName = regionInfo.name.toLowerCase();
    if (
      regionName.includes("middle east") ||
      regionName.includes("africa") ||
      regionName.includes("south east asia")
    ) {
      payrollFee = 165.06;
    } else {
      payrollFee = 25000;
    }
  }

  const totalMonthly = monthlyPlatform + payrollFee;
  const firstYearTotal = totalMonthly * 12;

 setPriceDetails((prev) => {
  const effectiveEmployees =
    totalEmployees < minEmployees ? minEmployees : totalEmployees;
  const monthlyPlatform = (discountedRate || priceDetails.rate || originalRate) * effectiveEmployees;
  const totalMonthly = monthlyPlatform + (addPayroll
    ? regionInfo.name.toLowerCase().includes("middle east") ||
      regionInfo.name.toLowerCase().includes("africa") ||
      regionInfo.name.toLowerCase().includes("south east asia")
      ? 165.06
      : 25000
    : 0);
  const firstYearTotal = totalMonthly * 12;

  // ✅ Always recalculate if user hasn't manually changed implementation fee
  const newImplementationFee = prev.userEditedFee
    ? prev.implementationFee
    : discountedImplementationFee > 0
    ? discountedImplementationFee
    : monthlyPlatform * 3;

  return {
    ...prev,
    rate: discountedRate || priceDetails.rate || originalRate,
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
  priceDetails.rate,
]);

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

    // base values
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

    // ✅ Update discounted values
    setDiscountedRate(+newRate.toFixed(2));
    setDiscountedImplementationFee(+newImplementationFee.toFixed(2));

    // also update priceDetails for immediate UI update
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

  // ✅ Handle Continue button click
  const handleContinue = async () => {
    if (!isValidTotal) {
      alert(`Total employees must be at least ${minEmployees}`);
      return;
    }

    try {
     const payload = {
  custId: `CUST-${Date.now()}`,
  custName: clientName,
  companyName,  // ✅ Add this line
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
  custCHROPhone: "9876543210",
  custCHROEmail: user?.email || "",
};

      // ✅ Save to localStorage for ProposalPage
      // ✅ Include all price details
localStorage.setItem(
  "clientInfo",
  JSON.stringify({ ...payload, priceDetails })
);
console.log("✅ Client info saved:", { ...payload, priceDetails });

console.log("🚀 Payload being sent to backend:", payload);
      // ✅ Save to backend
      const res = await axios.post(
        "http://localhost:5000/api/customers/saveClientInformation",
        payload
      );

      console.log("Client Info Saved:", res.data);

      // Navigate to next page
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
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2 text-center">
          Client Information
        </h1>

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
    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
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
                }`}
              >
                Total Employees:{" "}
                <span className="text-2xl font-bold">{totalEmployees}</span>
              </p>
              <p
                className={`text-sm mt-1 ${
                  isValidTotal ? "text-gray-600" : "text-red-500"
                }`}
              >
                * Minimum billing applies for {minEmployees} employees
              </p>
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
  <h2 className="text-lg font-bold mb-4">💰 Price Preview</h2>
  <div className="divide-y divide-blue-800">
    <div className="flex justify-between items-center py-2">
  <span className="font-medium">Rate (PEPM)</span>
  <div className="flex items-center gap-1">
    <span>{currencySymbol}</span>
    <input
  type="text"
  value={
    priceDetails.rate === 0 && priceDetails.rate !== "" ? "" : priceDetails.rate
  }
  onChange={(e) => {
    const val = e.target.value;

    // ✅ Allow empty, digits, and decimals
    if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
      setPriceDetails((prev) => ({
        ...prev,
        rate: val, // keep as string while typing
        userEditedRate: true,
      }));
    }
  }}
  onBlur={(e) => {
  const val = parseFloat(e.target.value);

  // ✅ Empty or invalid → reset to original
  if (isNaN(val) || e.target.value.trim() === "") {
    setPriceDetails((prev) => ({
      ...prev,
      rate: minRate,
    }));
    return;
  }

  // ✅ If less than allowed minRate → show custom popup
  if (val < minRate) {
    setPopupMessage(`Rate (PEPM) cannot be less than ₹${minRate}`);
    setShowPopup(true);

    setPriceDetails((prev) => ({
      ...prev,
      rate: minRate,
    }));
    return;
  }

  // ✅ Valid new rate
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
        {(
          (discountedRate || priceDetails.rate) *
          priceDetails.effectiveEmployees
        ).toLocaleString()}
      </span>
    </div>
    <div className="flex justify-between py-2">
      <span className="font-medium">Total Monthly</span>
      <span className="font-semibold">
        {currencySymbol}
        {(
          (discountedRate || priceDetails.rate) *
            priceDetails.effectiveEmployees +
          (addPayroll
            ? regionInfo.name
                .toLowerCase()
                .includes("middle east") ||
              regionInfo.name.toLowerCase().includes("africa") ||
              regionInfo.name.toLowerCase().includes("south east asia")
              ? 165.06
              : 25000
            : 0)
        ).toLocaleString()}
      </span>
    </div>
    <div className="flex justify-between py-3 text-yellow-400 font-bold text-lg">
      <span>First Year Total</span>
      <span>
        {currencySymbol}
        {(
          ((discountedRate || priceDetails.rate) *
            priceDetails.effectiveEmployees +
            (addPayroll
              ? regionInfo.name
                  .toLowerCase()
                  .includes("middle east") ||
                regionInfo.name.toLowerCase().includes("africa") ||
                regionInfo.name.toLowerCase().includes("south east asia")
                ? 165.06
                : 25000
              : 0)) *
          12
        ).toLocaleString()}
      </span>
    </div>
  </div>
</div>

{/* One-Time Implementation Fee */}
<div className="bg-white shadow-md rounded-2xl p-6 border border-yellow-400">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h2 className="text-lg font-bold text-blue-900">
        One-Time Implementation Fee
      </h2>
      <p className="text-gray-600 text-sm">
        Payable separately before go-live
      </p>
    </div>
    <div className="text-right">
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
        className="text-blue-900 text-xl font-bold border border-yellow-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-yellow-400 outline-none w-36 text-right"
      />
    </div>
  </div>
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
          : "Both"}
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
              disabled={!isValidTotal}
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

      <Footer />
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
    </div>
  );
};

export default ClientInformation;

