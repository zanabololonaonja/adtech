import React, { useEffect, useState } from "react";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/campaigns")
      .then((res) => res.json())
      .then(setCampaigns)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;


  const statusColors = {
    'active': 'bg-green-100 text-green-700',
    'paused': 'bg-yellow-100 text-yellow-700',
    'ended': 'bg-gray-200 text-gray-700',
    'pending': 'bg-blue-100 text-blue-700',
    'draft': 'bg-gray-100 text-gray-500',
    'rejected': 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6  text-white">Liste des campagnes</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-[#e3f2fa] text-[#183153]">
              <th className="px-6 py-3 font-bold">Nom</th>
              <th className="px-6 py-3 font-bold">Annonceur</th>
              <th className="px-6 py-3 font-bold">Statut</th>
              <th className="px-6 py-3 font-bold">Impressions</th>
              <th className="px-6 py-3 font-bold">Budget</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">Aucune campagne trouvée.</td>
              </tr>
            )}
            {campaigns.map((c) => (
              <tr key={c.id} className="bg-white even:bg-[#f6fbfd] hover:bg-[#e3f2fa]/60 transition">
                <td className="px-6 py-4 font-semibold text-[#183153]">{c.name}</td>
                <td className="px-6 py-4 text-[#3a5a6a]">{c.advertiser}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[c.status?.toLowerCase()] || 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                </td>
                <td className="px-6 py-4 text-[#3a5a6a]">{c.impressionsServed}</td>
                <td className="px-6 py-4 text-[#3a5a6a]">{c.budget} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
