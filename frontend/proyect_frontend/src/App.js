import './App.css';
import { ButtonQR } from './components/ButtonQR';
import Logo from './assets/LogoAyewun.png';

function App() {
  return (
    <div className='AppContainer'>
      <div className="Card">
        <div>
          <img src={Logo} alt="Logo" className="Logo"/>
        </div>
        <h3 className="TitleContaiiner">
          Escanear QR Ayewun
        </h3>
        <div className="Button_Container">
          <ButtonQR  icon='/QR5.jpg'/>
        </div>
        <p className='Text'>
        Escanea para acceder o modificar datos e información de manera rápida y sencilla.
        </p>
      </div>
      <span className="Footer">
        Desarrollado por 
      </span>
      
    </div>
    
  );
}

export default App;
