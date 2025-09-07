export function CreateBarrelForm({
  barrelId,
  barrelCapacity,
  setBarrelCapacity,
  onSubmit,
}) {
  return (
    <div className="mt-6 bg-[#3f3f3f] p-4 rounded-xl">
      <p className="mb-4">
        El barril con ID <span className="font-bold">'{barrelId}'</span> no
        existe. Ingrese los datos para crearlo:
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
  );
}
