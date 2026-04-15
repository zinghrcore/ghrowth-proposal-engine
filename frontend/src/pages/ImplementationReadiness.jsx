import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { saveFilesForClient, getFilesForClient, deleteFileById } from "../utils/fileStorage";

const BASE_URL = process.env.REACT_APP_API_URL;

const ImplementationReadiness = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const clientDraft =
  JSON.parse(localStorage.getItem("clientInformationDraft")) ||
  JSON.parse(localStorage.getItem("clientInfo")) ||
  {};

const clientName = clientDraft.clientName || "Unknown Client";

const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchChecklistData();
  }, []);
useEffect(() => {
  const loadFiles = async () => {
    const files = await getFilesForClient(clientName);
    setUploadedFiles(files);
  };

  if (clientName) loadFiles();
}, [clientName]);
  const fetchChecklistData = async () => {
    try {
      const [sectionsRes, itemsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/readiness/sections`),
        axios.get(`${BASE_URL}/api/readiness/items`),
      ]);

      const sectionData = sectionsRes.data || [];
      const itemData = (itemsRes.data || []).map((item) => ({
  ...item,
  is_completed: Number(item.is_completed) || 0,
  is_not_applicable: Number(item.is_not_applicable) || 0,
}));

      setSections(sectionData);
      setItems(itemData);

      const initialExpanded = {};
      sectionData.forEach((section) => {
        initialExpanded[section.id] = false;
      });
      setExpandedSections(initialExpanded);
    } catch (error) {
      console.error("Failed to fetch checklist data:", error);
    }
  };

  const groupedItems = useMemo(() => {
    const grouped = {};
    sections.forEach((section) => {
      grouped[section.id] = items.filter(
        (item) => Number(item.main_id) === Number(section.id)
      );
    });
    return grouped;
  }, [sections, items]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const expandAll = () => {
    const updated = {};
    sections.forEach((section) => {
      updated[section.id] = true;
    });
    setExpandedSections(updated);
  };

  const collapseAll = () => {
    const updated = {};
    sections.forEach((section) => {
      updated[section.id] = false;
    });
    setExpandedSections(updated);
  };
  const handleToggle = (id) => {
  setItems((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            is_completed: item.is_completed ? 0 : 1,
            is_not_applicable: 0,
          }
        : item
    )
  );
};
const handleNotApplicable = (id) => {
  setItems((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            is_not_applicable: item.is_not_applicable ? 0 : 1,
            is_completed: 0,
          }
        : item
    )
  );
};
const handleToggleSectionItems = (sectionId) => {
  const sectionItems = items.filter(
    (item) => Number(item.main_id) === Number(sectionId)
  );

  if (sectionItems.length === 0) return;

  const areAllChecked = sectionItems.every(
  (item) =>
    Number(item.is_completed) === 1 || Number(item.is_not_applicable) === 1
);

  setItems((prev) =>
  prev.map((item) =>
    Number(item.main_id) === Number(sectionId)
      ? {
          ...item,
          is_completed: areAllChecked ? 0 : 1,
          is_not_applicable: 0,
        }
      : item
  )
);
};

const handleToggleSectionNotApplicable = (sectionId) => {
  const sectionItems = items.filter(
    (item) => Number(item.main_id) === Number(sectionId)
  );

  if (sectionItems.length === 0) return;

  const areAllNotApplicable = sectionItems.every(
    (item) => Number(item.is_not_applicable) === 1
  );

  setItems((prev) =>
    prev.map((item) =>
      Number(item.main_id) === Number(sectionId)
        ? {
            ...item,
            is_not_applicable: areAllNotApplicable ? 0 : 1,
            is_completed: 0,
          }
        : item
    )
  );
};
const totalItems = items.length;

const completedItems = items.filter(
  (item) => Number(item.is_completed) === 1 || Number(item.is_not_applicable) === 1
).length;

const completionPercent =
  totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
const handleApplyDiscount = () => {
  let percent = 0;

  if (completionPercent === 100) percent = 5;
  else if (completionPercent >= 90) percent = 4;
  else if (completionPercent >= 80) percent = 3;
  else if (completionPercent >= 70) percent = 2;

  localStorage.setItem(
    "readinessDiscount",
    JSON.stringify({
      eligible: percent > 0,
      percent,
      completion: completionPercent,
    })
  );

  alert(
    percent > 0
      ? `✅ ${percent}% Implementation Discount Applied!`
      : "⚠️ Complete at least 70% to unlock discount"
  );

  localStorage.setItem("skipModuleQuestionOnce", "true");
navigate(-1);
};

{/*const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });*/}

const handleFileUpload = async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  try {
    await saveFilesForClient(clientName, files);
    const updated = await getFilesForClient(clientName);
    setUploadedFiles(updated);
  } catch (error) {
    console.error("File upload failed:", error);
  }
};
const handleRemoveFile = async (id) => {
  await deleteFileById(id);
  const updated = await getFilesForClient(clientName);
  setUploadedFiles(updated);
};
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 text-black">
      <Navbar user={user} />
      <main className="pt-20 px-6 md:px-10 pb-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    <div>
      <h1 className="text-3xl font-extrabold text-blue-900">
        ZingHR Implementation Readiness
      </h1>
      <p className="text-gray-600 mt-1">
        Pre-Implementation Checklist · HCM Configuration Prerequisites
      </p>
    </div>

    <button
      onClick={() => navigate(-1)}
      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold border border-gray-200"
    >
      Back
    </button>
  </div>

  <div className="flex flex-wrap items-center gap-0 rounded-xl overflow-hidden border border-blue-200 w-fit">
    <button
      onClick={handleApplyDiscount}
      className="px-5 py-3 bg-blue-600 text-white hover:bg-blue-700 font-semibold border-r border-blue-200"
    >
      Apply Readiness Discount
    </button>

    <button
      onClick={expandAll}
      className="px-5 py-3 bg-blue-50 text-blue-900 hover:bg-blue-100 font-medium border-r border-blue-200"
    >
      ⬇ Expand All
    </button>

    <button
      onClick={collapseAll}
      className="px-5 py-3 bg-white text-gray-800 hover:bg-gray-50 font-medium border-r border-blue-200"
    >
      ⬆ Collapse All
    </button>

    <button
      onClick={() => window.print()}
      className="px-5 py-3 bg-white text-gray-800 hover:bg-gray-50 font-medium"
    >
      🖨 Print / Export
    </button>
  </div>
</div>
<div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-blue-900">
      Discount Tiers
    </h2>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { percent: 2, label: "≥ 70% Complete", icon: "📊" },
      { percent: 3, label: "≥ 80% Complete", icon: "🚀" },
      { percent: 4, label: "≥ 90% Complete", icon: "⭐" },
      { percent: 5, label: "100% Complete", icon: "💎" },
    ].map((tier) => {
      const isActive =
        (tier.percent === 2 && completionPercent >= 70 && completionPercent < 80) ||
        (tier.percent === 3 && completionPercent >= 80 && completionPercent < 90) ||
        (tier.percent === 4 && completionPercent >= 90 && completionPercent < 100) ||
        (tier.percent === 5 && completionPercent === 100);

      return (
        <div
          key={tier.percent}
          className={`rounded-2xl p-5 text-center border transition ${
            isActive
              ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <div className="text-3xl mb-2">{tier.icon}</div>

          <div
            className={`text-3xl font-extrabold ${
              isActive ? "text-white" : "text-blue-900"
            }`}
          >
            {tier.percent}%
          </div>

          <div
            className={`text-sm mt-1 ${
              isActive ? "text-white" : "text-gray-600"
            }`}
          >
            {tier.label}
          </div>
        </div>
      );
    })}
  </div>
