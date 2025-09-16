import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { QRScanner } from "./QRScanner";
import { BarrelForm } from "./BarrelForm";
import { CreateBarrelForm } from "./CreateBarrelForm";
import { StatusMessage } from "./StatusMessage";
import { BarrelStateForm } from "./BarrelStateForm";
import { useNavigate } from "react-router-dom";

export function AddBarrel() {
  const navigate = useNavigate();
  const [barrelId, setBarrelId] = useState("");
  const [selectedTipoId, setSelectedTipoId] = useState(""); // Tipo de barril al crear
  const [scanMode, setScanMode] = useState(false);
  const [message, setMessage] = useState("");
  const [barrelData, setBarrelData] = useState(null);
  const [barrelStateData, setBarrelStateData] = useState(null);

  // 🔹 Buscar barril por ID y traer estado actual
  const buscarBarril = async (id) => {
    setBarrelData(null);
    setBarrelStateData(null);
    setScanMode(false);

    if (!id) {
      setMessage("Por favor, ingrese un ID de barril.");
      return;
    }

    setMessage("Buscando barril...");

    try {
      // 1️⃣ Traer info básica del barril
      const { data: barrels, error: barrelsError } = await supabase.rpc(
        "get_barriles",
        { bid: id }
      );

      if (barrelsError) throw barrelsError;

      const barrel = barrels[0];

      if (!barrel) {
        setMessage(`❌ Barril con ID '${id}' no encontrado.`);
        setBarrelData({ id });
        setBarrelStateData({ estado: "No encontrado" });
        return;
      }

      setBarrelData({
        id: barrel.barril_id,
        numero: barrel.numero,
        tipo_id: barrel.tipo_id,
        capacidad: barrel.capacidad,
        ...barrel,
      });

      // 2️⃣ Traer estado actual del barril
      const { data: estadoActual, error: estadoError } = await supabase.rpc(
        "get_barril_info", // 👈 nombre correcto
        { bid: id }
      );

      if (estadoError) throw estadoError;

      const estado = estadoActual[0];

      setBarrelStateData({
        estado: estado?.estado || "Vacio",
        sabor: estado?.sabor || null,
        lugar: estado?.lugar || null,
        evento: estado?.evento || null,
        ultima_vez_llenado: estado?.ultima_vez_llenado || null,
      });

      setMessage(
        `✅ Barril con ID '${id}' encontrado. Estado: ${
          estado?.estado || "Vacio"
        }`
      );
    } catch (err) {
      console.error(err);
      setMessage("❌ Error inesperado al buscar barril.");
    }
  };

  // 🔹 Búsqueda manual
  const handleManualSubmit = (e) => {
    e.preventDefault();
    buscarBarril(barrelId);
  };

  // 🔹 Escaneo QR
  const handleQRResult = (id) => {
    setBarrelId(id);
    setMessage("📡 Escaneado, buscando barril...");
    buscarBarril(id);
  };

  // 🔹 Crear nuevo barril
  const handleCreateBarrel = async (e) => {
    e.preventDefault();
    setMessage("Creando nuevo barril...");

    if (!selectedTipoId) {
      setMessage("Por favor, seleccione un tipo de barril.");
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
        id: barrelId,
        numero: nextBarrelNumber,
        tipo_id: parseInt(selectedTipoId),
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
        setSelectedTipoId("");
        setBarrelStateData({ estado: "Vacio" });
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error inesperado al crear.");
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#2c2c2c] text-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Gestor Barril</h2>

      {/* Botón escaneo */}
      {!scanMode && !barrelData && (
        <button
          onClick={() => setScanMode(true)}
          className="w-full bg-[#3f3f3f] hover:bg-[#fff7d4] hover:text-[#3f3f3f] duration-300 text-lg font-semibold py-2 px-4 rounded-xl mb-4"
        >
          📷 Escanear QR
        </button>
      )}

      {/* Escáner de QR */}
      {scanMode && (
        <QRScanner
          onResult={handleQRResult}
          onCancel={() => setScanMode(false)}
        />
      )}

      {/* Formulario manual */}
      {!scanMode && !barrelData && (
        <BarrelForm
          barrelId={barrelId}
          setBarrelId={setBarrelId}
          onSubmit={handleManualSubmit}
        />
      )}

      {/* Mensaje de estado */}
      <StatusMessage message={message} />

      {/* Formulario creación de nuevo barril */}
      {!scanMode &&
        barrelData &&
        barrelStateData?.estado === "No encontrado" && (
          <CreateBarrelForm
            barrelId={barrelId}
            selectedTipoId={selectedTipoId}
            setSelectedTipoId={setSelectedTipoId}
            onSubmit={handleCreateBarrel}
          />
        )}

      {/* Estado de barril existente */}
      {barrelStateData && barrelStateData.estado !== "No encontrado" && (
        <BarrelStateForm
          barrelData={barrelData}
          barrelStateData={barrelStateData}
          setMessage={setMessage}
          setBarrelStateData={setBarrelStateData}
        />
      )}

      <button
        onClick={() => navigate("/")}
        className="w-full mt-4 bg-[#3f3f3f] hover:bg-red-500 duration-300 text-lg font-semibold py-2 px-4 rounded-xl"
      >
        Volver al Menú Principal
      </button>
    </div>
  );
}

export default AddBarrel;
