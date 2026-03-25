import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import zinghrLogo from "../assets/Zing-Logo.png";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

const ProposalPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
   const [isEditing, setIsEditing] = useState(true);
  const params = new URLSearchParams(window.location.search);
const viewOnly = params.get("mode") === "view"; // true when opened by approver

  const [clientInfo, setClientInfo] = useState({});
  const [contactData, setContactData] = useState({
    client: { name: "-", email: "-", mobile: "-" },
    zinghr: { name: "-", email: "-", mobile: "-" },
  });
  const [packageFeatures, setPackageFeatures] = useState([]);
  const [planModules, setPlanModules] = useState([]);
  const [notOptedModules, setNotOptedModules] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState("not_submitted");
const [loadingApproval, setLoadingApproval] = useState(false);
const [pendingApprovals, setPendingApprovals] = useState([]);
const [showAgreement, setShowAgreement] = useState(false);
const [implementationFeePercent, setImplementationFeePercent] = useState(100); // 100%
const [recurringStartDays, setRecurringStartDays] = useState(30); // 30 days
const [projectKickoffDays, setProjectKickoffDays] = useState(10); // 10 working days
const [minEmployees, setMinEmployees] = useState(100); // 100 employees\
const [isDownloading, setIsDownloading] = useState(false);
const [annualInflationPercent, setAnnualInflationPercent] = useState(10); // 10%

  // ✅ Region and Currency Setup
const regionInfo = JSON.parse(localStorage.getItem("region")) || { name: "India", currency: "INR" };
const currencySymbol = regionInfo.currency === "USD" ? "$" : "₹";
//const INR_TO_USD_RATE = 1.94 / 175; // ≈ 0.0110857

 useEffect(() => {
  const info = JSON.parse(localStorage.getItem("clientInfo")) || {};
  const contacts = JSON.parse(localStorage.getItem("contactData")) || {
    client: { name: "-", email: "-", mobile: "-" },
    zinghr: { name: "-", email: "-", mobile: "-" },
  };

  // Convert rate to number safely
  if (info.priceDetails?.rate) {
    info.priceDetails.rate = Number(info.priceDetails.rate);
  }

  if (!info.custId) {
    console.error("❌ Client ID missing in localStorage");
    alert("Client ID is missing! Cannot send for approval.");
  }

  setClientInfo(info);
  setContactData(contacts);
}, []);

  const selectedPlan = clientInfo.selectedPlan || "ZingHR Pro Plus";
  const source = localStorage.getItem("source") || "package"; // 'exploreModules' or 'package'
const selectedModulesData =
  JSON.parse(localStorage.getItem("selectedModules")) || [];

const selectedModules = Array.isArray(selectedModulesData)
  ? selectedModulesData
  : selectedModulesData.modules || [];
const moduleAssignments =
  JSON.parse(localStorage.getItem("moduleAssignments")) || {};
  console.log("Selected Modules:", selectedModulesData);
  console.log("Module Assignments:", moduleAssignments);
  const modulesAreDifferent = Object.values(moduleAssignments).some(
  (types) => types && types.length > 0
);
  // ✅ Use saved pricing directly from ClientInformation
const price = clientInfo.priceDetails || {};
const discountBreakdown = price.discountBreakdown || [];  
let rate = price.rate || 0;
let implementationFee = price.implementationFee || 0;
const effectiveEmployees = price.effectiveEmployees || 0;
let monthlyPlatform = price.monthlyPlatform || 0;
let totalMonthly = Number(price.totalMonthly || 0);
let firstYearTotal = price.firstYearTotal || 0;

// Workforce data (optional display)
// ✅ Fetch employee counts safely from localStorage fields
const white =
  parseInt(clientInfo.empCountWhite || clientInfo.whiteCollar || clientInfo.workforce?.white || 0);
const blue =
  parseInt(clientInfo.empCountBlue || clientInfo.blueCollar || clientInfo.workforce?.blue || 0);
const contract =
  parseInt(clientInfo.empContract || clientInfo.contract || clientInfo.workforce?.contract || 0);

