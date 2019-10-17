import React from "react";
import { slide as BurgerMenu } from "react-burger-menu";
import Headroom from "react-headroom";
import Avatar from "react-avatar";
import SlideTab from "./components/slideTab";
import Tabla from "autoresponsive-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPhone } from "@fortawesome/free-solid-svg-icons";
import "./components/styles/header.css";
import "./components/styles/menuPerfil.css";

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
        <BurgerMenu
          customBurgerIcon={false}
          customCrossIcon={<FontAwesomeIcon icon={faTimes} />}
          onStateChange={state => this.handleStateChange(state)}
          outerContainerId={"outer-container"}
          className="bg-dark"
          isOpen={this.state.isOpenMenuPerfil}
          pageWrapId={"headRoom"}
          right
        >
          <Avatar
            name=""
            src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
            size={250}
            round="125px"
            className="mx-auto pt-3"
          />
          <div
            id="menu-perfil-opciones"
            className="container-fluid mt-5 btn-group-vertical"
          >
            <button
              id="home"
              type="button"
              className="w-100 btn btn-secondary"
              href="#"
            >
              Calendario
            </button>
            <button
              id="about"
              type="button"
              className="w-100 btn btn-secondary"
              href="#"
            >
              Contratos
            </button>
            <button
              id="contact"
              type="button"
              className="w-100 btn btn-secondary"
              href=""
            >
              Salir
            </button>
          </div>
        </BurgerMenu>
        <Headroom id="headRoom" className="bg-dark text-center w-100">
          <h1 className="w-100 d-inline display-1 text-light">Zainduz</h1>
          <Avatar
            onClick={() => this.toggleMenu()}
            className="float-right mt-1 align-middle"
            size={100}
            round="50px"
            src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
          />
        </Headroom>
        <div className="table">
          <div className="card w-20 m-4" style={{width:"18rem"}}>
            <div className="card-body">
              <img src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2" class="card-img-top" alt="..." />
              <h5 className="card-title mt-2">Telmo lizancos - NIÑOOS</h5>
              <p className="card-text">
                Hola, soy un puto pederasta y me gusta violar
              </p>
              <a href="#" className="mr-0 w-100 btn btn-success">
               
                Contactar 
                <FontAwesomeIcon className="ml-2" icon={faPhone}/>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
