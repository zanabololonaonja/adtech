import React, { useState } from "react";

export default function CampaignCreate() {
  const [form, setForm] = useState({
    name: "",
    advertiser: "",
    startDate: "",
    endDate: "",
    budget: "",
    targetCountries: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name || !form.advertiser || !form.startDate || !form.endDate || !form.budget || !form.targetCountries) {
      setError("Tous les champs sont obligatoires.");
      return false;
    }
    if (isNaN(Number(form.budget)) || Number(form.budget) <= 0) {
      setError("Le budget doit être un nombre positif.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await fetch("http://localhost:3001/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
          targetCountries: form.targetCountries.split(",").map((c) => c.trim()),
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création");
      setSuccess("Campagne créée !");
      setForm({ name: "", advertiser: "", startDate: "", endDate: "", budget: "", targetCountries: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Créer une campagne</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" className="w-full border p-2 rounded" />
        <input name="advertiser" value={form.advertiser} onChange={handleChange} placeholder="Annonceur" className="w-full border p-2 rounded" />
        <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="budget" value={form.budget} onChange={handleChange} placeholder="Budget" className="w-full border p-2 rounded" />
        <input name="targetCountries" value={form.targetCountries} onChange={handleChange} placeholder="Pays cibles (séparés par des virgules)" className="w-full border p-2 rounded" />
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Créer</button>
      </form>
    </div>
  );
}
