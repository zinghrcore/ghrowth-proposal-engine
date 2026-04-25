import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BASE_URL = process.env.REACT_APP_API_URL;

const ExploreModules = () => {
  const [modules, setModules] = useState([]);
  const region = JSON.parse(localStorage.getItem("region"));
  const currencySymbol = region?.currencySymbol || "₹";
  const conversionRate =
  Number(region?.conversionValue || 0) /
  Number(region?.conversionBaseINR || 1);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/modules`);
        // add `isChecked` flag to each module
        const modulesWithSelection = res.data.map((m) => ({ ...m, isChecked: false }));
        setModules(modulesWithSelection);
      } catch (err) {
        console.error("Error fetching modules:", err);
        alert("Failed to load modules. Please try again later.");
      }
    };
    fetchModules();
  }, []);
  const [showModal, setShowModal] = useState(false);
const [newModule, setNewModule] = useState({
  modName: "",
  modDesc: "",
  modFeatureList: "",
  modObjective: "",
  PriceINR: "",
  pkgPro: false,
  pkgProPlus: false,
  pkgGrowth: false
});
const existingCategories = [
  ...new Set(
    modules
      .map((m) => m.modObjective)
      .filter((category) => category && category.trim() !== "")
  ),
];

const [categoryMode, setCategoryMode] = useState("existing");

  // ✅ Handle checkbox toggle
  const handleSelectModule = (index, checked) => {
    const updated = [...modules];
    updated[index].isChecked = checked;
    setModules(updated);
  };

  // ✅ Handle Continue button
 const handleContinue = () => {
  let selected = modules.filter((m) => m.isChecked);

  // If no modules selected, alert
  if (selected.length === 0) {
    alert("Please select at least one module before continuing.");
    return;
  }

  // Sum module prices
  const totalRateINR = selected.reduce((sum, m) => sum + (m.PriceINR || 0), 0);
  const totalRateUSD = selected.reduce(
  (sum, m) => sum + ((Number(m.PriceINR) || 0) * conversionRate),
  0
);

  // Save selected modules in localStorage
  localStorage.setItem(
    "selectedModules",
    JSON.stringify({
      modules: selected,
      totalRateINR,
      totalRateUSD,
    })
  );
  localStorage.setItem("source", "exploreModules");

  // Navigate to Client Info page
  navigate("/client-info");
};
const [editingModule, setEditingModule] = useState(null);
const [newPrice, setNewPrice] = useState("");
  // ✅ Handle Reset button
  const handleReset = () => {
    const resetModules = modules.map((m) => ({ ...m, isChecked: false }));
    setModules(resetModules);
  };
const handleEdit = (mod) => {
  setEditingModule(mod.modId);
  setNewPrice(mod.PriceINR || "");
};
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure?")) return;

  try {
    await axios.delete(`${BASE_URL}/api/modules/${id}`);
    alert("Deleted successfully");

    setModules(modules.filter((m) => m.modId !== id));
  } catch (err) {
    console.error(err);
    alert("Error deleting module");
  }
};
const handleSave = async (id) => {
  try {
    await axios.put(`${BASE_URL}/api/modules/${id}`, {
      PriceINR: newPrice,
    });

    alert("Price updated successfully");

    setEditingModule(null);

    const res = await axios.get(`${BASE_URL}/api/modules`);
    setModules(res.data);
  } catch (err) {
    console.error(err);
    alert("Error updating price");
  }
};
const handleAddModule = async () => {
  try {
    await axios.post(`${BASE_URL}/api/modules`, {
  ...newModule,
  pkgPro: newModule.pkgPro ? "Included" : "Not included",
  pkgProPlus: newModule.pkgProPlus ? "Included" : "Not included",
  pkgGrowth: newModule.pkgGrowth ? "Included" : "Not included",
});

    alert("Module added successfully");

    setShowModal(false);

    // refresh list
    const res = await axios.get(`${BASE_URL}/api/modules`);
    setModules(res.data);

    // reset form
    setNewModule({
  modName: "",
  modDesc: "",
  modFeatureList: "",
  modObjective: "",
  PriceINR: "",
  pkgPro: false,
  pkgProPlus: false,
  pkgGrowth: false
});
setCategoryMode("existing");

  } catch (err) {
    console.error(err);
    alert("Error adding module");
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 font-sans text-black">
      <Navbar user={user} />

      <main className="pt-20 px-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
          Explore All Modules
        </h1>

        <div className="bg-white shadow-2xl rounded-3xl p-6 border border-blue-200">
          {isAdmin && (
  <div className="mb-4 text-right">
    <button
      onClick={() => setShowModal(true)}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      + Add Module
    </button>
  </div>
)}
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base text-left text-gray-700">
              <thead className="bg-blue-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-center w-20">Select</th>
                  <th className="px-4 py-3">Module Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description / Features</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  {isAdmin && <th className="px-4 py-3 text-center">Actions</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {modules.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      Loading modules...
                    </td>
                  </tr>
                ) : (
                  modules.map((mod, index) => {
                    const priceINR = mod.PriceINR || 0;
                    const priceUSD = (priceINR * conversionRate).toFixed(2);

                    return (
                      <tr
                        key={mod.modId || index}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={mod.isChecked || false}
                            onChange={(e) => handleSelectModule(index, e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-400"
                          />
                        </td>

                        {/* Module Name */}
                        <td className="px-4 py-3 font-semibold text-blue-900">
                          {mod.modName}
                        </td>

                        {/* Module Category */}
                        <td className="px-4 py-3 text-gray-700">
                          {mod.modObjective || "-"}
                        </td>

                        {/* Features / Description */}
                        <td className="px-4 py-3 text-gray-600">
                          {mod.modFeatureList && mod.modFeatureList.trim() !== ""
                            ? mod.modFeatureList
                            : mod.modDesc || "No details available."}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-right font-semibold text-blue-900">
  {isAdmin && editingModule === mod.modId ? (
    <input
      type="number"
      value={newPrice}
      onChange={(e) => setNewPrice(e.target.value)}
      className="w-20 border rounded text-center"
    />
 ) : region?.currency === "INR" ? (
  `${currencySymbol}${priceINR}`
) : (
  `${currencySymbol}${priceUSD}`
)}
</td>
                       {isAdmin && (
  <td className="px-4 py-3 text-center space-x-2">
    {editingModule === mod.modId ? (
      <>
        <button
          onClick={() => handleSave(mod.modId)}
          className="px-2 py-1 bg-green-500 text-white rounded"
        >
          Save
        </button>

        <button
          onClick={() => setEditingModule(null)}
          className="px-2 py-1 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => handleEdit(mod)}
          className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
        >
          Edit
        </button>

        <button
          onClick={() => handleDelete(mod.modId)}
          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </>
    )}
  </td>
)}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Summary */}
        <div className="mt-8 text-center text-blue-800 font-semibold">
          Selected Modules:{" "}
          <span className="text-blue-900 font-bold">
            {modules.filter((m) => m.isChecked).length}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Continue →
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-300 text-black rounded-xl font-semibold hover:bg-gray-400 transition"
          >
            Reset
          </button>
        </div>
      </main>
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl w-[500px] shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Add Module</h2>

      <input
        type="text"
        placeholder="Module Name"
        className="w-full border p-2 mb-3 rounded"
        value={newModule.modName}
        onChange={(e) => setNewModule({ ...newModule, modName: e.target.value })}
      />

      <div className="mb-3">
  <label className="block font-semibold mb-1 text-blue-900">
    Module Category
  </label>

  <select
    className="w-full border p-2 mb-2 rounded"
    value={categoryMode}
    onChange={(e) => {
      setCategoryMode(e.target.value);
      setNewModule({ ...newModule, modObjective: "" });
    }}
  >
    <option value="existing">Select Existing Category</option>
    <option value="new">Create New Category</option>
  </select>

  {categoryMode === "existing" ? (
    <select
      className="w-full border p-2 rounded"
      value={newModule.modObjective}
      onChange={(e) =>
        setNewModule({ ...newModule, modObjective: e.target.value })
      }
    >
      <option value="">-- Select Category --</option>
      {existingCategories.map((category, index) => (
        <option key={index} value={category}>
          {category}
        </option>
      ))}
    </select>
  ) : (
    <input
      type="text"
      placeholder="Enter New Category"
      className="w-full border p-2 rounded"
      value={newModule.modObjective}
      onChange={(e) =>
        setNewModule({ ...newModule, modObjective: e.target.value })
      }
    />
  )}
</div>

      <textarea
        placeholder="Description"
        className="w-full border p-2 mb-3 rounded"
        value={newModule.modDesc}
        onChange={(e) => setNewModule({ ...newModule, modDesc: e.target.value })}
      />

      <textarea
        placeholder="Features"
        className="w-full border p-2 mb-3 rounded"
        value={newModule.modFeatureList}
        onChange={(e) => setNewModule({ ...newModule, modFeatureList: e.target.value })}
      />

      <input
        type="number"
        placeholder="Price INR"
        className="w-full border p-2 mb-3 rounded"
        value={newModule.PriceINR}
        onChange={(e) => setNewModule({ ...newModule, PriceINR: e.target.value })}
      />
      <div className="mb-3 border p-3 rounded bg-gray-50">
  <p className="font-semibold mb-2 text-blue-900">
    Add this module to packages:
  </p>

  <label className="block mb-2">
    <input
      type="checkbox"
      checked={newModule.pkgPro}
      onChange={(e) =>
        setNewModule({ ...newModule, pkgPro: e.target.checked })
      }
      className="mr-2"
    />
    ZingHR Pro
  </label>

  <label className="block mb-2">
    <input
      type="checkbox"
      checked={newModule.pkgProPlus}
      onChange={(e) =>
        setNewModule({ ...newModule, pkgProPlus: e.target.checked })
      }
      className="mr-2"
    />
    ZingHR Pro Plus
  </label>

  <label className="block">
    <input
      type="checkbox"
      checked={newModule.pkgGrowth}
      onChange={(e) =>
        setNewModule({ ...newModule, pkgGrowth: e.target.checked })
      }
      className="mr-2"
    />
    ZingHR GHROWTH
  </label>
</div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleAddModule}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
      <Footer />
    </div>
  );
};

export default ExploreModules;
