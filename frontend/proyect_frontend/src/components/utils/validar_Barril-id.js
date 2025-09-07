export function validateBarrelId(id) {
  // formato esperado: 3 letras + 3 números (ej. "ABC012")
  const regex = /^[A-Z]{3}\d{3}$/;
  return regex.test(id);
}
