import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./createProposal.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCalendarAlt, FaSignature, FaCogs } from "react-icons/fa";

const CreateProposal = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedPlan = JSON.parse(localStorage.getItem("selectedPlan")) || {};

  const [formData, setFormData] = useState({
    planName: selectedPlan.name || "",
    propDate: "",
    propVersion: "",
    custSignName: "",
    custSignDesig: "",
    custSignDate: "",
    modulesOpted: selectedPlan.description
      ? selectedPlan.description.join(", ")
      : "",
    billingFreq: "",
    clientName: "",
    companyName: "",
    industry: "",
    whiteCollar: "",
    blueCollar: "",
    contractWorkforce: "",
    totalEmployees: "",
  });

  const [setProposalId] = useState(null);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      updated.totalEmployees =
        Number(updated.whiteCollar || 0) +
        Number(updated.blueCollar || 0) +
        Number(updated.contractWorkforce || 0);
      return updated;
    });
  };
  const handleSubmit = async (e, returnOnly = false) => {
  if (e) e.preventDefault();
  try {
    const proposalData = {
      CustId: user?.custId || null,
      planName: formData.planName || "",
      propDate: formData.propDate || null,
      propVersion: formData.propVersion || null,
      custSignName: formData.custSignName || "",
      custSignDesig: formData.custSignDesig || "",
      custSignDate: formData.custSignDate || null,
      modulesOpted: JSON.stringify(
        (formData.modulesOpted || "")
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m)
      ),
      billingFreq: formData.billingFreq || null,
      clientName: formData.clientName || "",
      companyName: formData.companyName || "",
      industry: formData.industry || "",
      whiteCollar: Number(formData.whiteCollar) || 0,
      blueCollar: Number(formData.blueCollar) || 0,
      contractWorkforce: Number(formData.contractWorkforce) || 0,
      totalEmployees:
        Number(formData.whiteCollar || 0) +
        Number(formData.blueCollar || 0) +
        Number(formData.contractWorkforce || 0),
    };

    console.log("📨 Sending proposal data:", proposalData);

    const response = await axios.post(
      "http://localhost:5000/api/proposals",
      proposalData
    );

    console.log("✅ Response from backend:", response.data);

    const newProposalId = response?.data?.proposalId;
    setProposalId(newProposalId);

    if (!returnOnly) {
      alert(`✅ Proposal created successfully! (ID: ${newProposalId})`);

      // Reset the form if this is a normal save
      setFormData({
        planName: "",
        propDate: "",
        propVersion: "",
        custSignName: "",
        custSignDesig: "",
        custSignDate: "",
        modulesOpted: "",
        billingFreq: "",
        clientName: "",
        companyName: "",
        industry: "",
        whiteCollar: "",
        blueCollar: "",
        contractWorkforce: "",
        totalEmployees: "",
      });

      localStorage.removeItem("selectedPlan");
    }

    console.log("🆔 Returning proposalId:", newProposalId);
    return newProposalId; // ✅ returned for PDF generation
  } catch (error) {
    console.error("❌ Error creating proposal:", error.response?.data || error.message);
    alert("❌ Failed to create proposal. Please try again.");
    return null;
  }
};

  <div id="pdf-content" style={{ width: "190mm", padding: "15mm", fontFamily: "Arial", border: "1px solid #000" }}>
    <h1>{selectedPlan.name}</h1>
    <p>Client: {formData.clientName}</p>
    <p>Company: {formData.companyName}</p>
    <ul>
      {selectedPlan.description?.map((item, i) => (
        <li key={i}>{item}</li>
        ))}
    </ul>
  </div>
  
  const sendPendingApproval = async (proposalId, planName, pdfFileName, approverId) => {
  if (!proposalId || !approverId) return console.error("❌ Missing proposal ID or approver ID!");
  try {
    await axios.post("http://localhost:5000/api/approvals/pending-approvals", {
      proposalId,
      planName,
      pdfUrl: `/uploads/proposals/${pdfFileName}`, // matches DB column
      customerId: user?.custId,
      approverId
    });
    console.log("✅ Proposal sent for approval!");
  } catch (err) {
    console.error("❌ Failed to send pending approval:", err.response?.data || err.message);
  }
};

 const handleSaveAndGeneratePDF = async () => {
  try {
    // 1️⃣ Save full proposal
    const proposalId = await handleSubmit(null, true);
    if (!proposalId) return;

    // 2️⃣ Get content div
    const content = document.querySelector("form"); // capture the full form content
    if (!content) return alert("❌ Form content not found to generate PDF");

    window.scrollTo(0, 0);

    // 3️⃣ Convert form to image and generate PDF
    const canvas = await html2canvas(content, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const fileName = `Proposal_${proposalId}.pdf`;

    // 4️⃣ Convert PDF to Blob for uploading
    const pdfBlob = pdf.output("blob");

    // 5️⃣ Create FormData and append the PDF
    const formDataUpload = new FormData();
    formDataUpload.append("pdf", pdfBlob, fileName);
    formDataUpload.append("proposalId", proposalId);

    // 6️⃣ Upload PDF to backend
    await axios.post("http://localhost:5000/api/proposals/upload-pdf", formDataUpload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 7️⃣ Now send to pending approvals
    await sendPendingApproval(proposalId, selectedPlan.name, fileName, user.custId);

    alert("✅ Proposal saved, PDF generated, uploaded & sent for approval!");
  } catch (err) {
    console.error(err);
    alert("❌ Something went wrong. Check console.");
  }
};

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Sidebar + Navbar */}
      <Sidebar role={user.role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Navbar user={user} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Header */}
      <div className="w-full bg-gradient-to-r from-green-700 to-teal-600 text-white pt-20 pb-12 px-6 md:px-12 shadow-md">
        <div className="text-center max-w-5xl mx-auto space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Create Proposal
          </h1>
          <p className="text-lg opacity-90">
            Review your selected plan and fill in your proposal details below.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <main className="flex justify-center px-6 py-12">
        <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-10 border border-gray-200 space-y-10"
        >
          <div id="proposal-content"
          style={{
            width: "210mm",       // A4 width
            minHeight: "297mm",   // A4 height
            padding: "15mm",      // Safe margins
            backgroundColor: "white",
            color: "black",
            fontFamily: "Arial, sans-serif",
            boxSizing: "border-box",
            }}>

  {selectedPlan.name ? (
    <>
      {/* All your plan-specific modules here */}
          {/* Selected Plan at Top */}
          {selectedPlan.name && (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-300 shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-green-700 mb-3 text-center">
                Selected Plan: {selectedPlan.name}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 max-w-3xl mx-auto">
                {selectedPlan.description?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-green-600" /> {feature}
                  </li>
                ))}
              </ul>

              {/* Hardcoded MODULES INCLUDED for ZingHR Pro with card styling */}
              {selectedPlan.name.toLowerCase() === "zinghr pro" && (
                <div className="mt-6 text-gray-700 space-y-6">
                  <p className="font-bold text-xl text-green-700">MODULES INCLUDED</p>
                  
                  {/* Foundation Module */}
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
                    <p className="font-bold text-lg">1. Foundation</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Core HR Management:</strong> Organization Structure, Position Management, Employee master, Employee Dossier, Profile, Employee Self Service, Surveys (Pulse, Wellness), My Work, My Zone, My Growth, Helpdesk, Announcements, Employee Connect</li>
        <li><strong>Employee Profile & Service Book Management:</strong> Biodata, Service sheet, Family details & Nominations, Organ Donation, Languages Knowledge, Skills and Certifications, Learning Details, Communication & Contact details, Document Repository, Declarations, Code of Conduct</li>
      </ul>
    </div>

    {/* Talent Acquisition Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">2. Talent Acquisition</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Recruitment & ATS:</strong> Application tracking system, Planning & Budgeting, Job Posting, Sourcing, Onboarding, Interview Scheduling and assessment, Resume repository, Recruiter performance report, Document verification</li>
        <li><strong>Digital Onboarding:</strong> Integration with Background Verification Agencies, Pre-onboarding Learning, Digital Acceptance / Signatures, Onboarding Surveys</li>
      </ul>
    </div>

    {/* Organisation Management Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">3. Organisation Management</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Employee Life Cycle:</strong> Probation evaluation, Confirmation process and workflow, Transfer, Promotion, Deputation, Separation workflow and process management</li>
        <li><strong>Org 360 / Position Management:</strong> Position Creations based on Org Hierarchy, Org 360 view, Peer Positions creation, Tagging of Vacant, Resigned and Filled positions, Integrated with all Modules, Span of Control for multiple nodes</li>
        <li><strong>Letter Generation:</strong> Generate Letters with Self Service and HR service, Create standardized templates with logo/header-footer, Approval workflow for publishing letters, Generate letters in bulk, Protect & access letters in documents section, Trigger letters to emails with cc Manager/HR</li>
      </ul>
    </div>

    {/* Workforce Productivity Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">4. Workforce Productivity</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Workforce Management:</strong> Time and Attendance, Punch-In and Punch-Out (Web + Mobile), Geo Fencing & Heads-up, Shifts and Roster management, Location-wise, Region-wise Real time Attendance Dashboard, Time office, Online Attendance System (OASys), Leave Management, Absconding Workflow</li>
        <li><strong>Payroll:</strong> Intuitive Payroll cockpit, Input tool for HR team, Payroll Engine, Full & Final settlement, Statutory reports, JV for finance / e-pay slips, Bank transfer file generated online, Provision to hold or reverse salaries, External payment & deductions, Audit Trial / Maker checker</li>
        <li><strong>Travel, Claims & Reimbursements:</strong> Travel Itinerary, Intelligent claim recognition & 1-Click submissions, Claims and Advance, Eligibilities and Frequencies</li>
      </ul>
    </div>

    {/* Talent Management Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">5. Talent Management</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Performance Management System:</strong> Goals and Workflows, Balanced Score card - Perspectives, Competency Framework, Potential, 360 Degree Feedback, Bell Curve Analysis & 9Box Grid Matrix</li>
      </ul>
    </div>

    {/* Employee Engagement Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">6. Employee Engagement</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Rewards & Recognition:</strong> Peer to Peer Recognition, Manager to Employee Recognition, Milestone Celebrations, Recognition & Rewards Dashboards, Yearly awards, Moderator for publishing nomination, Jury committee for nomination, Smile points for badges</li>
        <li><strong>Employee Engagement & Culture:</strong> Surveys (Pulse, Wellness), My Work, My Zone, My Growth, My Social, My Social Groups, Digital Acceptance / Signatures, Onboarding Surveys</li>
      </ul>
    </div>

    {/* Business Enhancers Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">7. Business Enhancers</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Business Insights / Analytics:</strong> Reports, Report Builder, HR Analytics</li>
      </ul>
    </div>
    {/* Hardcoded MODULES NOT OPTED FOR for ZingHR Pro */}
{selectedPlan.name.toLowerCase() === "zinghr pro" && (
  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-6 mt-10 max-w-5xl mx-auto">
    <h3 className="text-2xl font-bold text-green-700 mb-4 text-center">
      MODULES NOT OPTED FOR
    </h3>
    <p className="text-gray-700 mb-6 text-center">
      Available as upgrades in higher plans:
    </p>
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
      <li className="flex items-center gap-2">
        <BsCheckCircleFill className="text-green-600" />
        <span>
          <strong>AI driven Talent Acquisition</strong> (Talent Acquisition)
        </span>
      </li>
      <li className="flex items-center gap-2">
        <BsCheckCircleFill className="text-green-600" />
        <span>
          <strong>Disciplinary Module</strong> (Organisation Management)
        </span>
      </li>
      <li className="flex items-center gap-2">
        <BsCheckCircleFill className="text-green-600" />
        <span>
          <strong>Zing Zero TAP (Patent pending)</strong> (Workforce Productivity)
        </span>
      </li>
      <li className="flex items-center gap-2">
        <BsCheckCircleFill className="text-green-600" />
        <span>
          <strong>Compensation Workbench</strong> (Workforce Productivity)
        </span>
      </li>
      <li className="flex items-center gap-2">
        <BsCheckCircleFill className="text-green-600" />
        <span>
          <strong>Learning Management System</strong> (Talent Management)
        </span>
      </li>
      <li className="flex items-center gap-2">
        <BsCheckCircleFill className="text-green-600" />
        <span>
          <strong>Succession Planning</strong> (Talent Management)
        </span>
      </li>
      <li className="flex items-center gap-2">
        <BsCheckCircleFill className="text-green-600" />
        <span>
          <strong>Workflow Engine</strong> (Business Enhancers)
        </span>
      </li>
      <li className="flex items-center gap-2">
        <BsCheckCircleFill className="text-green-600" />
        <span>
          <strong>AGENTIC</strong> (Agentic AI)
        </span>
      </li>
    </ul>
  </div>
)}
{/* Hardcoded Service Level Commitment for ZingHR Pro */}
{selectedPlan.name.toLowerCase() === "zinghr pro" && (
  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mt-10 max-w-5xl mx-auto">
    <h3 className="text-2xl font-bold text-green-700 mb-8 text-center">
      SERVICE LEVEL COMMITMENT
    </h3>
    <div className="flex flex-col sm:flex-row justify-around items-center gap-6 text-gray-700">
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Uptime Guarantee</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">99.95%</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Support Hours</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">9-7</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Critical Support</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">24/7</p>
      </div>
    </div>
  </div>
)}
{/* Terms & Conditions Section for ZingHR Pro */}
{selectedPlan.name.toLowerCase() === "zinghr pro" && (
  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mt-10 max-w-5xl mx-auto">
    <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
      TERMS & CONDITIONS
    </h3>
    <ul className="list-disc list-inside text-gray-700 space-y-2">
      <li>One-time implementation fee is payable separately before go-live</li>
      <li>Minimum billing applicable for 1,000 employees</li>
      <li>All prices are exclusive of applicable taxes (GST/VAT)</li>
      <li>Agreement auto-renews annually unless terminated with 90 days notice</li>
      <li>Customization services charged at Rs. 15,000 per effort day</li>
      <li>This proposal is valid for 30 days from the date of issue</li>
    </ul>
  </div>
)}
  </div>
)}
{/* ZingHR Pro Plus - Modules Included */}
{selectedPlan.name.toLowerCase() === "zinghr pro plus" && (
  <div className="mt-6 text-gray-700 space-y-6">
    <p className="font-bold text-xl text-green-700">MODULES INCLUDED</p>

    {/* 1. Foundation */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">1. Foundation</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Core HR Management:</strong> Organization Structure • Position Management • Employee master, Employee Dossier, Profile • Employee Self Service • Surveys (Pulse, Wellness) • My Work, My Zone, My Growth • Helpdesk, Announcements, Employee Connect</li>
        <li><strong>Employee Profile & Service Book Management:</strong> Biodata, Service sheet • Family details & Nominations • Organ Donation • Languages Knowledge • Skills and Certifications • Learning Details • Communication & Contact details • Document Repository • Declarations, Code of Conduct</li>
      </ul>
    </div>

    {/* 2. Talent Acquisition */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">2. Talent Acquisition</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Recruitment & ATS:</strong> Application tracking system • Planning & Budgeting •Job Posting • Sourcing • Onboarding • Interview Scheduling and assessment • Resume repository • Recruiter performance report • Document verification</li>
        <li><strong>Digital Onboarding:</strong> Integration with Background Verification Agencies • Pre-onboarding Learning • Digital Acceptance / Signatures • Onboarding Surveys</li>
      </ul>
    </div>

    {/* 3. Organisation Management */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">3. Organisation Management</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Employee Life Cycle:</strong> Probation evaluation • Confirmation process and workflow • Transfer, Promotion, Deputation • Separation workflow and process management</li>
        <li><strong>Org 360 / Position Management:</strong> Position Creations based on Org Hierarchy • Org 360 view • Peer Positions creation • Tagging of Vacant, Resigned and Filled positions • Integrated with all Modules • Span of Control for multiple nodes</li>
        <li><strong>Letter Generation:</strong> Generate Letters with Self Service and HR service • Create standardized templates with logo/header-footer • Approval workflow for publishing letters • Generate letters in bulk • Protect & access letters in documents section • Trigger letters to emails with cc Manager/HR</li>
        <li><strong>Disciplinary Module:</strong> Incident Reporting • Investigation Tracking • Panel Investigations • Linking to payroll reduction or hold • Serves as a compliance to labour law</li>
      </ul>
    </div>

    {/* 4. Workforce Productivity */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">4. Workforce Productivity</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Workforce Management:</strong> Time and Attendance • Punch-In and Punch-Out (Web + Mobile) • Geo Fencing & Heads-up • Shifts and Roster management • Location-wise, Region-wise Real time Attendance Dashboard • Time office • Online Attendance System (OASys) • Leave Management • Absconding Workflow</li>
        <li><strong>Payroll:</strong> Intuitive Payroll cockpit • Input tool for HR team • Payroll Engine • Full & Final settlement • Statutory reports • JV for finance / e-pay slips • Bank transfer file generated online • Provision to hold or reverse salaries • External payment & deductions • Audit Trial / Maker checker</li>
        <li><strong>Compensation Workbench:</strong> Increment Budgeting • Moderation and Pay Increment workflows • Linkage to Payroll</li>
        <li><strong>Travel, Claims & Reimbursements:</strong> Travel Itinerary • Intelligent claim recognition & 1-Click submissions • Claims and Advance • Eligibilities and Frequencies</li>
      </ul>
    </div>

    {/* 5. Talent Management */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">5. Talent Management</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Learning Management System:</strong> Categories and Courses Creation • Activities and Resources • SCORM • Reports • Gamification & Leaderboard</li>
        <li><strong>Performance Management System:</strong> Goals and Workflows • Balanced Score card - Perspectives • Competency Framework • Potential • 360 Degree Feedback • Bell Curve Analysis & 9Box Grid Matrix</li>
        <li><strong>Succession Planning:</strong> Identifying Critical Positions • Identifying Potential Successors • Developing Individual Development Plan • Integrated Learning Plan • Mentoring • Action Learning Projects</li>
      </ul>
    </div>

    {/* 6. Employee Engagement */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">6. Employee Engagement</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Rewards & Recognition:</strong> Peer to Peer Recognition • Manager to Employee Recognition • Milestone Celebrations • Recognition & Rewards Dashboards • Yearly awards • Moderator for publishing nomination • Jury committee for nomination • Smile points for badges</li>
        <li><strong>Employee Engagement & Culture:</strong> Surveys (Pulse, Wellness) • My Work, My Zone, My Growth, My Social • My Social Groups • Digital Acceptance / Signatures • Onboarding Surveys</li>
      </ul>
    </div>

    {/* 7. Business Enhancers */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">7. Business Enhancers</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Business Insights / Analytics:</strong> Reports • Report Builder • HR Analytics</li>
        <li><strong>Workflow Engine:</strong> Create own workflows • Approvals • Workflows: Loan, NOCs, etc.</li>
      </ul>
    </div>
  </div>
)}
{/* Hardcoded MODULES NOT OPTED FOR for ZingHR Pro Plus */}
{selectedPlan.name.toLowerCase() === "zinghr pro plus" && (
  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mt-10 max-w-5xl mx-auto space-y-6">
    <h3 className="text-2xl font-bold text-green-700 text-center">
      MODULES NOT OPTED FOR
    </h3>
    <p className="text-gray-700 text-center">
      Available as upgrades in higher plans:
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex items-start gap-3">
        <BsCheckCircleFill className="text-green-600 mt-1" />
        <span>
          <strong>AI driven Talent Acquisition</strong> (Talent Acquisition)
        </span>
      </div>
      <div className="flex items-start gap-3">
        <BsCheckCircleFill className="text-green-600 mt-1" />
        <span>
          <strong>Zing Zero TAP (Patent pending)</strong> (Workforce Productivity)
        </span>
      </div>
      <div className="flex items-start gap-3">
        <BsCheckCircleFill className="text-green-600 mt-1" />
        <span>
          <strong>AGENTIC</strong> (Agentic AI)
        </span>
      </div>
    </div>
  </div>
)}
{/* Hardcoded Service Level Commitment for ZingHR Pro Plus */}
{selectedPlan.name.toLowerCase() === "zinghr pro plus" && (
  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mt-6 max-w-5xl mx-auto">
    <h3 className="text-2xl font-bold text-green-700 mb-8 text-center">
      SERVICE LEVEL COMMITMENT
    </h3>
    <div className="flex flex-col sm:flex-row justify-around items-center gap-6 text-gray-700">
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Uptime Guarantee</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">99.95%</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Support Hours</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">9-7</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Critical Support</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">24/7</p>
      </div>
    </div>
  </div>
)}
{/* Hardcoded Terms & Conditions for ZingHR Pro Plus */}
{selectedPlan.name.toLowerCase() === "zinghr pro plus" && (
  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mt-6 max-w-5xl mx-auto">
    <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
      TERMS & CONDITIONS
    </h3>
    <ul className="list-disc list-inside text-gray-700 space-y-2">
      <li>One-time implementation fee is payable separately before go-live</li>
      <li>Minimum billing applicable for 1,000 employees</li>
      <li>All prices are exclusive of applicable taxes (GST/VAT)</li>
      <li>Agreement auto-renews annually unless terminated with 90 days notice</li>
      <li>Customization services charged at Rs. 15,000 per effort day</li>
      <li>This proposal is valid for 30 days from the date of issue</li>
    </ul>
  </div>
)}
   </div>
          )}
          {/* Hardcoded MODULES INCLUDED for ZingHR Ghrowth */}
{selectedPlan.name.toLowerCase() === "zinghr ghrowth" && (
  <div className="mt-6 text-gray-700 space-y-6">
    <p className="font-bold text-xl text-green-700">MODULES INCLUDED</p>

    {/* Foundation Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">1. Foundation</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Core HR Management:</strong> Organization Structure, Position Management, Employee master, Employee Dossier, Profile, Employee Self Service, Surveys (Pulse, Wellness), My Work, My Zone, My Growth, Helpdesk, Announcements, Employee Connect</li>
        <li><strong>Employee Profile & Service Book Management:</strong> Biodata, Service sheet, Family details & Nominations, Organ Donation, Languages Knowledge, Skills and Certifications, Learning Details, Communication & Contact details, Document Repository, Declarations, Code of Conduct</li>
      </ul>
    </div>

    {/* Talent Acquisition Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">2. Talent Acquisition</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Recruitment & ATS:</strong> Application tracking system, Planning & Budgeting, Job Posting, Sourcing, Onboarding, Interview Scheduling and assessment, Resume repository, Recruiter performance report, Document verification</li>
        <li><strong>Digital Onboarding:</strong> Integration with Background Verification Agencies, Pre-onboarding Learning, Digital Acceptance / Signatures, Onboarding Surveys</li>
        <li><strong>AI driven Talent Acquisition:</strong> AI powered Resume Parser, AI powered Stack Ranking, AI powered Agentic Interviews, Reduces Cost of Hiring by over 45%, Reduces Time to Hire by over 60%</li>
      </ul>
    </div>

    {/* Organisation Management Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">3. Organisation Management</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Employee Life Cycle:</strong> Probation evaluation, Confirmation process and workflow, Transfer, Promotion, Deputation, Separation workflow and process management</li>
        <li><strong>Org 360 / Position Management:</strong> Position Creations based on Org Hierarchy, Org 360 view, Peer Positions creation, Tagging of Vacant, Resigned and Filled positions, Integrated with all Modules, Span of Control for multiple nodes</li>
        <li><strong>Letter Generation:</strong> Generate Letters with Self Service and HR service, Create standardized templates with logo/header-footer, Approval workflow for publishing letters, Generate letters in bulk, Protect & access letters in documents section, Trigger letters to emails with cc Manager/HR</li>
        <li><strong>Disciplinary Module:</strong> Incident Reporting, Investigation Tracking, Panel Investigations, Linking to payroll reduction or hold, Serves as a compliance to labour law</li>
      </ul>
    </div>

    {/* Workforce Productivity Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">4. Workforce Productivity</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Workforce Management:</strong> Time and Attendance, Punch-In and Punch-Out (Web + Mobile), Geo Fencing & Heads-up, Shifts and Roster management, Location-wise, Region-wise Real time Attendance Dashboard, Time office, Online Attendance System (OASys), Leave Management, Absconding Workflow</li>
        <li><strong>Payroll:</strong> Intuitive Payroll cockpit, Input tool for HR team, Payroll Engine, Full & Final settlement, Statutory reports, JV for finance / e-pay slips, Bank transfer file generated online, Provision to hold or reverse salaries, External payment & deductions, Audit Trial / Maker checker</li>
        <li><strong>Zing Zero TAP (Patent pending):</strong> Real time Attendance, Zero Touch Time, Attendance and Payroll, Month end data collation - ALL GONE, Real time Payroll, Monthly / Semi monthly / Daily / Hourly / Piece-Rate wages, Improves Productivity, Improves Transparency and Governance, Potential to enhance EBIDTA Margins</li>
        <li><strong>Compensation Workbench:</strong> Increment Budgeting, Moderation and Pay Increment workflows, Linkage to Payroll</li>
        <li><strong>Travel, Claims & Reimbursements:</strong> Travel Itinerary, Intelligent claim recognition & 1-Click submissions, Claims and Advance, Eligibilities and Frequencies</li>
      </ul>
    </div>

    {/* Talent Management Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">5. Talent Management</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Learning Management System:</strong> Categories and Courses Creation, Activities and Resources, SCORM, Reports, Gamification & Leaderboard</li>
        <li><strong>Performance Management System:</strong> Goals and Workflows, Balanced Score card - Perspectives, Competency Framework, Potential, 360 Degree Feedback, Bell Curve Analysis & 9Box Grid Matrix</li>
        <li><strong>Succession Planning:</strong> Identifying Critical Positions, Identifying Potential Successors, Developing Individual Development Plan, Integrated Learning Plan, Mentoring, Action Learning Projects</li>
      </ul>
    </div>

    {/* Employee Engagement Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">6. Employee Engagement</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Rewards & Recognition:</strong> Peer to Peer Recognition, Manager to Employee Recognition, Milestone Celebrations, Recognition & Rewards Dashboards, Yearly awards, Moderator for publishing nomination, Jury committee for nomination, Smile points for badges</li>
        <li><strong>Employee Engagement & Culture:</strong> Surveys (Pulse, Wellness), My Work, My Zone, My Growth, My Social, My Social Groups, Digital Acceptance / Signatures, Onboarding Surveys</li>
      </ul>
    </div>

    {/* Business Enhancers Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">7. Business Enhancers</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>Business Insights / Analytics:</strong> Reports, Report Builder, HR Analytics</li>
        <li><strong>Workflow Engine:</strong> Create own workflows, Approvals, Workflows: Loan, NOCs, etc.</li>
      </ul>
    </div>

    {/* Agentic AI Module */}
    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm space-y-2">
      <p className="font-bold text-lg">8. Agentic AI</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li><strong>AGENTIC:</strong> Agentic - for HR Policies, Agentic - for Time & Attendance, Agentic - for Travel, Agentic - Employee Queries, Agentic - Recruitment, Agentic - Performance Management, Agentic - MDs / Boards Insights, Agentic - CEOs Insights, Agentic - CHROs Insights, Agentic - CFOs Insights, Agentic - HR Leads Insights, Agentic - Employee's Insights, AI based Knowledge Bots</li>
      </ul>
    </div>
    {/* Hardcoded Service Level Commitment for ZingHR GHROWTH */}
{selectedPlan.name.toLowerCase() === "zinghr ghrowth" && (
  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mt-6 max-w-5xl mx-auto">
    <h3 className="text-2xl font-bold text-green-700 mb-8 text-center">
      SERVICE LEVEL COMMITMENT
    </h3>
    <div className="flex flex-col sm:flex-row justify-around items-center gap-6 text-gray-700">
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Uptime Guarantee</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">99.95%</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Support Hours</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">9-7</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Critical Support</p>
        <p className="text-3xl font-extrabold text-green-700 mt-2">24/7</p>
      </div>
    </div>
  </div>
)}
{/* Hardcoded Terms & Conditions for ZingHR GHROWTH */}
{selectedPlan.name.toLowerCase() === "zinghr ghrowth" && (
  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mt-6 max-w-5xl mx-auto">
    <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
      TERMS & CONDITIONS
    </h3>
    <ul className="list-disc list-inside text-gray-700 space-y-2">
      <li>One-time implementation fee is payable separately before go-live</li>
      <li>Minimum billing applicable for 1,000 employees</li>
      <li>All prices are exclusive of applicable taxes (GST/VAT)</li>
      <li>Agreement auto-renews annually unless terminated with 90 days notice</li>
      <li>Customization services charged at Rs. 15,000 per effort day</li>
      <li>This proposal is valid for 30 days from the date of issue</li>
    </ul>
  </div>
)}

  </div>
)}
   {/* Company Details */}
<section className="border rounded-xl p-6 shadow-sm bg-gray-50">
  <div className="flex items-center gap-3 mb-6 border-b pb-2">
    <FaCogs className="text-green-600 text-xl" />
    <h2 className="text-xl font-bold text-green-700">Company Details</h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Client Name */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Client Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="clientName"
        value={formData.clientName || ""}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
        placeholder="Enter client name"
        required
      />
    </div>

    {/* Company Name */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Company Name
      </label>
      <input
        type="text"
        name="companyName"
        value={formData.companyName || ""}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
        placeholder="Enter company name"
      />
    </div>

    {/* Industry */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Industry <span className="text-red-500">*</span>
      </label>
      <select
  name="industry"
  value={formData.industry || ""}
  onChange={handleChange}
  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
  required
>
  <option value="">Select Industry</option>

  {/* IT & Technology */}
  <option value="Information Technology">Information Technology</option>
  <option value="Software Development">Software Development</option>
  <option value="Telecommunications">Telecommunications</option>
  <option value="Electronics">Electronics</option>

  {/* Manufacturing & Engineering */}
  <option value="Automotive">Automotive</option>
  <option value="Aerospace">Aerospace</option>
  <option value="Heavy Machinery">Heavy Machinery</option>
  <option value="Textiles">Textiles</option>
  <option value="Chemicals">Chemicals</option>

  {/* Services */}
  <option value="Banking and Finance">Banking and Finance</option>
  <option value="Insurance">Insurance</option>
  <option value="Consulting">Consulting</option>
  <option value="Real Estate">Real Estate</option>
  <option value="Hospitality">Hospitality</option>
  <option value="Tourism and Travel">Tourism and Travel</option>

  {/* Healthcare & Education */}
  <option value="Healthcare">Healthcare</option>
  <option value="Pharmaceuticals">Pharmaceuticals</option>
  <option value="Biotechnology">Biotechnology</option>
  <option value="Education">Education</option>
  <option value="Research and Development">Research and Development</option>

  {/* Infrastructure & Logistics */}
  <option value="Construction">Construction</option>
  <option value="Logistics and Supply Chain">Logistics and Supply Chain</option>
  <option value="Energy and Utilities">Energy and Utilities</option>
  <option value="Oil and Gas">Oil and Gas</option>
  <option value="Transportation">Transportation</option>

  {/* Retail & Consumer */}
  <option value="Retail">Retail</option>
  <option value="FMCG">Fast Moving Consumer Goods (FMCG)</option>
  <option value="E-commerce">E-commerce</option>
  <option value="Fashion">Fashion</option>
  <option value="Food and Beverage">Food and Beverage</option>

  {/* Media & Government */}
  <option value="Media and Entertainment">Media and Entertainment</option>
  <option value="Government and Public Sector">Government and Public Sector</option>
  <option value="Non-Profit">Non-Profit</option>

  {/* Default */}
  <option value="Other">Other</option>
</select>
 {formData.industry === "Other" && (
    <input
      type="text"
      name="otherIndustry"
      value={formData.otherIndustry}
      onChange={handleChange}
      className="mt-3 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
      placeholder="Please specify your industry"
      required
    />
  )}
    </div>
  </div>

  {/* Workforce Composition */}
  <div className="mt-8">
    <h3 className="text-lg font-bold text-green-700 mb-4">
      Workforce Composition
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          White Collar Employees
        </label>
        <input
          type="number"
          name="whiteCollar"
          value={formData.whiteCollar || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Blue Collar / Frontline
        </label>
        <input
          type="number"
          name="blueCollar"
          value={formData.blueCollar || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Contract Workforce
        </label>
        <input
          type="number"
          name="contractWorkforce"
          value={formData.contractWorkforce || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Total Employees
        </label>
        <input
          type="number"
          name="totalEmployees"
          value={
            formData.totalEmployees ||
            (Number(formData.whiteCollar || 0) +
              Number(formData.blueCollar || 0) +
              Number(formData.contractWorkforce || 0))
          }
          readOnly
          className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 focus:outline-none"
        />
      </div>
    </div>
  </div>
</section>
       
          {/* Proposal Details */}
          <section className="border rounded-xl p-6 shadow-sm bg-gray-50">
            <div className="flex items-center gap-3 mb-6 border-b pb-2">
              <FaCalendarAlt className="text-green-600 text-xl" />
              <h2 className="text-xl font-bold text-green-700">Proposal Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Proposal Date
                </label>
                <input
                  type="date"
                  name="propDate"
                  value={formData.propDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Proposal Version
                </label>
                <input
                  type="number"
                  name="propVersion"
                  value={formData.propVersion}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="1.0"
                  required
                />
              </div>
            </div>
          </section>

          {/* Customer Signature */}
          <section className="border rounded-xl p-6 shadow-sm bg-gray-50">
            <div className="flex items-center gap-3 mb-6 border-b pb-2">
              <FaSignature className="text-green-600 text-xl" />
              <h2 className="text-xl font-bold text-green-700">
                Customer Signature Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="custSignName"
                  value={formData.custSignName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="custSignDesig"
                  value={formData.custSignDesig}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="custSignDate"
                  value={formData.custSignDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>
          </section>
          {/* Proposal Preferences */}
          <section className="border rounded-xl p-6 shadow-sm bg-gray-50">
            <div className="flex items-center gap-3 mb-6 border-b pb-2">
              <FaCogs className="text-green-600 text-xl" />
              <h2 className="text-xl font-bold text-green-700">Proposal Preferences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Modules Opted
                </label>
                <textarea
                  name="modulesOpted"
                  value={formData.modulesOpted}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Example: Payroll, Attendance, Recruitment"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Billing Frequency
                </label>
                <select
                  name="billingFreq"
                  value={formData.billingFreq}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="1">Monthly</option>
                  <option value="3">Quarterly</option>
                  <option value="12">Yearly</option>
                </select>
              </div>
            </div>
          </section>
          </>
  ) : (
    <p className="text-gray-500 text-center py-10">
      No plan selected. Please select a plan to generate a proposal.
    </p>
  )}
</div>

          {/* Submit Button */}
          <div className="text-center">
  <div className="flex justify-end mt-6">
  <div className="flex justify-end mt-6">
 <button
  type="button"
  onClick={handleSaveAndGeneratePDF} // ✅ updated handler
  className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
>
  Save & Download PDF
</button>

</div>

</div>

</div>

        </form>
      </main>

      <Footer />
    </div>
  );
};

export default CreateProposal;
