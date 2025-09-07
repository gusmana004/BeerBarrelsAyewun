import BarcodeScannerComponent from "react-qr-barcode-scanner";

export function QRScanner({ onResult, onCancel }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[300px] h-[300px] border-4 border-[#fff7d4] rounded-xl overflow-hidden">
        <BarcodeScannerComponent
          width="100%"
          height="100%"
          onUpdate={(err, result) => {
            if (result) onResult(result.text);
          }}
        />
      </div>
      <button
        onClick={onCancel}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl"
      >
        Cancelar Escaneo
      </button>
    </div>
  );
}
