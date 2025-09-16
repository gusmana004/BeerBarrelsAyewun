import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export function BarrelStateForm({
  barrelData,
  barrelStateData,
  setMessage,
  setBarrelStateData,
}) {
  const [sabores, setSabores] = useState([]);
  const [selectedSabor, setSelectedSabor] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(""); // 👈 ID de lugar
  const [lugares, setLugares] = useState([]);
  const [loadingLugares, setLoadingLugares] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingSabores, setLoadingSabores] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [estadosMap, setEstadosMap] = useState({}); // nombre -> id

  // 🔹 Cargar sabores
  useEffect(() => {
    const fetchSabores = async () => {
      setLoadingSabores(true);
      const { data, error } = await supabase
        .from("sabores")
        .select("id,nombre");
      if (error) setMessage("❌ Error al cargar los sabores.");
      else setSabores(data);
      setLoadingSabores(false);
    };
    fetchSabores();
  }, [setMessage]);

  // 🔹 Cargar estados
  useEffect(() => {
    const fetchEstados = async () => {
      const { data, error } = await supabase
        .from("estados")
        .select("id,nombre");
      if (!error && data) {
        const map = {};
        data.forEach((e) => (map[e.nombre] = e.id));
        setEstadosMap(map);
      }
    };
    fetchEstados();
  }, []);

  // 🔹 Cargar eventos si se selecciona Evento
  useEffect(() => {
    if (selectedPlaceId) {
      const lugar = lugares.find((l) => l.id === parseInt(selectedPlaceId));
      if (lugar?.nombre === "Evento") {
        const fetchEvents = async () => {
          setLoadingEvents(true);
          const { data, error } = await supabase
            .from("eventos")
            .select("id,nombre")
            .order("fecha_inicio", { ascending: false });
          if (error) setMessage("❌ Error al cargar los eventos.");
          else setEvents(data);
          setLoadingEvents(false);
        };
        fetchEvents();
      }
    }
  }, [selectedPlaceId, lugares, setMessage]);

  // 🔹 Cargar lugares disponibles
  useEffect(() => {
    const fetchLugares = async () => {
      setLoadingLugares(true);
      const { data, error } = await supabase
        .from("lugares")
        .select("id,nombre")
        .eq("disponibilidad", true)
        .order("nombre");
      if (error) setMessage("❌ Error al cargar los lugares.");
      else setLugares(data);
      setLoadingLugares(false);
    };
    fetchLugares();
  }, [setMessage]);

  // filtar Eventos para solo poder seleccionar los Activos
  useEffect(() => {
    if (selectedPlaceId) {
      const lugar = lugares.find((l) => l.id === parseInt(selectedPlaceId));
      if (lugar?.nombre === "Evento") {
        const fetchEvents = async () => {
          setLoadingEvents(true);
          const { data, error } = await supabase
            .from("eventos")
            .select("id,nombre")
            .is("fecha_fin", null) // solo eventos sin fecha de fin
            .order("fecha_inicio", { ascending: false });

          if (error) setMessage("❌ Error al cargar los eventos.");
          else setEvents(data);

          setLoadingEvents(false);
        };
        fetchEvents();
      }
    }
  }, [selectedPlaceId, lugares, setMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    let newState = {};
    let successMessage = "";

    const lugar = lugares.find((l) => l.id === parseInt(selectedPlaceId));

    if (barrelStateData.estado === "Vacio" || !barrelStateData.estado) {
      if (
        !selectedSabor ||
        !selectedPlaceId ||
        (lugar?.nombre === "Evento" && !selectedEvent)
      ) {
        setMessage("Por favor, seleccione sabor, lugar y evento si aplica.");
        setIsUpdating(false);
        return;
      }

      newState = {
        barril_id: barrelData.id,
        estado_id: estadosMap["Lleno"],
        sabor_id: selectedSabor,
        lugar_id: selectedPlaceId,
        evento_id: lugar?.nombre === "Evento" ? selectedEvent : null,
        fecha_cambio: new Date().toISOString(),
        fecha_vaciado: null,
      };

      successMessage = `✅ Barril con ID '${barrelData.id}' declarado como lleno.`;
    } else {
      // Vaciar barril
      newState = {
        barril_id: barrelData.id,
        estado_id: estadosMap["Vacio"],
        sabor_id: null,
        lugar_id: null,
        evento_id: null,
        fecha_cambio: new Date().toISOString(),
        fecha_vaciado: new Date().toISOString(),
      };

      successMessage = `✅ Barril con ID '${barrelData.id}' declarado como vacío.`;
    }

    const { error } = await supabase
      .from("estado_actual_barril")
      .upsert([newState]);

    if (error) {
      setMessage("❌ Error al actualizar el estado del barril.");
    } else {
      const { data: estadoActual, error: estadoError } = await supabase.rpc(
        "get_barril_info",
        {
          bid: barrelData.id,
        }
      );

      if (!estadoError && estadoActual.length > 0) {
        const estado = estadoActual[0];
        setBarrelStateData({
          estado: estado.estado,
          sabor: estado.sabor,
          lugar: estado.lugar,
          evento: estado.evento,
          ultima_vez_llenado: estado.ultima_vez_llenado,
        });
        setMessage(successMessage);
      } else {
        setMessage("❌ Error al obtener el estado actualizado del barril.");
      }

      // Reset de selects
      setSelectedSabor("");
      setSelectedPlaceId("");
      setSelectedEvent("");
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

      {barrelStateData.estado !== "Vacio" && (
        <div className="text-center mb-4">
          {barrelStateData.sabor && (
            <p className="text-sm">
              <span className="font-bold">Sabor:</span> {barrelStateData.sabor}
            </p>
          )}
          {barrelStateData.lugar && (
            <p className="text-sm">
              <span className="font-bold">Lugar:</span> {barrelStateData.lugar}
            </p>
          )}
          {barrelStateData.evento && (
            <p className="text-sm">
              <span className="font-bold">Evento:</span>{" "}
              {barrelStateData.evento}
            </p>
          )}
        </div>
      )}

      {(barrelStateData.estado === "Vacio" || !barrelStateData.estado) && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Sabor</label>
            {loadingSabores ? (
              <p>Cargando sabores...</p>
            ) : (
              <select
                value={selectedSabor}
                onChange={(e) => setSelectedSabor(e.target.value)}
                className="w-full bg-[#2c2c2c] rounded-lg p-2 text-white focus:outline-none"
                required
              >
                <option value="">Seleccione un sabor</option>
                {sabores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Lugar</label>
            {loadingLugares ? (
              <p>Cargando lugares...</p>
            ) : (
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full bg-[#2c2c2c] rounded-lg p-2 text-white focus:outline-none"
                required
              >
                <option value="">Seleccione un lugar</option>
                {lugares.map((lugar) => (
                  <option key={lugar.id} value={lugar.id}>
                    {lugar.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {lugares.find((l) => l.id === parseInt(selectedPlaceId))?.nombre ===
            "Evento" && (
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
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.nombre}
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

      {barrelStateData.estado !== "Vacio" && barrelStateData.estado && (
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