// ✅ Calculate effective employees properly
// ✅ Proposal and user details for approval process
//const proposalId = 1; // You can dynamically replace this later with actual ID from DB
//const customerId = clientInfo.custId || 101; // the client being pitched
//const salesPersonId = user?.custId || 201; // logged-in salesperson
//const region = regionInfo.name || "India";

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const agreementDate = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

  //const proposalNumber = `ZHR-${Math.floor(Math.random() * 100000000)}`;

  // Fetch package features
  useEffect(() => {
    const fetchPackageFeatures = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/packages`);
        const pkg = res.data.find(
          (p) =>
            p.name?.replace(/\s+/g, "").toLowerCase() ===
            selectedPlan.replace(/\s+/g, "").toLowerCase()
        );

        if (pkg) {
          const features = Array.isArray(pkg.description)
            ? pkg.description
            : pkg.description
            ? pkg.description
                .split(/[\n•,;]+/)
                .map((item) => item.trim())
                .filter((item) => item.length > 0)
            : [];
          setPackageFeatures(features);
        } else {
          setPackageFeatures([]);
        }
      } catch (err) {
        console.error("Error fetching package features:", err);
      }
    };

    fetchPackageFeatures();
  }, [selectedPlan]);

  // Fetch modules for selected plan
 useEffect(() => {
  const fetchModulesByPlan = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/modules`);
      console.log("📦 All modules:", res.data);

      const plan = selectedPlan.toLowerCase();

      // ✅ Included modules
      const included = res.data.filter((mod) => {
        if (plan.includes("pro plus")) return mod.pkgProPlus?.toLowerCase() === "included";
        if (plan.includes("pro") && !plan.includes("plus")) return mod.pkgPro?.toLowerCase() === "included";
        if (plan.includes("ghrowth")) return mod.pkgGrowth?.toLowerCase() === "included";
        return false;
      });

      // ✅ Not opted modules
      const notOpted = res.data.filter((mod) => {
        if (plan.includes("pro plus")) return mod.pkgProPlus?.toLowerCase() !== "included";
        if (plan.includes("pro") && !plan.includes("plus")) return mod.pkgPro?.toLowerCase() !== "included";
        return false; // GHROWTH: all included
      });

      console.log("✅ Included modules:", included);
      console.log("❌ Not opted modules:", notOpted);

      setPlanModules(included);
      setNotOptedModules(notOpted);
    } catch (err) {
      console.error("❌ Error fetching modules:", err);
    }
  };

  fetchModulesByPlan();
}, [selectedPlan]);
// 📄 Generate PDF as blob function
const generatePDF = async () => {
  try {
    // ✅ Temporarily show SaaS Agreement while generating PDF
const wasHidden = !showAgreement;
if (wasHidden) setShowAgreement(true);
await new Promise(resolve => setTimeout(resolve, 500)); // wait for render
    // ✅ Enter PDF mode (hide navbar, footer, buttons)
    document.body.classList.add("pdf-export");

    const element = document.querySelector("main");
    const html2pdf = (await import("html2pdf.js")).default;

    const filename = `ZingHR_Proposal_${clientInfo.custName || "Client"}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf("blob");
// ✅ Restore previous state after generating
if (wasHidden) setShowAgreement(false);
    // ✅ Restore UI
    document.body.classList.remove("pdf-export");
    return { pdfBlob, filename };
  } catch (err) {
    document.body.classList.remove("pdf-export");
    console.error("❌ Error generating PDF:", err);
    throw err;
  }
};

const handleDownloadPDF = async () => {
  try {
    setIsDownloading(true); // ✅ ADD THIS

    const wasHidden = !showAgreement;
    if (wasHidden) setShowAgreement(true);

    await new Promise(resolve => setTimeout(resolve, 500)); // wait for render

    document.body.classList.add("pdf-export");

    const element = document.querySelector("main");
    const html2pdf = (await import("html2pdf.js")).default;
    const filename = `ZingHR_Proposal_${clientInfo.custName || "Client"}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf("blob");

    // Upload logic (same)
    const storedProposalId = localStorage.getItem("proposalId");
    if (storedProposalId) {
      const formData = new FormData();
      formData.append("file", pdfBlob, filename);
      formData.append("proposalId", storedProposalId);

      await axios.post(`${BASE_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    // Download
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("❌ Error generating/downloading PDF:", error);
  } finally {
    document.body.classList.remove("pdf-export");
    setIsDownloading(false); // ✅ ADD THIS
  }
};

const handleSendForApproval = async () => {
  try {
    setLoadingApproval(true);

    console.log("Client info:", clientInfo);
    const storedClientInfo = JSON.parse(localStorage.getItem("clientInfo")) || {};
    const selectedPlan = storedClientInfo.selectedPlan || "ZingHR Pro Plus";
    const customerId = storedClientInfo.custId;
    console.log("🧠 DEBUG APPROVER LOGS:");
console.log("Region Name →", regionInfo.name);
console.log("Client Region →", clientInfo.custRegion);
console.log("Currency →", regionInfo.currency);
console.log("TotalMonthly →", price?.totalMonthly, totalMonthly);
console.log("Parsed Total →", Number(price?.totalMonthly || totalMonthly || 0));
    if (!selectedPlan || !customerId) {
      alert("Cannot submit for approval. Missing required fields.");
      setLoadingApproval(false);
      return;
    }

 // ✅ Determine approver based on region and thresholds
const clientRegion = (clientInfo.custRegion || regionInfo.name || "India").toLowerCase();
//const currency = regionInfo.currency || "INR";

// Always fetch the *latest* totalMonthly from all possible sources
const total =
  Number(price?.totalMonthly) ||
  Number(clientInfo?.priceDetails?.totalMonthly) ||
  Number(totalMonthly) ||
  0;

// ✅ Approver selection using array + thresholds
const allApprovers = [
  { custId: 2, name: "Prasad", region: "global", threshold: 500000 },
  { custId: 5, name: "Rohan Menon", region: "india", threshold: 0 },
  { custId: 3, name: "Chandru S", region: "mea", threshold: 0 },
  { custId: 4, name: "Rajat Luthra", region: "sea", threshold: 0 },
];

// Filter approvers for client region or global
const regionApprovers = allApprovers.filter(a =>
  clientRegion.includes(a.region.toLowerCase()) || a.region === "global"
);

// Select first approver whose threshold <= total
const selectedApprover = regionApprovers.find(a => total >= a.threshold);

// Fallback to salesperson if no match
const approverId = selectedApprover?.custId || user.custId;

console.log("🚨 Routed to", selectedApprover?.name || "Salesperson", `(custId: ${approverId})`);

    // 1️⃣ Create proposal in backend
    const response = await axios.post(
      `${BASE_URL}/api/approvals/create-proposal`,
      {
        customerId,
        planName: selectedPlan,
        region: JSON.parse(localStorage.getItem("region"))?.name || "India",
        clientInfo: storedClientInfo,
        salespersonId: user.custId,
        approverId,
         totalMonthly: price?.totalMonthly || totalMonthly || 0,
    totalMonthlyUSD:
      regionInfo.currency === "USD"
        ? price?.totalMonthly || totalMonthly || 0
        : 0,  // or actual USD value if applicable
      }
    );

    const newProposalId = response.data.proposalId;
const newCustomerId = response.data.customerId; // 👈 add this
localStorage.setItem("proposalId", newProposalId);


    // 2️⃣ Generate PDF **once**
    await new Promise((resolve) => setTimeout(resolve, 500)); // wait 0.5s for DOM to update
const { pdfBlob, filename } = await generatePDF();

    // 3️⃣ Upload PDF to backend
    const formData = new FormData();
    formData.append("file", pdfBlob, filename);
    formData.append("proposalId", newProposalId);

    const uploadRes = await axios.post(
      `${BASE_URL}/api/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    let numericCustomerId = customerId;

// If it starts with "CUST-", remove that part and keep only the number
if (typeof customerId === "string" && customerId.startsWith("CUST-")) {
  numericCustomerId = parseInt(customerId.replace("CUST-", ""), 10);
}

    // 4️⃣ Send to pending approvals
    await axios.post(`${BASE_URL}/api/approvals/pending-approvals`, {
  proposalId: newProposalId,
  customerId: newCustomerId,
  planName: selectedPlan,
  pdfUrl: uploadRes.data.filePath,
  totalMonthly: price?.totalMonthly || totalMonthly || 0,
  totalMonthlyUSD:
    regionInfo.currency === "USD"
      ? price?.totalMonthly || totalMonthly || 0
      : 0,
  currency: regionInfo.currency || "INR",
});


    // 5️⃣ Trigger local download of **same blob**
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setApprovalStatus("pending");
    alert("✅ Proposal submitted and PDF uploaded successfully!");

  } catch (error) {
    console.error("❌ Error submitting for approval:", error);
    alert("Failed to submit for approval.");
  } finally {
    setLoadingApproval(false);
  }
};

// ✅ Fetch approval status on load
useEffect(() => {
  const fetchStatus = async () => {
    try {
      const storedProposalId = localStorage.getItem("proposalId");

      // If no proposal has been sent yet, show default button
      if (!storedProposalId) {
        setApprovalStatus("not_submitted");
        return;
      }

      const res = await axios.get(
        `${BASE_URL}/api/approvals/status/${storedProposalId}`
      );

      const backendStatus = res.data?.status?.toLowerCase() || "not_submitted";
      setApprovalStatus(backendStatus);
    } catch (err) {
      console.error("Error fetching approval status:", err);
      setApprovalStatus("not_submitted");
    }
  };

  fetchStatus();
}, []);

// 🧹 Reset approval tracking when page loads new proposal
useEffect(() => {
  localStorage.removeItem("proposalId");  // forget any old proposal
  setApprovalStatus("not_submitted");     // reset button back to normal
}, []);

useEffect(() => {
  const fetchPendingApprovals = async () => {
    if (user?.role !== "approver") return;

    const regionInfo = JSON.parse(localStorage.getItem("region")) || {};
    const region = regionInfo.name || "India";

    try {
      const res = await axios.get(`${BASE_URL}/api/approvals/region`, {
        params: {
          approverId: user.custId,
          region,
        },
      });
      setPendingApprovals(res.data);
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
    }
  };

  fetchPendingApprovals();
}, [user]);

  return (
    <div className="relative min-h-screen bg-gray-50 text-black">
       <style>{printStyles}</style>
      <Navbar user={user} className="no-print" />
      {user.role === "approver" && !viewOnly && (
  <section className="mt-16 mb-10">
    

    {pendingApprovals.length > 0 ? (
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-blue-100 max-w-6xl mx-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-100 text-blue-900 font-semibold">
            <tr>
              <th className="p-3 text-left">Proposal ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Region</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((approval) => (
              <tr
                key={approval.id}
                className="border-b hover:bg-blue-50 transition-all"
              >
                <td className="p-3">{approval.proposalId}</td>
                <td className="p-3">{approval.custName}</td>
                <td className="p-3">{approval.custRegion}</td>
                <td className="p-3">{approval.planName}</td>
                <td className="p-3 font-semibold text-yellow-600">
                  {approval.status}
                </td>
                <td className="p-3 text-center">
                  <a
                    href={`${BASE_URL}${approval.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-center text-gray-600 mt-4">
        
      </p>
    )}
  </section>
)}    

      <main className="flex-grow pt-20 px-6 md:px-10 max-w-6xl mx-auto">
        {!viewOnly && (
        <div className="flex flex-wrap justify-end gap-3 no-print">
 <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
  {/* Left: Edit Details button */}
  <button
    onClick={() => navigate("/client-info")}
    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
  >
    <i className="ri-arrow-left-line text-lg"></i>
    <span>Edit Details</span>
  </button>

  {/* Right: Buttons */}
  {/* Right: Buttons */}
  {/* Send for Approval */}
  <button
    onClick={handleSendForApproval}
    disabled={
      approvalStatus === "pending" ||
      approvalStatus === "approved" ||
      loadingApproval
    }
    className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition-colors shadow-md ${
      approvalStatus === "pending"
        ? "bg-yellow-400 text-white cursor-not-allowed"
        : approvalStatus === "approved"
        ? "bg-green-600 text-white cursor-not-allowed"
        : "bg-blue-500 text-white hover:bg-blue-600"
    }`}
  >
    <i className="ri-send-plane-fill text-lg"></i>
    <span>
      {approvalStatus === "approved"
        ? "Approved"
        : approvalStatus === "pending"
        ? "Awaiting Approval"
        : loadingApproval
        ? "Sending..."
        : "Send for Approval"}
    </span>
  </button>

  {/* View Agreement (Toggle) */}
<button
  onClick={() => setShowAgreement(!showAgreement)}
  className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
>
  <i className="ri-file-list-2-line text-lg"></i>
  <span>{showAgreement ? "Hide Agreement" : "View Agreement"}</span>
</button>

  {/* Print Preview */}
  <button
    onClick={() => window.print()}
    className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
  >
    <i className="ri-eye-line text-lg"></i>
    <span>Print Preview</span>
  </button>

  {/* Download PDF */}
  <button
  onClick={handleDownloadPDF}
  className="flex items-center gap-2 px-5 py-2 rounded-md font-semibold bg-emerald-500 text-white hover:bg-emerald-600 shadow-md transition-colors"
>
  <i className="ri-download-2-line text-lg"></i>
  <span>Download PDF</span>
</button>
</div>
</div>
        )}

        {/* --- Gradient Header --- */}
        <div className="rounded-2xl shadow-md bg-gradient-to-r from-purple-600 to-purple-800 text-white flex flex-col md:flex-row justify-between items-start md:items-center p-6 mb-8">
          <div>
            <div className="flex items-center mb-2">
              <img
                src={zinghrLogo}
                alt="ZingHR Logo"
                className="w-28 h-auto mr-3"
              />
              <p className="text-sm opacity-90">Enterprise HCM Solutions</p>
            </div>
            <h2 className="text-2xl font-bold">Value Proposal</h2>
            <p className="text-md mt-1">
              Prepared for:{" "}
              <span className="font-semibold">{clientInfo.custName || "-"}</span>
            </p>
          </div>

          {/* Right-side plan info */}
          <div className="mt-4 md:mt-0 bg-purple-700 bg-opacity-50 px-6 py-3 rounded-xl text-right">
            <h3 className="font-semibold text-lg">{selectedPlan}</h3>
            <p className="text-sm opacity-90">Advanced HR Suite</p>
            <p className="text-sm mt-2">
              Date: {currentDate}
              <br />
            </p>
          </div>
        </div>

        {/* --- Executive Summary --- */}
<section className="bg-blue-50 rounded-xl shadow-sm p-6 mb-8 border border-blue-100">
  <h2 className="text-lg font-bold text-blue-900 mb-3">
    Executive Summary
  </h2>

  {source === "exploreModules" ? (
    // 🔹 Custom Modules Summary
    <p className="text-gray-800 text-sm leading-relaxed">
      This proposal outlines a <span className="font-semibold">custom ZingHR solution</span> designed specifically for{" "}
      <span className="font-semibold">{clientInfo.custName || "-"}</span> in the{" "}
      <span className="font-semibold">{clientInfo.industry || "Industry"}</span> sector.{" "}
      The solution includes a curated set of modules chosen to address your organization's unique HR and business requirements,{" "}
      supporting a workforce of{" "}
      <span className="font-semibold">{effectiveEmployees.toLocaleString()}</span> employees.{" "}
      These selected modules collectively enhance efficiency, compliance, and employee engagement across your operations.
    </p>
  ) : (
    // 🔹 Normal Package Summary
    <p className="text-gray-800 text-sm leading-relaxed">
      This proposal outlines the <span className="font-semibold">{selectedPlan}</span> solution for{" "}
      <span className="font-semibold">{clientInfo.custName || "-"}</span> in the{" "}
      <span className="font-semibold">{clientInfo.industry || "Industry"}</span> sector.{" "}
      The solution will serve{" "}
      <span className="font-semibold">{effectiveEmployees.toLocaleString()}</span> employees across your organization,{" "}
      providing comprehensive HR management capabilities including talent acquisition, workforce management, payroll processing,{" "}
      and employee engagement tools.
    </p>
  )}
</section>


       {/* --- Client Details --- */}
<section className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-200">
  <h2 className="text-xl font-bold text-blue-900 mb-6">Client Details</h2>

  {/* Organization Information & Workforce Breakdown */}
  <div className="grid md:grid-cols-2 gap-6 mb-6">
    {/* Organization Information */}
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <h3 className="text-md font-semibold text-gray-800 mb-2">Organization Information</h3>
      {[["Client Name", clientInfo.custName || "-"],
        ["Industry", clientInfo.industry || "-"],
        ["Region", regionInfo.name || clientInfo.custRegion || "India"]
      ].map(([label, value], idx) => (
        <div
          key={idx}
          className={`flex justify-between text-sm text-gray-700 py-2 px-4 transition-colors rounded ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
        >
          <span>{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>

    {/* Workforce Breakdown */}
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <h3 className="text-md font-semibold text-gray-800 mb-2">Workforce Breakdown</h3>
      {[["White Collar", white],
        ["Blue Collar / Frontline", blue],
        ["Contract Workforce", contract]
      ].map(([label, value], idx) => (
        <div
          key={idx}
          className={`flex justify-between text-sm text-gray-700 py-2 px-4 transition-colors rounded ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
        >
          <span>{label}</span>
          <span>{value}</span>
        </div>
      ))}
      <hr className="border-gray-300 my-2" />
      <div className="flex justify-between font-semibold text-gray-800 py-2 px-4 rounded hover:bg-gray-100">
        <span>Total Employees</span>
        <span>{effectiveEmployees}</span>
      </div>
    </div>
  </div>

 {/* Contact Information */}
<h2 className="text-xl font-bold text-blue-900 mb-6">Contact Information</h2>
<div className="grid md:grid-cols-2 gap-6">
  {/* Client SPOC */}
  <div className="bg-blue-50 border border-blue-100 rounded-xl shadow-inner">
    <p className="font-semibold text-blue-800 p-4 flex items-center gap-2 border-b border-blue-100">
      <span className="text-blue-600 text-lg">👤</span> Client SPOC
    </p>
    {[
      ["Name", contactData.client.name || "-"],
      ["Email", contactData.client.email || "-"],
      ["Mobile", contactData.client.mobile || "-"]
    ].map(([label, value], idx) => (
      <div
        key={idx}
        className={`flex justify-between text-sm text-gray-700 py-2 px-4 rounded transition-colors ${idx % 2 === 0 ? "bg-blue-50" : "bg-white"} hover:bg-blue-100`}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>
    ))}
  </div>

  {/* ZingHR SPOC */}
  <div className="bg-purple-50 border border-purple-100 rounded-xl shadow-inner">
    <p className="font-semibold text-purple-800 p-4 flex items-center gap-2 border-b border-purple-100">
      <span className="text-purple-600 text-lg">👤</span> ZingHR SPOC
    </p>
    {[
      ["Name", contactData.zinghr.name || "-"],
      ["Email", contactData.zinghr.email || "-"],
      ["Mobile", contactData.zinghr.mobile || "-"]
    ].map(([label, value], idx) => (
      <div
        key={idx}
        className={`flex justify-between text-sm text-gray-700 py-2 px-4 rounded transition-colors ${idx % 2 === 0 ? "bg-purple-50" : "bg-white"} hover:bg-purple-100`}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>
    ))}
  </div>
</div>
</section>

{/* --- Investment Summary --- */}
<section className="mb-8">
  <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
    <span className="text-green-600 text-xl">💰</span> Investment Summary
  </h2>

  {/* Monthly & Annual Summary Card */}
  <div className="bg-gray-900 text-white rounded-xl p-6 mb-3 grid md:grid-cols-2 gap-6">
    {/* Monthly Recurring */}
    <div className="space-y-2">
      <p className="text-sm text-gray-300 font-semibold uppercase mb-2">
        Monthly Recurring
      </p>
      <div className="flex justify-between">
        <span>Platform Rate (PEPM)</span>
        <span>{currencySymbol}{rate.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Billable Employees</span>
        <span>{effectiveEmployees.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Platform Monthly</span>
        <span>{currencySymbol}{monthlyPlatform.toLocaleString()}</span>
      </div>
      <hr className="border-gray-700 my-1" />
      <div className="flex justify-between font-semibold">
        <span>Total Monthly</span>
        <span>{currencySymbol}{totalMonthly.toLocaleString()}</span>
      </div>
    </div>

    {/* Annual Summary */}
    <div className="space-y-2">
      <p className="text-sm text-gray-300 font-semibold uppercase mb-2">
        Annual Summary
      </p>
      <div className="flex justify-between">
        <span>Annual Subscription (12 months)</span>
        <span>{currencySymbol}{firstYearTotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Customization Rate</span>
        <span>
  {regionInfo.currency === "USD" ? "$166.28" : "Rs. 15,000"} per effort day
</span>
      </div>
      <hr className="border-gray-700 my-1" />
      <div className="flex justify-between font-semibold text-yellow-400">
        <span>First Year Subscription</span>
        <span>{currencySymbol}{firstYearTotal.toLocaleString()}</span>
      </div>
    </div>
  </div>

  {/* 🔥 Discount Breakdown UI */}
{discountBreakdown.length > 0 && (
  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
    <h3 className="text-md font-semibold text-green-800 mb-2">
      🎉 Discounts Applied
    </h3>

    {discountBreakdown
  .filter(item => item.label !== "Base Price") // 🔥 REMOVE BASE PRICE
  .map((item, index) => (
    <div
      key={index}
      className="flex justify-between text-sm text-gray-700 py-1"
    >
      <span>{item.label}</span>

      <span className="text-green-700 font-medium">
        {item.percent ? `${item.percent}%` : ""}
      </span>
    </div>
))}

  </div>
)}

  {/* One-Time Implementation Cost */}
  <div className="border border-yellow-400 rounded-xl bg-yellow-50 p-4 flex justify-between items-center">
    <div>
      <p className="font-semibold text-yellow-800">One-Time Implementation Cost</p>
      <p className="text-sm text-yellow-700">Payable separately before go-live</p>
    </div>
    <p className="font-bold text-yellow-900 text-lg">
      {currencySymbol}{implementationFee.toLocaleString()}
    </p>
  </div>
</section>

{source !== "exploreModules" && (
  <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
    <h2 className="text-lg font-bold text-blue-900 mb-4">
      Plan Features - {selectedPlan}
    </h2>

    {packageFeatures.length > 0 ? (
      <ul className="grid md:grid-cols-2 gap-3">
        {packageFeatures.map((feature, index) => (
          <li
            key={index}
            className="flex items-center text-gray-700 text-sm leading-relaxed"
          >
            <span className="text-green-600 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-sm italic">
        Loading features or no package description found.
      </p>
    )}
  </section>
)}

{/* --- Modules Included / Selected Modules --- */}
{source === "exploreModules" ? (
  <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
    <h2 className="text-lg font-bold text-blue-900 mb-5">
      Selected Modules
    </h2>

    {modulesAreDifferent ? (
  (selectedModulesData?.modules || []).map((mod) => {
    const id = mod.modId || mod.id || mod.moduleId;
    const assignedTypes = moduleAssignments[id] || [];

    if (assignedTypes.length === 0) return null;

    return (
      <div key={id} className="p-4 border rounded mb-3">

        {/* 👇 Employee Types */}
        <div className="mb-2 flex flex-wrap gap-2">
          {assignedTypes.map((type) => (
            <span
              key={type}
              className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded"
            >
              {type}
            </span>
          ))}
        </div>

        {/* Module Name */}
        <h3 className="font-semibold text-blue-800">{mod.modName}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm">
          {mod.modFeatureList || mod.modDesc}
        </p>
      </div>
    );
  })
) : (
      Object.entries(
        (selectedModulesData?.modules || []).reduce((acc, mod) => {
          const category = mod.modObjective || "Other";
          if (!acc[category]) acc[category] = [];
          acc[category].push(mod);
          return acc;
        }, {})
      ).map(([category, modules]) => (
        <div key={category} className="mb-8">
          <div className="bg-blue-700 text-white px-4 py-2 rounded-t-lg font-semibold text-sm uppercase">
            {category}
          </div>

          <div className="border border-gray-200 border-t-0 rounded-b-lg">
            {modules.map((mod, idx) => (
              <div key={idx} className="p-4 border-b">
                <h3 className="font-semibold text-blue-800">{mod.modName}</h3>
                <p className="text-gray-600 text-sm">
                  {mod.modFeatureList || mod.modDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))
    )}
  </section>
) : (
  // ✅ When a package plan is chosen
  planModules.length > 0 && (
    <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
      <h2 className="text-lg font-bold text-blue-900 mb-5">
        Modules Included in {selectedPlan}
      </h2>
      {Object.entries(
        planModules.reduce((acc, mod) => {
          const category = mod.modObjective || "Other";
          if (!acc[category]) acc[category] = [];
          acc[category].push(mod);
          return acc;
        }, {})
      ).map(([category, modules]) => (
        <div key={category} className="mb-8">
          <div className="bg-blue-700 text-white px-4 py-2 rounded-t-lg font-semibold text-sm uppercase tracking-wide">
            {category}
          </div>
          <div className="border border-gray-200 border-t-0 rounded-b-lg">
            {modules.map((mod, idx) => (
              <div
                key={idx}
                className="flex flex-col border-b border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1 text-lg">✓</span>
                  <div>
                    <h3 className="font-semibold text-blue-800 text-base">
                      {mod.modName}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      {mod.modFeatureList ||
                        mod.modDesc ||
                        "No details available."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
)}

    {/* --- Modules Not Opted For (Styled like screenshot) --- */}
{source !== "exploreModules" &&
  notOptedModules.length > 0 &&
  !selectedPlan.toLowerCase().includes("ghrowth") && (
    <section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
    <h2 className="text-lg font-bold text-red-700 mb-2">
      Modules Not Opted For
    </h2>
    <p className="text-gray-500 text-sm mb-4">
      Available as upgrades in higher plans:
    </p>

    <div className="flex flex-wrap gap-3">
      {notOptedModules.map((mod, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
        >
          <span className="text-red-500 font-bold text-lg">✗</span>
          <span>{mod.modName}</span>
          {mod.modObjective && (
            <span className="text-gray-400 ml-1 text-xs">({mod.modObjective})</span>
          )}
        </div>
      ))}
    </div>

    {/* Fallback if all modules included */}
    {notOptedModules.length === 0 && (
      <p className="text-gray-500 text-sm italic mt-2">
        All modules are included in this plan.
      </p>
    )}
  </section>
)}

{/* --- Service Level Commitment (Updated style like screenshot) --- */}
<section className="mb-8">
  <h2 className="text-lg font-bold text-gray-800 mb-4">
    Service Level Commitment
  </h2>

  <div className="grid md:grid-cols-3 gap-4">
    {/* Uptime Guarantee */}
    <div className="bg-green-50 text-green-700 rounded-xl p-6 text-center shadow-sm">
      <p className="text-2xl font-bold">99.95%</p>
      <p className="text-sm mt-1 font-medium">Uptime Guarantee</p>
    </div>

    {/* Support Hours */}
    <div className="bg-blue-50 text-blue-700 rounded-xl p-6 text-center shadow-sm">
      <p className="text-2xl font-bold">9-7</p>
      <p className="text-sm mt-1 font-medium">Support Hours</p>
    </div>

    {/* Critical Support */}
    <div className="bg-purple-50 text-purple-700 rounded-xl p-6 text-center shadow-sm">
      <p className="text-2xl font-bold">24/7</p>
      <p className="text-sm mt-1 font-medium">Critical Support</p>
    </div>
  </div>
</section>

{/* --- Terms & Conditions --- */}
<section className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
  <h2 className="text-lg font-bold text-blue-900 mb-4">Terms & Conditions</h2>

  <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
    <li className="text-justify">
      To Get Started: On receipt of the formal Purchase Order, Cnergyis Infotech will raise Invoice for one-time non-refundable 
      {isDownloading ? (
  <span className="mx-1">{implementationFeePercent}%</span>
) : (
  <>
    <input
      type="number"
      value={implementationFeePercent}
      onChange={(e) => setImplementationFeePercent(Number(e.target.value))}
      className="w-20 border-b border-gray-400 text-center mx-1 outline-none bg-transparent"
    />
    %
    {" "}
  </>
)}
      implementation fee along with the Annual Recurring Rental to be paid in advance before the kick-start of the project.
    </li>

    <li className="text-justify">
      The regular Quarterly Recurring Rental billing (Invoice) starts from 
     {isDownloading ? (
  <span className="mx-1">{recurringStartDays}</span>
) : (
  <input
    type="number"
    value={recurringStartDays}
    onChange={(e) => setRecurringStartDays(Number(e.target.value))}
    className="w-20 border-b border-gray-400 text-center mx-1 outline-none bg-transparent"
  />
)}
      days or Go-Live from the project kick-off start date whichever is earlier.
    </li>

    <li className="text-justify">
      Project Kick-off will be carried out within 10 working days from the date of receipt of formal Purchase Order (PO), advance payments & signed copy of Online SaaS agreement.
    </li>

    <li className="text-justify">
      Invoicing: Subsequent Invoicing will be raised 15 days prior to the expiry of earlier billing period. All payments to be done through online RTGS/NEFT mode.
    </li>

    <li className="text-justify">
      Invoice will be raised on active employee counts for any given month + F&F settlement for the month.
    </li>

    <li className="text-justify">
      The above pricing is for minimum of 
     {isDownloading ? (
  <span className="mx-1">{minEmployees}</span>
) : (
  <input
    type="number"
    value={minEmployees}
    onChange={(e) => setMinEmployees(Number(e.target.value))}
    className="w-20 border-b border-gray-400 text-center mx-1 outline-none bg-transparent"
  />
)}
      employees mentioned in the pricing table. Should there be an increase in the number of active employees, invoice will be raised on actual employee count as per the slab pricing defined.
    </li>

    <li className="text-justify">
      Taxes will be extra and applicable as per the prevalent rates.
    </li>

    <li className="text-justify">
      Annual Inflation causes an annual price rise of 
      {isDownloading ? (
  <span className="mx-1">{annualInflationPercent}%</span>
) : (
  <>
    <input
      type="number"
      value={annualInflationPercent}
      onChange={(e) => setAnnualInflationPercent(Number(e.target.value))}
      className="w-20 border-b border-gray-400 text-center mx-1 outline-none bg-transparent"
    />
    %
    {" "}
  </>
)}
       effective from every 13th month onwards.
    </li>
  </ul>
</section>
        <div className="text-center text-gray-600 text-xs mb-10">
          © 2026 ZingHR Technologies Pvt. Ltd. | Enterprise HCM Solutions
          <br />
          www.zinghr.com | info@zinghr.com | 1800-233-6504
        </div>

        {/* --- SaaS Agreement Section --- */}
{showAgreement && (
  <section
  className="bg-white rounded-xl shadow-md p-8 mb-10 border border-gray-300 animate-fadeIn"
  style={{ pageBreakBefore: "always" }}
>
    <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">
      SaaS Agreement
    </h2>
    <p className="text-gray-700 text-sm leading-relaxed mb-2">
      <strong>FASTRACK SOFTWARE AS A SERVICE AGREEMENT</strong><br />
      <em>Version 1.0</em><br />
      <br />
      This Agreement is made on <strong>{agreementDate}</strong> ("Effective Date")<br />
      Each a 'Party' and collectively the "Parties".<br />
      <br />
      It is agreed as follows:
    </p>

    <div className="text-gray-700 text-sm leading-relaxed space-y-3">
      <p>
        <strong>1. DEFINITIONS AND INTERPRETATIONS</strong><br />
        In this Agreement unless the context requires otherwise the following words and phrases will have the meaning as defined in Schedule 1.
      </p>
      <p>
        <strong>2. MAINTENANCE AND SUPPORT SERVICES</strong><br />
        ZingHR agrees to provide the Maintenance and Support Services for the Software pursuant to this Agreement throughout the Term of the Agreement during the business hours (9am to 7pm) on standard working days ("Business Working Hours"), via its support portal or email. Each request for maintenance or support shall be raised as a support ticket.
      </p>
      <p>
        Availability: ZingHR shall ensure that the Software is functional in all material aspects 99.95% of the time during any monthly period.
      </p>
      <p>
        ZingHR shall regularly perform scheduled maintenance of the Software and other equipment and materials used for providing the Software. Such maintenance shall be communicated to the Customer at least five (5) days in advance, and shall occur outside of standard working hours, for not more than 15 hours in each quarter.
      </p>
      <p>
        <strong>3. INTELLECTUAL PROPERTY</strong><br />
        Both Parties agree that all Intellectual Property Rights in the Software, Documentation and ZingHR Material are retained by ZingHR. Nothing in this Agreement grants the Customer any right, title or interest in the Software, Documentation or ZingHR Material. All rights, title and interest in and to any Customer data and systems remain the property of the Customer.
      </p>
      <p>
        <strong>4. FEES</strong><br />
        In consideration of ZingHR carrying out and performing its obligations and the provision of the Services, the Customer shall pay ZingHR the Fees as set out in Schedule 1 - Proposal.
      </p>
      <p>
        <strong>5. TERM & TERMINATION</strong><br />
        This Agreement will commence on the Effective Date and shall automatically renew each year unless terminated by either Party. Upon termination, ZingHR will, at Customer's request, destroy or deliver all materials in its possession. The Customer may reactivate use of the Software within ninety (90) days upon payment of a reactivation fee.
      </p>
      <p>
        <strong>6. CONFIDENTIALITY</strong><br />
        Each Party will keep all Confidential Information confidential and use it only for the performance of its obligations under this Agreement.
      </p>
      <p>
        <strong>7. INDEMNITY AND LIABILITY</strong><br />
        ZingHR agrees to indemnify, defend and hold harmless the Customer from any amount awarded in favour of a third party by the final judgment of a court of competent jurisdiction.<br />
        <em>Limitation of liability:</em> ZingHR's liability for any loss or damage is limited to the Fees paid or payable in one (1) month prior to the claim.
      </p>
      <p>
        <strong>8. GOVERNING LAW & JURISDICTION</strong><br />
        This Agreement will be governed by the laws of India. If the Parties fail to resolve a dispute within thirty (30) days, the matter shall be referred to arbitration under the Indian Arbitration and Conciliation Act, 1996.
      </p>
    </div>
  </section>
)}


        {/* --- Footer --- */}
        
      </main>

      <Footer className="no-print" />
    </div>
  );
};
// Temporary style for printing / PDF
const printStyles = `
  @media print {
    .no-print {
      display: none !important;
    }
  }

  .pdf-export .no-print {
    display: none !important;
  }

  /* Force visibility and full contrast for all sections when exporting */
  section {
    opacity: 1 !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .animate-fadeIn {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
    input {
  display: inline-block;
}
`;

export default ProposalPage;
