import React, { useState } from "react";

import "../styles/FormCode.css";
export function FormCode() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert("Registrado con éxito");
    }, 2000);
  };
  return (
    <form className="FormCode" onSubmit={handleSubmit}>
      <p>Ingrese el codigo de la etiqueta</p>
      <label>
        Código :
        <input type="text" />
      </label>
      <input type="submit" value="Enviar" />
      {isLoading && (
        <div className="LoadingContainer">
          <div className="spinner"></div> <p>Enviando...</p>{" "}
        </div>
      )}
    </form>
  );
}
export default FormCode;
