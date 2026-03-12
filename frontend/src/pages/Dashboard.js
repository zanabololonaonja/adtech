import React, { useEffect, useState } from "react";
import { FaChartBar, FaUsers, FaBullhorn, FaClock } from "react-icons/fa";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-white text-lg">Chargement...</div>;
  if (error) return <div className="text-center text-red-400">Erreur : {error.message}</div>;
  if (!stats) return null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8 text-white tracking-wide">Hospital Data Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
   
        <div className="bg-[#e3f2fa] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <FaBullhorn className="text-3xl text-[#1a4a65] mb-2" />
          <div className="text-4xl font-bold text-[#1a4a65]">{stats.activeCampaigns}</div>
          <div className="text-[#3a5a6a] font-semibold mt-1">Campagnes actives</div>
        </div>
     
        <div className="bg-[#e3f2fa] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <FaChartBar className="text-3xl text-[#1a4a65] mb-2" />
          <div className="text-4xl font-bold text-[#1a4a65]">{stats.totalImpressions}</div>
          <div className="text-[#3a5a6a] font-semibold mt-1">Impressions totales</div>
        </div>
       
        <div className="bg-[#e3f2fa] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <FaUsers className="text-3xl text-[#1a4a65] mb-2" />
          <div className="text-2xl font-bold text-[#1a4a65]">{stats.topAdvertiser || "-"}</div>
          <div className="text-[#3a5a6a] font-semibold mt-1">Top annonceur</div>
        </div>
       
        <div className="bg-[#e3f2fa] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <FaClock className="text-3xl text-[#1a4a65] mb-2" />
          <div className="text-3xl font-bold text-[#1a4a65]">42 <span className="text-lg font-normal">min</span></div>
          <div className="text-[#3a5a6a] font-semibold mt-1">ER Wait Time</div>
        </div>
      </div>

   
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
        <div className="bg-[#e3f2fa] rounded-2xl shadow-lg p-6 flex flex-col">
          <div className="font-bold text-[#1a4a65] mb-2">Inpatient Trends (30D)</div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-24 bg-gradient-to-r from-[#a9d7e6] to-[#7bb6c7] rounded-lg flex items-center justify-center text-[#1a4a65]/40 font-bold text-2xl">Graphique</div>
          </div>
        </div>
    
        <div className="bg-[#e3f2fa] rounded-2xl shadow-lg p-6 flex flex-col">
          <div className="font-bold text-[#1a4a65] mb-2">Most Common Diagnoses</div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-24 bg-gradient-to-r from-[#a9d7e6] to-[#7bb6c7] rounded-lg flex items-center justify-center text-[#1a4a65]/40 font-bold text-2xl">Graphique</div>
          </div>
        </div>
   
        <div className="bg-[#e3f2fa] rounded-2xl shadow-lg p-6 flex flex-col">
          <div className="font-bold text-[#1a4a65] mb-2">Medical Stock Level</div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-24 bg-gradient-to-r from-[#a9d7e6] to-[#7bb6c7] rounded-lg flex items-center justify-center text-[#1a4a65]/40 font-bold text-2xl">Graphique</div>
          </div>
        </div>
      </div>
      <div className="text-xs text-[#e3f2fa] text-right mt-8">Data Last Updated: 03:00 AM</div>
    </div>
  );
}
