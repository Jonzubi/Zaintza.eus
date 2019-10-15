import React from "react";
import Cabecera from "./components/header";
import MenuPerfil from "./components/menuPerfil";
import SlideTab from "./components/slideTab";

class App extends React.Component {
  
  render() {
    return (
      <div style={{height:2000}} className="container-fluid">
        <MenuPerfil pageWrapId={"cabecera"}/>
        <Cabecera id="cabecera" />
        <SlideTab className="h-100"/>
      </div>
    );
  }
}

export default App;
