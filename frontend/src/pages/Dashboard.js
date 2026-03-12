import React, { useEffect, useState } from "react";

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

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;
  if (!stats) return null;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard Statistiques</h1>
      <div className="bg-white rounded shadow p-4 space-y-2">
        <div><b>Campagnes actives :</b> {stats.activeCampaigns}</div>
        <div><b>Impressions totales :</b> {stats.totalImpressions}</div>
        <div><b>Top advertiser :</b> {stats.topAdvertiser || "-"}</div>
      </div>
    </div>
  );
}
