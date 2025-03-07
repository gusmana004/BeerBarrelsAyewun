import "../styles/Buttons.css"

export function ButtonQR({icon}) {
    return(
        <button className="ButtonQR">
             <img src={icon} alt="icon" className="Icon"/>
        </button>
    );
}