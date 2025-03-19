import "../styles/Buttons.css"

export function ButtonQR({icon}) {
    const handleCapture = (event) => {
        const file = event.target.files[0];
        if(file){
            console.log("imagen lista",file);
        }
    }
    return(
        <div>
            <button className="ButtonQR" onClick={() => document.getElementById('inputFile').click()}>
            <img src={icon} alt="icon" className="Icon" />
            </button>
            <input 
                type="file" 
                id="inputFile" 
                accept="image/*" 
                capture="environment"
                style={{display: 'none'}}
                onChange={handleCapture}/>
        </div>
    );
}