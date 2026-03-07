import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProposal from './pages/CreateProposal';
import ViewProposals from './pages/ViewProposals';
import ProposalPreview from "./pages/ProposalPreview";
import PendingApprovals from './pages/PendingApprovals';
import AdminReports from './pages/AdminReports';
import RegionSelect from './pages/RegionSelect'; // ✅ Added
import ClientInformation from "./pages/ClientInformation";
import ContactInformation from "./pages/ContactInformation";
import ProposalPage from "./pages/ProposalPage";
import MyProposals from "./pages/MyProposals";
import AdminProposals from "./pages/AdminProposals";
import ExploreModules from "./pages/ExploreModules";

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  const region = JSON.parse(localStorage.getItem('region'));

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/proposal-preview" element={<ProposalPreview />} />

        {/* ✅ Region Selection Page (Shown After Login) */}
        <Route
          path="/region-select"
          element={user ? <RegionSelect /> : <Navigate to="/login" />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            user
              ? region
                ? <Dashboard /> // ✅ Only accessible after region is chosen
                : <Navigate to="/region-select" />
              : <Navigate to="/login" />
          }
        />
<Route path="/client-info" element={<ClientInformation />} />
 <Route path="/contact-information" element={<ContactInformation />} />
 <Route path="/proposal" element={<ProposalPage />} />
<Route path="/my-proposals" element={<MyProposals />} />
<Route path="/admin/all-proposals" element={<AdminProposals />} />
<Route path="/explore-modules" element={<ExploreModules />} />
        {/* ✅ Create Proposal (Customer Only) */}
        <Route
          path="/create-proposal"
          element={user ? <CreateProposal /> : <Navigate to="/login" />}
        />

        {/* ✅ View Proposals (Optional) */}
        <Route
          path="/view-proposals"
          element={user ? <ViewProposals /> : <Navigate to="/login" />}
        />

        {/* ✅ Pending Approvals (Approver Only) */}
        <Route
          path="/pending-approvals"
          element={user ? <PendingApprovals /> : <Navigate to="/login" />}
        />
        <Route path="/view-proposal/:proposalId" element={<ProposalPage />} />

        {/* ✅ Reports (Admin Only) */}
        <Route
          path="/reports"
          element={user ? <AdminReports /> : <Navigate to="/login" />}
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
