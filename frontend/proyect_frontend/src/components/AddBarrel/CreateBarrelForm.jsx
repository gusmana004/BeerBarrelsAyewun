import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export function CreateBarrelForm({
  barrelId,
  selectedTipoId,
  setSelectedTipoId,
  onSubmit,
}) {
  const [tiposBarriles, setTiposBarriles] = useState([]);

  // 🔹 Obtener tipos de barriles desde la DB
  useEffect(() => {
    const fetchTipos = async () => {
      const { data, error } = await supabase
        .from("tipos_barriles")
        .select("id, capacidad, descripcion")
        .order("capacidad", { ascending: true });

      if (error) {
        console.error("Error al obtener tipos de barriles:", error);
        return;
      }
      setTiposBarriles(data);
    };

    fetchTipos();
  }, []);

  return (
    <div className="mt-6 bg-[#3f3f3f] p-4 rounded-xl">
      <p className="mb-4">
        El barril con ID <span className="font-bold">'{barrelId}'</span> no
        existe. Seleccione un tipo de barril para crearlo:
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label htmlFor="tipo" className="font-semibold">
          Tipo de Barril:
        </label>
        <select
          id="tipo"
          value={selectedTipoId}
          onChange={(e) => setSelectedTipoId(e.target.value)}
          required
          className="px-4 py-2 rounded-xl border border-gray-400 text-black"
        >
          <option value="">-- Seleccione un tipo --</option>
          {tiposBarriles.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.capacidad} litros{" "}
              {tipo.descripcion ? `(${tipo.descripcion})` : ""}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl"
        >
          Crear Barril Nuevo
        </button>
      </form>
    </div>
  );
}
