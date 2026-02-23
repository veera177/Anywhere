import React,{ useState } from "react"

function Button(){
  const [color , setcolor] = useState("#fff");

function changecolor(event){
  setcolor(event.target.value);
}

  return(
    <div className="color-display">
      <h1>COLOR PICKER</h1>
      <div className="display-back" style={{backgroundColor: color}}>
        <p>selected color: {color}</p>
      </div>
      <label className="display-h1">select an color:</label>
      <input type="color" value={color} onChange={changecolor} className="input"/>
    </div>
  );
}

export default Button