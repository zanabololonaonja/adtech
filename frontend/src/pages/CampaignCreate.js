
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
    <div className="max-w-md mx-auto rounded-2xl shadow-lg bg-white overflow-hidden">
    
      <div className="bg-[#e3f2fa] px-6 py-6 text-center rounded-t-2xl">
        <h1 className="text-2xl font-bold mb-1 text-[#1a4a65]">Créer une campagne</h1>
        <p className="text-[#1a4a65]/80 text-sm">Remplissez le formulaire pour ajouter une nouvelle campagne</p>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#1a4a65] mb-1">Nom</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" className="w-full border-b-2 border-[#e3f2fa] focus:border-[#1a4a65] outline-none p-2 bg-transparent" />
          </div>
          <div>
            <label className="block text-xs text-[#1a4a65] mb-1">Annonceur</label>
            <input name="advertiser" value={form.advertiser} onChange={handleChange} placeholder="Annonceur" className="w-full border-b-2 border-[#e3f2fa] focus:border-[#1a4a65] outline-none p-2 bg-transparent" />
          </div>
          <div>
            <label className="block text-xs text-[#1a4a65] mb-1">Date début</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full border-b-2 border-[#e3f2fa] focus:border-[#1a4a65] outline-none p-2 bg-transparent" />
          </div>
          <div>
            <label className="block text-xs text-[#1a4a65] mb-1">Date fin</label>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="w-full border-b-2 border-[#e3f2fa] focus:border-[#1a4a65] outline-none p-2 bg-transparent" />
          </div>
          <div>
            <label className="block text-xs text-[#1a4a65] mb-1">Budget</label>
            <input name="budget" value={form.budget} onChange={handleChange} placeholder="Budget" className="w-full border-b-2 border-[#e3f2fa] focus:border-[#1a4a65] outline-none p-2 bg-transparent" />
          </div>
          <div>
            <label className="block text-xs text-[#1a4a65] mb-1">Pays cibles</label>
            <input name="targetCountries" value={form.targetCountries} onChange={handleChange} placeholder="Pays cibles (séparés par des virgules)" className="w-full border-b-2 border-[#e3f2fa] focus:border-[#1a4a65] outline-none p-2 bg-transparent" />
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        <button type="submit" className="w-full mt-4 bg-[#1a4a65] text-white font-bold py-3 rounded-full shadow-lg hover:bg-[#183153] transition">Créer</button>
      </form>
    </div>
  );
}
