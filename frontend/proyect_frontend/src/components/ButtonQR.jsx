import "../styles/Buttons.css";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import React from "react";

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

// Simulación de base de datos segura
const VALID_BARRELS = [
  { id: "BARRIL-0001", token: "3f6e9c85c1" },
  { id: "BARRIL-0002", token: "abc123xyz" },
];

export function ButtonQR({ icon }) {
  const [scan, setScan] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [isShown, setIsShown] = React.useState(false);
  const [responseMessage, setResponseMessage] = React.useState("");
  const [isAccessGranted, setIsAccessGranted] = React.useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setIsShown(true);
    setScan(true);
    setResponseMessage("");
    setIsAccessGranted(false);
    setData(null);
  };

  const handleCancel = () => {
    setIsShown(false);
    setScan(false);
    setData(null);
    setResponseMessage("");
    setIsAccessGranted(false);
  };

  const handleOk = () => {
    setIsShown(false);
    setScan(false);

    if (isAccessGranted) {
      console.log("✅ Acceso concedido desde QR");
      // Aquí puedes llamar a Supabase para actualizar el estado
    }
  };

  const handleQRResult = (text) => {
    setScan(true);

    let json;
    try {
      json = JSON.parse(text);
      setData(JSON.stringify(json, null, 2)); // Mostrar bonito en pantalla

      const isValid = VALID_BARRELS.some(
        (entry) => entry.id === json.id && entry.token === json.token
      );

      if (isValid) {
        setResponseMessage(`✅ Acceso permitido para ${json.id}`);
        setIsAccessGranted(true);
      } else {
        setResponseMessage("⛔ Token inválido o ID no reconocido");
        setIsAccessGranted(false);
      }
    } catch (e) {
      setData(text);
      setResponseMessage("❌ QR no contiene JSON válido");
      setIsAccessGranted(false);
    }

    console.log("Texto leído desde QR:", text);
  };

  return (
    <div className="ButtonQRContainer">
      <button className="ButtonQR" onClick={handleClick}>
        <img src={icon} alt="icon" className="Icon" />
      </button>

      {isShown && (
        <div className="scanerContainer">
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
                <button className="qrActionButton ok" onClick={handleOk}>
                  OK
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
