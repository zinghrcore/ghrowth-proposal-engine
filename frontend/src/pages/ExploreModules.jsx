import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BASE_URL = process.env.REACT_APP_API_URL;

const ExploreModules = () => {
  const [modules, setModules] = useState([]);
  const region = JSON.parse(localStorage.getItem("region"));
  const user = JSON.parse(localStorage.getItem("user"));
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
    (sum, m) => sum + ((m.PriceUSD) || ((m.PriceINR || 0) / 83)),
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

  // ✅ Handle Reset button
  const handleReset = () => {
    const resetModules = modules.map((m) => ({ ...m, isChecked: false }));
    setModules(resetModules);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 font-sans text-black">
      <Navbar user={user} />

      <main className="pt-20 px-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
          Explore All Modules
        </h1>

        <div className="bg-white shadow-2xl rounded-3xl p-6 border border-blue-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base text-left text-gray-700">
              <thead className="bg-blue-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-center w-20">Select</th>
                  <th className="px-4 py-3">Module Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description / Features</th>
                  <th className="px-4 py-3 text-right">Price</th>
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
                    const priceUSD = mod.PriceUSD || (priceINR / 83).toFixed(2);

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
                          {region?.name?.toLowerCase() === "india"
                            ? `₹${priceINR}`
                            : `$${priceUSD}`}
                        </td>
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

      <Footer />
    </div>
  );
};

export default ExploreModules;
