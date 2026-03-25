import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

const RegionSelect = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
const [regions, setRegions] = React.useState([]); 
const [editRegions, setEditRegions] = React.useState([]); // Regions admin can edit
const [isAdminModalOpen, setIsAdminModalOpen] = React.useState(false); // Modal open/close
const [selectedRegion, setSelectedRegion] = React.useState(null);

React.useEffect(() => {
  const fetchRegions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/regions`); // fetch from DB
      setRegions(res.data);      // live regions
      setEditRegions(res.data);  // copy for admin editing
    } catch (err) {
      console.error("Error fetching regions:", err);
      alert("Failed to fetch regions");
    }
  };

  fetchRegions();
}, []);

console.log("Regions:", regions);
  console.log("Edit Regions:", editRegions);
  console.log("Is Admin Modal Open:", isAdminModalOpen);
  const handleSelect = async (region, currency) => {
    try {
      // Save region + currency
      localStorage.setItem("region", JSON.stringify({ name: region, currency }));

      // Update region in backend
      if (user && user.id) {
        await axios.put(`${BASE_URL}/api/customer/region`, {
          custId: user.id,
          region,
        });

        // Update local user data
        const updatedUser = { ...user, custRegion: region };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update region:", error);
      alert("Error updating region. Please try again.");
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-6 font-sans text-black">
      {/* Admin Modal for Managing Regions */}
{isAdminModalOpen && (
  <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-md z-50">
    <div className="bg-white rounded-3xl shadow-3xl w-full max-w-3xl p-6 relative animate-fadeIn border border-blue-200">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Manage Regions
      </h2>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {editRegions.map((region, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={region.name}
              onChange={(e) => {
                const updated = [...editRegions];
                updated[index].name = e.target.value;
                setEditRegions(updated);
              }}
              className="flex-1 p-2 border rounded"
              placeholder="Region Name"
            />
            <input
              type="text"
              value={region.currency}
              onChange={(e) => {
                const updated = [...editRegions];
                updated[index].currency = e.target.value;
                setEditRegions(updated);
              }}
              className="w-32 p-2 border rounded"
              placeholder="Currency"
            />
            <button
  onClick={async () => {
    try {
      const regionToDelete = editRegions[index];

      console.log("Deleting region id:", regionToDelete.id); // debug line

      await axios.delete(`${BASE_URL}/api/regions/${regionToDelete.id}`);

      // Update state
      const updated = editRegions.filter((_, i) => i !== index);
      setEditRegions(updated);
      setRegions(updated);
      alert(`Region "${regionToDelete.name}" deleted successfully`);
    } catch (err) {
      console.error("Error deleting region:", err);
      alert("Failed to delete region");
    }
  }}
  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
>
  Delete
</button>

          </div>
        ))}

        <button
          onClick={() => setEditRegions([...editRegions, { name: "", currency: "", pricing: "" }])}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mt-2"
        >
          + Add Region
        </button>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setIsAdminModalOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            try {
              await axios.put(`${BASE_URL}/api/regions`, { regions: editRegions });
              setRegions([...editRegions]); // update main regions state
              setIsAdminModalOpen(false);
              alert("Regions updated successfully!");
            } catch (err) {
              console.error("Error updating regions:", err);
              alert("Failed to update regions");
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-5xl text-center border border-blue-200 hover:shadow-3xl transition-shadow duration-300">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4 tracking-wide">
  Select Your Region
</h1>
<p className="text-blue-700 mb-8 text-lg">
  Choose the region for your deployment
</p>

        {user.role === 'admin' && (
  <div className="flex justify-center mb-6">
    <button
      onClick={() => {
        setEditRegions([...regions]); // copy current regions for editing
        setIsAdminModalOpen(true);    // open modal
      }}
      className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition"
    >
      Manage Regions
    </button>
  </div>
)}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {regions.map((region) => (
  <div
    key={region.name}
    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
      selectedRegion?.name === region.name
        ? "border-blue-600 shadow-xl bg-blue-50"
        : "border-blue-200 hover:border-blue-400 hover:shadow-md"
    } flex flex-col items-center justify-between gap-4`}
    onClick={() => setSelectedRegion(region)}
  >
    <h2 className="text-xl font-bold text-blue-900">{region.name}</h2>
    <p className="text-blue-700 text-sm md:text-base text-center">
      {region.pricing || `Pricing in ${region.currency}`}
    </p>
          {/* Show Existing/New buttons only for the selected region */}
      {selectedRegion?.name === region.name && (
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent card click
              localStorage.setItem("region", JSON.stringify(selectedRegion));
              localStorage.setItem("mode", "existing");
              navigate("/dashboard?mode=existing");
            }}
            className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition shadow-sm hover:shadow-md"
          >
            Existing
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem("region", JSON.stringify(selectedRegion));
              localStorage.setItem("mode", "new");
              navigate("/dashboard?mode=new");
            }}
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md"
          >
            New
          </button>
        </div>
      )}

  </div>
))}
</div>

      </div>
    </div>
  );
};

export default RegionSelect;
