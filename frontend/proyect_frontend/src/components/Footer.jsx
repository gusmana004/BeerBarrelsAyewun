export function Footer() {
  return (
    <footer style={Styles.Footer}>
      <p>
        Desarrollado por {""}
        <a
          href="https://www.linkedin.com/in/juan-agustín-umaña-silva-3480751a3"
          target="_blank"
          rel="noopener noreferrer"
          style={Styles.link}
        >
          Juan Agustín Umaña Silva
        </a>
      </p>
    </footer>
  );
}

const Styles = {
  footer: {
    textAlign: "center",
    padding: "10px",
    fontSize: "12px",
    color: "#555",
    position: "fixed",
    bottom: "10px",
    width: "100%",
  },
  text: {
    fontSize: "14px",
  },
  link: {
    textDecoration: "none",
    color: "#0077b5",
    fontWeight: "bold",
    fontSize: "14px",
  },
};

export default Footer;
