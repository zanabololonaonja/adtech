import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import CampaignList from "./pages/CampaignList";
import CampaignCreate from "./pages/CampaignCreate";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#1a4a65]">
        <Sidebar />
        {/* Le contenu principal */}
        <main className="flex-1 ml-64 p-10 pt-20">
          {/* Ligne horizontale sous le hamburger */}
          <div className="fixed left-0 right-0 top-16 z-10 ml-64">
            <hr className="border-t border-[#b6c8d6] opacity-60" />
          </div>
          <div className="p-0 min-h-full text-[#1a4a65]">
            <Routes>
              <Route path="/" element={<CampaignList />} />
              <Route path="/create" element={<CampaignCreate />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;