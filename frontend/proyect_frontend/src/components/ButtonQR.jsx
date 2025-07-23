import "../styles/Buttons.css";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import React from "react";
import { supabase } from "../supabaseClient"; // Importa tu cliente de Supabase

export function ScannerQR({ onResult }) {
  return (
    <div
      style={{ width: "100%", maxWidth: 400, height: "100%", maxHeight: 400 }}
    >
      <BarcodeScannerComponent
        width="100%"
        height="100%"
        onUpdate={(err, result) => {
          if (result) {
            onResult(result.text);
          }
          if (err) {
            console.error(err);
          }
        }}
      />
    </div>
  );
}

export function ButtonQR({ icon }) {
  const [scan, setScan] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [isShown, setIsShown] = React.useState(false);
  const [responseMessage, setResponseMessage] = React.useState("");
  const [isAccessGranted, setIsAccessGranted] = React.useState(false);
  const [scannedBarrelId, setScannedBarrelId] = React.useState(null); // Nuevo: ID del barril escaneado
  const [barrelStatus, setBarrelStatus] = React.useState(null); // Nuevo: Estado del barril (true/false para esta_vacio)
  const [showStatusOptions, setShowStatusOptions] = React.useState(false); // Nuevo: Para controlar la vista de opciones de estado

  const handleClick = (e) => {
    e.preventDefault();
    setIsShown(true);
    setScan(true);
    setResponseMessage("");
    setIsAccessGranted(false);
    setData(null);
    setScannedBarrelId(null); // Resetear
    setBarrelStatus(null); // Resetear
    setShowStatusOptions(false); // Resetear
  };

  const handleCancel = () => {
    setIsShown(false);
    setScan(false);
    setData(null);
    setResponseMessage("");
    setIsAccessGranted(false);
    setScannedBarrelId(null); // Resetear
    setBarrelStatus(null); // Resetear
    setShowStatusOptions(false); // Resetear
  };

  // Función para volver al escáner sin cerrar la interfaz completa
  const handleBackToScan = () => {
    setScan(true); // Activa el escáner de nuevo
    setResponseMessage(""); // Limpia mensajes de respuesta
    setIsAccessGranted(false); // Revoca acceso temporalmente para escanear de nuevo
    setData(null); // Limpia datos del QR anterior
    setScannedBarrelId(null); // Limpia ID del barril
    setBarrelStatus(null); // Limpia estado del barril
    setShowStatusOptions(false); // Oculta opciones de estado
  };

  // Esta función ahora solo cierra la interfaz si el usuario hace OK después de una acción
  const handleOk = () => {
    handleCancel(); // Simplemente usamos handleCancel para cerrar todo
  };

  const toggleBarrelStatus = async () => {
    if (!scannedBarrelId || barrelStatus === null) return; // Asegurarse de que tenemos un barril y su estado

    const nuevoEstadoVacio = !barrelStatus; // El nuevo estado es el opuesto al actual

    try {
      // 1. Actualizar el estado actual en la tabla 'barrels'
      const { error: updateError } = await supabase
        .from("barrels")
        .update({ esta_vacio: nuevoEstadoVacio })
        .eq("id", scannedBarrelId);

      if (updateError) {
        console.error("Error al actualizar estado del barril:", updateError);
        setResponseMessage("❌ Error al actualizar estado del barril.");
        return;
      }

      // 2. Insertar un registro en la tabla 'barrel_status_history'
      const { error: historyError } = await supabase
        .from("barrel_status_history")
        .insert([
          {
            barrel_id: scannedBarrelId,
            estado_anterior: barrelStatus,
            estado_nuevo: nuevoEstadoVacio,
          },
        ]);

      if (historyError) {
        console.error("Error al registrar historial:", historyError);
        setResponseMessage(
          "⚠️ Estado actualizado, pero error al registrar historial."
        );
        // Considera revertir si esto es crítico
      } else {
        setResponseMessage(
          `✅ Estado de ${scannedBarrelId} actualizado a: ${
            nuevoEstadoVacio ? "Vacío" : "No Vacío"
          }.`
        );
      }

      setBarrelStatus(nuevoEstadoVacio); // Actualiza el estado localmente
    } catch (e) {
      console.error("Error inesperado al cambiar estado:", e);
      setResponseMessage("❌ Error inesperado al cambiar estado.");
    }
  };

  const handleQRResult = async (text) => {
    setScan(false); // Detenemos el escáner una vez que hay un resultado para mostrar las opciones

    let json;
    try {
      json = JSON.parse(text);
      setData(JSON.stringify(json, null, 2)); // Mostrar bonito en pantalla

      // --- Consultar Supabase para validar y obtener el estado ---
      const { data: barrels, error } = await supabase
        .from("barrels")
        .select("id, token, esta_vacio") // ¡Solicitamos 'esta_vacio' también!
        .eq("id", json.id)
        .eq("token", json.token);

      if (error) {
        console.error("Error al consultar Supabase:", error);
        setResponseMessage("❌ Error de conexión o base de datos");
        setIsAccessGranted(false);
      } else if (barrels && barrels.length > 0) {
        // Si se encontró un barril que coincide
        const barrilEncontrado = barrels[0];
        setScannedBarrelId(barrilEncontrado.id);
        setBarrelStatus(barrilEncontrado.esta_vacio); // Guardamos el estado del barril
        setResponseMessage(`✅ Barril ${barrilEncontrado.id} identificado.`);
        setIsAccessGranted(true); // Concedemos acceso para mostrar las opciones
        setShowStatusOptions(true); // Mostramos las opciones de estado
      } else {
        // No se encontró ninguna coincidencia
        setResponseMessage("⛔ Token inválido o ID no reconocido");
        setIsAccessGranted(false);
        setScannedBarrelId(null);
        setBarrelStatus(null);
        setShowStatusOptions(false);
      }
    } catch (e) {
      setData(text);
      setResponseMessage("❌ QR no contiene JSON válido");
      setIsAccessGranted(false);
      setScannedBarrelId(null);
      setBarrelStatus(null);
      setShowStatusOptions(false);
    }

    console.log("Texto leído desde QR:", text);
  };

  return (
    <div className="ButtonQRContainer">
      {!isShown && (
        <button className="ButtonQR" onClick={handleClick}>
          {icon}
        </button>
      )}

      {isShown && (
        <div className="scanerContainer">
          {/* Mostramos el escáner solo si 'scan' es true */}
          {scan && (
            <>
              <ScannerQR onResult={handleQRResult} />
              {data && <pre className="qrText">Contenido del QR: {data}</pre>}
              {responseMessage && (
                <p className="qrResponse">{responseMessage}</p>
              )}
              <div className="buttonRow">
                <button
                  className="qrActionButton cancel"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                {/* No mostramos el botón OK aquí si vamos a mostrar las opciones de estado */}
              </div>
            </>
          )}

          {/* Mostramos la información del barril y las opciones si isAccessGranted es true y no estamos escaneando */}
          {!scan &&
            isAccessGranted &&
            showStatusOptions &&
            scannedBarrelId &&
            barrelStatus !== null && (
              <div className="barrel-info-section">
                <p className="qrResponse">
                  Barril: <strong>{scannedBarrelId}</strong>
                </p>
                <p className="qrResponse">
                  Estado actual:{" "}
                  <strong>{barrelStatus ? "Vacío" : "No Vacío"}</strong>
                </p>

                <div className="buttonRow">
                  <button
                    className="qrActionButton back"
                    onClick={handleBackToScan}
                  >
                    Volver a escanear
                  </button>
                  <button
                    className="qrActionButton modify-status"
                    onClick={toggleBarrelStatus}
                  >
                    {barrelStatus
                      ? "Marcar como No Vacío"
                      : "Marcar como Vacío"}
                  </button>
                  <button className="qrActionButton ok" onClick={handleOk}>
                    Listo
                  </button>
                </div>
                {responseMessage && ( // Muestra el mensaje de respuesta (ej. de actualización) aquí también
                  <p className="qrResponse">{responseMessage}</p>
                )}
              </div>
            )}

          {/* Si no hay acceso concedido y no estamos escaneando, mostramos solo un mensaje y botón para volver a escanear */}
          {!scan && !isAccessGranted && responseMessage && (
            <div className="barrel-info-section">
              <p className="qrResponse">{responseMessage}</p>
              <button
                className="qrActionButton back"
                onClick={handleBackToScan}
              >
                Volver a escanear
              </button>
              <button className="qrActionButton cancel" onClick={handleCancel}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
