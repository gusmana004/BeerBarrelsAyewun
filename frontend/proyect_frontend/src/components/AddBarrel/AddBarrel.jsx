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
  const [barrelCapacity, setBarrelCapacity] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [message, setMessage] = useState("");
  const [barrelData, setBarrelData] = useState(null);
  const [barrelStateData, setBarrelStateData] = useState(null);

  // 🔹 Nueva función para
  //  y su estado
  const buscarBarril = async (id) => {
    setBarrelData(null);
    setBarrelStateData(null);
    setScanMode(false);
    setMessage("Buscando barril...");

    if (!id) {
      setMessage("Por favor, ingrese un ID de barril.");
      return;
    }

    try {
      const { data: barrel, error } = await supabase
        .from("barriles")
        .select("id, numero, capacidad")
        .eq("id", id)
        .single();

      if (error && error.code === "PGRST116") {
        setMessage(`❌ Barril con ID '${id}' no encontrado.`);
        setBarrelData({ id });
        setBarrelStateData({ estado: "No encontrado" });
      } else if (barrel) {
        // Barril encontrado, ahora busca su estado
        const { data: estado, error: estadoError } = await supabase
          .from("estado_actual_barril")
          .select("estado, sabor, lugar, evento_id")
          .eq("barril_id", id)
          .order("fecha_cambio", { ascending: false })
          .limit(1)
          .single();

        setBarrelData(barrel);

        if (estadoError && estadoError.code === "PGRST116") {
          // Barril existe pero no tiene un estado registrado
          setMessage(
            `✅ Barril con ID '${id}' encontrado. Se necesita definir su estado.`
          );
          setBarrelStateData({ estado: "Vacio" }); // Lo tratamos como vacío para inicializarlo
        } else if (estado) {
          setMessage(
            `✅ Barril con ID '${id}' encontrado. Estado: ${estado.estado}`
          );
          setBarrelStateData(estado);
        } else {
          setMessage("❌ Error al buscar el estado del barril.");
        }
      } else {
        setMessage("❌ Error en la búsqueda.");
      }
    } catch {
      setMessage("❌ Error inesperado.");
    }
  };

  // 🔹 Cuando el usuario busca manualmente
  const handleManualSubmit = (e) => {
    e.preventDefault();
    buscarBarril(barrelId);
  };

  // 🔹 Cuando escanea un QR
  const handleQRResult = (id) => {
    setBarrelId(id);
    setMessage("📡 Escaneado, buscando barril...");
    buscarBarril(id);
  };

  // 🔹 Crear nuevo barril (lógica original)
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
    } catch {
      setMessage("❌ Error inesperado al crear.");
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#2c2c2c] text-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Gestor Barril</h2>
      {/* Botón de escaneo, visible si no se ha buscado un barril */}
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
      {/* Formulario de entrada manual, visible si no se ha buscado un barril */}
      {!scanMode && !barrelData && (
        <BarrelForm
          barrelId={barrelId}
          setBarrelId={setBarrelId}
          onSubmit={handleManualSubmit}
        />
      )}
      {/* Mensaje de estado */}
      <StatusMessage message={message} />

      {/* Formulario para crear un barril nuevo (si se escaneó un ID que no existe) */}
      {!scanMode && barrelData && !barrelData.numero && (
        <CreateBarrelForm
          barrelId={barrelData.id}
          barrelCapacity={barrelCapacity}
          setBarrelCapacity={setBarrelCapacity}
          onSubmit={handleCreateBarrel}
        />
      )}
      {/* Nuevo componente para gestionar el estado de un barril existente */}
      {barrelStateData && barrelStateData.estado !== "No encontrado" && (
        <BarrelStateForm
          barrelData={barrelData}
          barrelStateData={barrelStateData}
          setMessage={setMessage}
          setBarrelStateData={setBarrelStateData}
        />
      )}
      <button
        onClick={() => navigate("/")} // "/" sería tu ruta del menú principal
        className="w-full mt-4 bg-[#3f3f3f] hover:bg-red-500 duration-300 text-lg font-semibold py-2 px-4 rounded-xl"
      >
        Volver al Menú Principal
      </button>
    </div>
  );
}
export default AddBarrel;
