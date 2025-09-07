// Nuevo componente para manejar los cambios de estado del barril existente
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
export function BarrelStateForm({
  barrelData,
  barrelStateData,
  setMessage,
  setBarrelStateData,
}) {
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔹 Cargar eventos si el usuario selecciona 'En Evento'
  useEffect(() => {
    if (selectedPlace === "Evento") {
      const fetchEvents = async () => {
        setLoadingEvents(true);
        const { data, error } = await supabase
          .from("eventos")
          .select("id, nombre")
          .is("fecha_fin", null) // Solo eventos activos
          .order("fecha_inicio", { ascending: false });

        if (error) {
          setMessage("❌ Error al cargar los eventos.");
        } else {
          setEvents(data);
        }
        setLoadingEvents(false);
      };
      fetchEvents();
    }
  }, [selectedPlace, setMessage]);

  // 🔹 Enviar el nuevo estado del barril
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    let newBarrelState;
    let successMessage;

    if (barrelStateData.estado === "Vacio" || !barrelStateData.estado) {
      if (!selectedFlavor || !selectedPlace) {
        setMessage("Por favor, seleccione un sabor y lugar.");
        setIsUpdating(false);
        return;
      }

      if (selectedPlace === "Evento" && !selectedEvent) {
        setMessage("Por favor, seleccione un evento.");
        setIsUpdating(false);
        return;
      }

      newBarrelState = {
        barril_id: barrelData.id,
        estado: "Lleno",
        sabor: selectedFlavor,
        lugar: selectedPlace,
        evento_id: selectedPlace === "Evento" ? selectedEvent : null,
        fecha_cambio: new Date().toISOString(),
        fecha_vaciado: null,
      };

      successMessage = `✅ Barril con ID '${barrelData.id}' declarado como lleno.`;
    } else if (
      barrelStateData.estado === "Lleno" ||
      barrelStateData.estado === "En Evento"
    ) {
      newBarrelState = {
        barril_id: barrelData.id,
        estado: "Vacio",
        sabor: null,
        lugar: null,
        evento_id: null,
        fecha_cambio: new Date().toISOString(),
        fecha_vaciado: new Date().toISOString(),
      };
      successMessage = `✅ Barril con ID '${barrelData.id}' declarado como vacío.`;
    }

    if (newBarrelState) {
      // Usamos upsert para actualizar el registro existente
      const { error } = await supabase
        .from("estado_actual_barril")
        .upsert([newBarrelState]);

      if (error) {
        setMessage("❌ Error al actualizar el estado del barril.");
      } else {
        setMessage(successMessage);
        setBarrelStateData({
          ...barrelStateData,
          estado: newBarrelState.estado,
        });
        setSelectedFlavor("");
        setSelectedPlace("");
        setSelectedEvent("");
      }
    }

    setIsUpdating(false);
  };

  return (
    <div className="bg-[#3f3f3f] p-4 rounded-xl mt-4">
      <h3 className="text-xl font-bold mb-2 text-center">Barril Existente</h3>
      <p className="text-lg font-bold text-center mb-4">ID: {barrelData.id}</p>
      <p className="text-center font-semibold mb-4">
        Estado Actual:
        <span
          className={`font-bold ml-2 ${
            barrelStateData.estado === "Vacio"
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {barrelStateData.estado || "No definido"}
        </span>
      </p>

      {/* Condicional para cambiar de Vacío a Lleno */}
      {(barrelStateData.estado === "Vacio" || !barrelStateData.estado) && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Sabor</label>
            <input
              type="text"
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              className="w-full bg-[#2c2c2c] rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none"
              placeholder="Ej. Golden Ale"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Lugar</label>
            <select
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="w-full bg-[#2c2c2c] rounded-lg p-2 text-white focus:outline-none"
              required
            >
              <option value="">Seleccione un lugar</option>
              <option value="Cámara">Cámara</option>
              <option value="Carro">Carro</option>
              <option value="Evento">Evento</option>
            </select>
          </div>

          {selectedPlace === "Evento" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Seleccionar Evento
              </label>
              {loadingEvents ? (
                <p>Cargando eventos...</p>
              ) : events.length > 0 ? (
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full bg-[#2c2c2c] rounded-lg p-2 text-white focus:outline-none"
                  required
                >
                  <option value="">Seleccione un evento</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No hay eventos disponibles.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-green-500 hover:bg-green-600 duration-300 text-lg font-semibold py-2 px-4 rounded-xl"
          >
            {isUpdating ? "Actualizando..." : "Llenar Barril"}
          </button>
        </form>
      )}

      {/* Condicional para cambiar a Vacío */}
      {(barrelStateData.estado === "Lleno" ||
        barrelStateData.estado === "En Evento") && (
        <div className="mt-4">
          <p className="text-center mb-4">
            ¿Desea marcar este barril como vacío?
          </p>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="w-full bg-red-500 hover:bg-red-600 duration-300 text-lg font-semibold py-2 px-4 rounded-xl"
          >
            {isUpdating ? "Actualizando..." : "Marcar como Vacío"}
          </button>
        </div>
      )}
    </div>
  );
}
