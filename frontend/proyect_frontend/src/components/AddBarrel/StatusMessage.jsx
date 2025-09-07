export function StatusMessage({ message }) {
  if (!message) return null;
  return (
    <p
      className={`mt-4 text-center font-semibold ${
        message.includes("✅") ? "text-green-400" : "text-red-400"
      }`}
    >
      {message}
    </p>
  );
}
