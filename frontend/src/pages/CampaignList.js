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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des campagnes</h1>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Nom</th>
            <th className="px-4 py-2 border">Annonceur</th>
            <th className="px-4 py-2 border">Statut</th>
            <th className="px-4 py-2 border">Impressions</th>
            <th className="px-4 py-2 border">Budget</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2 border">{c.name}</td>
              <td className="px-4 py-2 border">{c.advertiser}</td>
              <td className="px-4 py-2 border">{c.status}</td>
              <td className="px-4 py-2 border">{c.impressionsServed}</td>
              <td className="px-4 py-2 border">{c.budget}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
