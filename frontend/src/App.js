import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProposal from './pages/CreateProposal'; // ✅ Added
import ViewProposals from './pages/ViewProposals'; // optional (future)

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* ✅ Create Proposal Route (Customer Only) */}
        <Route
          path="/create-proposal"
          element={user ? <CreateProposal /> : <Navigate to="/login" />}
        />

        {/* ✅ View Proposals Route (optional, for customer) */}
        <Route
          path="/view-proposals"
          element={user ? <ViewProposals /> : <Navigate to="/login" />}
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
