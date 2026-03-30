import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProposal from './pages/CreateProposal';
import ViewProposals from './pages/ViewProposals';
import ProposalPreview from "./pages/ProposalPreview";
import PendingApprovals from './pages/PendingApprovals';
import AdminReports from './pages/AdminReports';
import RegionSelect from './pages/RegionSelect';
import ClientInformation from "./pages/ClientInformation";
import ContactInformation from "./pages/ContactInformation";
import ProposalPage from "./pages/ProposalPage";
import MyProposals from "./pages/MyProposals";
import AdminProposals from "./pages/AdminProposals";
import ExploreModules from "./pages/ExploreModules";
import ImplementationReadiness from "./pages/ImplementationReadiness";

function readStoredJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Must live inside <Router> so useLocation() re-runs on navigation.
 * Otherwise App only reads localStorage once — after login, `user` stays null
 * and protected routes always redirect to /login.
 */
function AppRoutes() {
  useLocation();
  const user = readStoredJson('user');
  const region = readStoredJson('region');

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/proposal-preview" element={<ProposalPreview />} />

      <Route
        path="/region-select"
        element={user ? <RegionSelect /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/dashboard"
        element={
          user
            ? region
              ? <Dashboard />
              : <Navigate to="/region-select" replace />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="/client-info" element={<ClientInformation />} />
      <Route path="/contact-information" element={<ContactInformation />} />
      <Route path="/proposal" element={<ProposalPage />} />
      <Route path="/my-proposals" element={<MyProposals />} />
      <Route path="/admin/all-proposals" element={<AdminProposals />} />
      <Route path="/explore-modules" element={<ExploreModules />} />
      <Route path="/implementation-readiness" element={<ImplementationReadiness />} />
      <Route
        path="/create-proposal"
        element={user ? <CreateProposal /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/view-proposals"
        element={user ? <ViewProposals /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/pending-approvals"
        element={user ? <PendingApprovals /> : <Navigate to="/login" replace />}
      />
      <Route path="/view-proposal/:proposalId" element={<ProposalPage />} />
      <Route
        path="/reports"
        element={user ? <AdminReports /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router basename="/zhrproposalengine">
      <AppRoutes />
    </Router>
  );
}

export default App;
