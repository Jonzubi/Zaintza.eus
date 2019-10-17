import React from "react";
import MenuPerfil from "./components/menuPerfil";
import Cabecera from "./components/header";
import Avatar from "react-avatar";
import SlideTab from "./components/slideTab";
import Tabla from "autoresponsive-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPhone } from "@fortawesome/free-solid-svg-icons";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenMenuPerfil: false
    };
  }
  handleStateChange(state) {
    this.setState({ isOpenMenuPerfil: state.isOpen });
  }

  //Abre o cierra el menu segun el estado actual
  toggleMenu() {
    this.setState(state => ({ isOpenMenuPerfil: !state.isOpenMenuPerfil }));
  }

  render() {
    return (
      <div id="outer-container" style={{ height: 2000 }} className="w-100">
        <MenuPerfil myIsOpenMenuPerfil={this.state.isOpenMenuPerfil} myHandleStateChange={this.handleStateChange.bind(this)} />
        <Cabecera myToogleMenu= {this.toggleMenu.bind(this)} />
        <div className="table">
          <div className="card w-20 m-4" style={{width:"18rem"}}>
            <div className="card-body">
              <img src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2" class="card-img-top" alt="..." />
              <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
              <p className="card-text">
                Hola, soy un puto pederasta y me gusta violar
              </p>
              <a href="#" className="mr-0 w-100 btn btn-success">
               
                Contactar 
                <FontAwesomeIcon className="ml-1" icon={faPhone}/>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
