export function Footer() {
  return (
    <footer className="text-center p-2 text-xs text-gray-500 fixed bottom-2 w-full">
      <p className="text-sm">
        Desarrollado por{" "}
        <a
          href="https://www.linkedin.com/in/juan-agustín-umaña-silva-3480751a3"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline text-blue-600  hover:text-blue-800 transition duration-300"
        >
          Juan Agustín Umaña Silva
        </a>{" "}
        y{" "}
        <a
          href="https://www.linkedin.com/in/benjamin-jimenez-ruiz-902937343"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline text-blue-600  hover:text-blue-800 transition duration-300"
        >
          Benjamín Alejandro Jimenez Ruiz
        </a>
      </p>
    </footer>
  );
}

export default Footer;
