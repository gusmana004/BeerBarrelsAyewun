import "./App.css";
import { ButtonQR } from "./components/ButtonQR";
import Logo from "./assets/LogoAyewun.png";
import Footer from "./components/Footer";
import FormCode from "./components/FormCode";

function App() {
  return (
    <div className="AppContainer">
      <div className="Card">
        <div>
          <img src={Logo} alt="Logo" className="Logo" />
        </div>
        <h1 className="TitleContaiiner">Escanear QR Ayewun</h1>
        <div className="Button_Container">
          <ButtonQR icon="/QR5.jpg" />
        </div>
        <p className="Text">
          Escanea para acceder o modificar datos e información de manera rápida
          y sencilla.
        </p>
        <FormCode />
      </div>
      <Footer />
    </div>
  );
}

export default App;
