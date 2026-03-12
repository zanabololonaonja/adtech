import React from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import CampaignList from "./pages/CampaignList";
import CampaignCreate from "./pages/CampaignCreate";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <nav className="bg-blue-700 text-white px-4 py-3 flex gap-4">
        <Link to="/" className="hover:underline">Liste des campagnes</Link>
        <Link to="/create" className="hover:underline">Créer une campagne</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
      </nav>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<CampaignList />} />
          <Route path="/create" element={<CampaignCreate />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