</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
    <p className="text-sm font-medium text-gray-500">Readiness Score</p>
    <h2 className="text-3xl font-extrabold text-blue-900 mt-2">
      {completionPercent}%
    </h2>
  </div>

  <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
    <p className="text-sm font-medium text-gray-500">Completed Items</p>
    <h2 className="text-3xl font-extrabold text-blue-900 mt-2">
      {completedItems}
    </h2>
  </div>

  <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
    <p className="text-sm font-medium text-gray-500">Total Items</p>
    <h2 className="text-3xl font-extrabold text-blue-900 mt-2">
      {totalItems}
    </h2>
  </div>
</div>
<div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
  <label className="block text-sm font-semibold text-gray-800 mb-2">
    📎 Attach Supporting Files
  </label>

  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50">
    <input
      type="file"
      multiple
      onChange={handleFileUpload}
      className="block mx-auto mb-3"
    />
    <p className="text-sm text-gray-600">
      Click to browse or drag & drop files here
    </p>
    <p className="text-xs text-gray-500 mt-1">
      File names will be saved and shown in My Proposals
    </p>

    {uploadedFiles.length > 0 && (
  <div className="mt-4 text-left">
    <p className="font-semibold text-blue-900 mb-2">
      Uploaded Files for {clientName}
    </p>
    <div className="space-y-2">
      {uploadedFiles.map((file) => {
        const fileUrl = URL.createObjectURL(file.file);

        return (
          <div
            key={file.id}
            className="flex items-center justify-between bg-white border rounded-lg px-3 py-2"
          >
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium truncate"
            >
              {file.name}
            </a>

            <button
              type="button"
              onClick={() => handleRemoveFile(file.id)}
              className="text-red-600 hover:text-red-800 text-sm font-semibold ml-3"
            >
              Remove
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}
  </div>
</div>
          {sections.map((section) => {
            const sectionItems = groupedItems[section.id] || [];
            const isExpanded = expandedSections[section.id];
            const areAllSectionItemsChecked =
  sectionItems.length > 0 &&
  sectionItems.every(
    (item) =>
      Number(item.is_completed) === 1 ||
      Number(item.is_not_applicable) === 1
  );
  const areAllSectionItemsNotApplicable =
  sectionItems.length > 0 &&
  sectionItems.every((item) => Number(item.is_not_applicable) === 1);
                const completedSectionItems = sectionItems.filter(
  (item) =>
    Number(item.is_completed) === 1 || Number(item.is_not_applicable) === 1
).length;
            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <div>
                    <h2 className="text-lg font-bold text-blue-900">
                      {section.id}. {section.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-blue-700">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4 flex justify-end gap-3">
  <button
    type="button"
    onClick={() => handleToggleSectionItems(section.id)}
    className="px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
  >
    {areAllSectionItemsChecked ? "Unselect All" : "Select All"}
  </button>

  <button
    type="button"
    onClick={() => handleToggleSectionNotApplicable(section.id)}
    className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
  >
    {areAllSectionItemsNotApplicable ? "Unselect All N/A" : "Select All N/A"}
  </button>
</div>
                    <div className="mt-4 space-y-3">
                      {sectionItems.length > 0 ? (
                        sectionItems.map((item) => (
  <div
    key={item.id}
    className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-gray-50"
  >
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        className="mt-1 w-4 h-4"
        checked={Boolean(item.is_completed)}
        onChange={() => handleToggle(item.id)}
      />

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-900">
            {item.item_text}
          </span>

          {item.tags &&
            item.tags.split(",").map((tag, index) => (
              <span
                key={index}
                className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
              >
                {tag.trim()}
              </span>
            ))}
        </div>
      </div>
    </div>

    <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
      <input
        type="checkbox"
        checked={Boolean(item.is_not_applicable)}
        onChange={() => handleNotApplicable(item.id)}
        className="w-4 h-4"
      />
      Not Applicable
    </label>
  </div>
))
                      ) : (
                        <p className="text-gray-500">No items found in this section.</p>
                      )}
                    </div>

                    {/*<div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Section Notes & Queries
                      </label>
                      <textarea
                        className="w-full border rounded-xl p-3 min-h-[110px] focus:ring-2 focus:ring-blue-400 outline-none"
                        placeholder="Record blockers, open queries, owner names, or any notes for this section…"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-saved to browser
                      </p>
                    </div>

                    <div className="mt-5">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        📎 Attach Supporting Files
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50">
  <input
    type="file"
    multiple
    onChange={handleFileUpload}
    className="block mx-auto mb-3"
  />
  <p className="text-sm text-gray-600">
    Click to browse or drag & drop files here
  </p>
  <p className="text-xs text-gray-500 mt-1">
    Accepts .zip, .pdf, .xlsx, .docx, .csv, .ppt and image files
  </p>

  {uploadedFiles.length > 0 && (
    <div className="mt-4 text-left">
      <p className="font-semibold text-blue-900 mb-2">
        Uploaded Files for {clientName}
      </p>
      <div className="space-y-2">
        {uploadedFiles.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between bg-white border rounded-lg px-3 py-2"
          >
            <a
              href={file.data}
              download={file.name}
              className="text-blue-600 hover:text-blue-800 font-medium truncate"
            >
              {file.name}
            </a>
            <button
              type="button"
              onClick={() => handleRemoveFile(index)}
              className="text-red-600 hover:text-red-800 text-sm font-semibold ml-3"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
                    </div>*/}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImplementationReadiness;