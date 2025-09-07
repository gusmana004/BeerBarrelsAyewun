import Logo from "./assets/LogoAyewun.png";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CameraQR from "./pages/CameraQR";
import Eventos from "./pages/Eventos";
import InformeBarriles from "./pages/InformeBarriles";

function Home() {
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <img src={Logo} alt="Logo" className="size-72" />
      <h1 className="text-3xl text-[#fff7d4] font-semibold py-8">
        //////////////////////
      </h1>
      <Link to="/camera-qr">
        <button className="px-18 py-4 text-3xl text-white border-2 border-[#fff7d4] rounded-2xl bg-[#3f3f3f] hover:bg-[#fff7d4] hover:text-[#3f3f3f] duration-300">
          Camara QR
        </button>
      </Link>
      <Link to="/eventos">
        <button className="px-24 py-4 text-3xl text-white border-2 border-[#fff7d4] rounded-2xl bg-[#3f3f3f] hover:bg-[#fff7d4] hover:text-[#3f3f3f] duration-300">
          Eventos
        </button>
      </Link>
      <a
        href="https://docs.google.com/spreadsheets/d/1LvimH8GQ6LW1_HE_S70RWiCDGJr327NhYcBR1nTUYH8/edit?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="px-11 py-4 text-3xl text-white border-2 border-[#fff7d4] rounded-2xl bg-[#3f3f3f] hover:bg-[#fff7d4] hover:text-[#3f3f3f] duration-300"
      >
        Informe Barriles
      </a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="bg-[#1f1f1f] min-h-screen flex flex-col items-center justify-center">
        <div className="Card">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/camera-qr" element={<CameraQR />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/informe-barriles" element={<InformeBarriles />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
