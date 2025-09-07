// src/components/AddBarrel.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export function AddBarrel() {
  const [barrelId, setBarrelId] = useState("");
  const [barrelCapacity, setBarrelCapacity] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [message, setMessage] = useState("");
  const [barrelData, setBarrelData] = useState(null);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setBarrelData(null);
    setScanMode(false);

    if (!barrelId) {
      setMessage("Por favor, ingrese un ID de barril.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("barriles")
        .select("id, numero, capacidad")
        .eq("id", barrelId)
        .single();

      if (error && error.code === "PGRST116") {
        setMessage(`❌ Barril con ID '${barrelId}' no encontrado.`);
        setBarrelData({ id: barrelId });
      } else if (error) {
        setMessage("❌ Error de conexión o base de datos.");
      } else if (data) {
        setMessage(`✅ Barril con ID '${barrelId}' ya existe.`);
        setBarrelData(data);
        setBarrelCapacity(data.capacidad);
      }
    } catch (e) {
      setMessage("❌ Error inesperado.");
    }
  };

  const handleQRResult = (result) => {
    if (result) {
      setBarrelId(result.text);
      setScanMode(false);
      setMessage("ID escaneado. Buscando barril...");
      handleManualSubmit({ preventDefault: () => {} });
    }
  };

  const handleCreateBarrel = async (e) => {
    e.preventDefault();
    setMessage("Creando nuevo barril...");

    if (!barrelCapacity || isNaN(barrelCapacity) || barrelCapacity <= 0) {
      setMessage("Por favor, ingrese una capacidad válida.");
      return;
    }

    try {
      const { data: lastBarrel } = await supabase
        .from("barriles")
        .select("numero")
        .order("numero", { ascending: false })
        .limit(1)
        .single();

      const nextBarrelNumber = lastBarrel ? lastBarrel.numero + 1 : 1;

      const newBarrel = {
        id: barrelData.id,
        numero: nextBarrelNumber,
        capacidad: parseFloat(barrelCapacity),
      };

      const { error: insertError } = await supabase
        .from("barriles")
        .insert([newBarrel]);

      if (insertError) {
        setMessage("❌ Error al crear el barril.");
      } else {
        setMessage(`✅ Barril con ID '${newBarrel.id}' creado exitosamente.`);
        setBarrelData(newBarrel);
        setBarrelId("");
        setBarrelCapacity("");
      }
    } catch (e) {
      setMessage("❌ Error inesperado al crear.");
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#2c2c2c] text-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Escanear Barril</h2>

      {/* Botón para activar el escáner QR */}
      {!scanMode && !barrelData && (
        <button
          onClick={() => setScanMode(true)}
          className="w-full bg-[#3f3f3f] hover:bg-[#fff7d4] hover:text-[#3f3f3f] duration-300 text-lg font-semibold py-2 px-4 rounded-xl mb-4"
        >
          📷 Escanear QR
        </button>
      )}

      {/* Escáner QR */}
      {scanMode && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-[300px] h-[300px] border-4 border-[#fff7d4] rounded-xl overflow-hidden">
            <BarcodeScannerComponent
              width="100%"
              height="100%"
              onUpdate={(err, result) => {
                if (result) handleQRResult(result);
              }}
            />
          </div>
          <button
            onClick={() => setScanMode(false)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl"
          >
            Cancelar Escaneo
          </button>
        </div>
      )}

      {/* Formulario de entrada manual */}
      {!scanMode && !barrelData && (
        <form
          onSubmit={handleManualSubmit}
          className="flex flex-col gap-4 mt-4"
        >
          <input
            type="text"
            value={barrelId}
            onChange={(e) => setBarrelId(e.target.value.trim())}
            placeholder="Ingrese ID del barril (ej. AB12)"
            className="px-4 py-2 rounded-xl border border-gray-400 text-white"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl"
          >
            Buscar Barril
          </button>
        </form>
      )}

      {/* Mensajes de estado */}
      {message && (
        <p
          className={`mt-4 text-center font-semibold ${
            message.includes("✅") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      {/* Opciones si el barril no existe */}
      {!scanMode && barrelData && !barrelData.numero && (
        <div className="mt-6 bg-[#3f3f3f] p-4 rounded-xl">
          <p className="mb-4">
            El barril con ID{" "}
            <span className="font-bold">'{barrelData.id}'</span> no existe.
            Ingrese los datos para crearlo:
          </p>
          <form onSubmit={handleCreateBarrel} className="flex flex-col gap-4">
            <label htmlFor="capacity" className="font-semibold">
              Capacidad (litros):
            </label>
            <input
              id="capacity"
              type="number"
              value={barrelCapacity}
              onChange={(e) => setBarrelCapacity(e.target.value)}
              placeholder="Ej: 50"
              required
              className="px-4 py-2 rounded-xl border border-gray-400 text-black"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl"
            >
              Crear Barril Nuevo
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddBarrel;
