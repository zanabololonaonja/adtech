import React, { useEffect, useState } from "react";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les campagnes depuis le backend
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/campaigns");
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Couleurs selon le statut
  const statusColors = {
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    ended: "bg-gray-200 text-gray-700",
    pending: "bg-blue-100 text-blue-700",
    draft: "bg-gray-100 text-gray-500",
    rejected: "bg-red-100 text-red-700",
  };

  // Fonction pour simuler une impression
  const serveAd = async (country, campaignId) => {
    try {
      const res = await fetch("http://localhost:3001/serve-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erreur lors de la simulation");
        return;
      }

      const servedCampaign = await res.json();

      // Mettre à jour le tableau avec la campagne mise à jour
      setCampaigns((prev) =>
        prev.map((c) => (c.id === servedCampaign.id ? servedCampaign : c))
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la simulation");
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Liste des campagnes</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-[#e3f2fa] text-[#183153]">
              <th className="px-6 py-3 font-bold">Nom</th>
              <th className="px-6 py-3 font-bold">Annonceur</th>
              <th className="px-6 py-3 font-bold">Statut</th>
              <th className="px-6 py-3 font-bold">Impressions</th>
              <th className="px-6 py-3 font-bold">Budget</th>
              <th className="px-6 py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Aucune campagne trouvée.
                </td>
              </tr>
            )}
            {campaigns.map((c) => (
              <tr
                key={c.id}
                className="bg-white even:bg-[#f6fbfd] hover:bg-[#e3f2fa]/60 transition"
              >
                <td className="px-6 py-4 font-semibold text-[#183153]">{c.name}</td>
                <td className="px-6 py-4 text-[#3a5a6a]">{c.advertiser}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      statusColors[c.status?.toLowerCase()] ||
                      "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#3a5a6a]">
                  {c.impressionsServed ?? 0}
                </td>
                <td className="px-6 py-4 text-[#3a5a6a]">{c.budget} €</td>
                <td className="px-6 py-4">
                  {c.status === "active" && (
                    <button
                      onClick={() => serveAd("FR", c.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                    >
                      Servir annonce
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}