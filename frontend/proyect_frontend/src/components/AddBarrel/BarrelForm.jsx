export function BarrelForm({ barrelId, setBarrelId, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
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
  );
}
