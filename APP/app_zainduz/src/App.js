import React from "react";
import MenuPerfil from "./components/menuPerfil";
import Cabecera from "./components/header";
import SlideTab from "./components/slideTab";
import RegisterFormCuidador from "./components/registerFormCuidador";
import RegisterFormCliente from "./components/registerFormCliente";
import PerfilCuidador from "./components/perfilCuidador";
import PerfilCliente from "./components/perfilCliente";
import ModalRegistrarse from "./components/modalRegistrarse";
import { connect } from "react-redux";
import AcuerdosForm from "./components/acuerdosForm";
import NotificacionesForm from "./components/notificacionesForm";
import CalendarioForm from "./components/calendarioForm";
import FormAnuncio from "./components/formAnuncio";
import Ajustes from "./components/ajustesForm";
import SocketContext from "./socketio/socket-context";
import * as io from "socket.io-client";
import ipMaquina from './util/ipMaquinaAPI';

const mapStateToProps = state => {
  return { formContent: state.app.formContent };
};

const socket = io(`http://${ipMaquina}:3002`);


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenMenuPerfil: false,
      formContent: "tabla",
      cabeceraHeight: 0
    };
  }

  componentDidMount() {
    const altura = document.getElementById("headRoom").clientHeight;
    console.log(altura);
    this.setState({
      cabeceraHeight: altura
    });
  }

  //Abre o cierra el menu segun el estado actual
  getContent() {
    switch (this.props.formContent) {
      case "tabla":
        return <SlideTab />;
      case "registrarCuidador":
        return <RegisterFormCuidador />;
      case "registrarCliente":
        return <RegisterFormCliente />;
      case "perfilCuidador":
        return <PerfilCuidador />;
      case "perfilCliente":
        return <PerfilCliente />;
      case "acuerdos":
        return <AcuerdosForm />;
      case "notificaciones":
        return <NotificacionesForm />;
      case "calendario":
        return <CalendarioForm />;
      case "formAnuncio":
        return <FormAnuncio />;
      case "ajustes":
        return <Ajustes />;
      default:
        return <h5>Bad gateway</h5>
    }
  }

  render() {
    const AppContent = this.getContent.bind(this);
    const { cabeceraHeight } = this.state;
    return (
      <SocketContext.Provider value={socket}>
        <div>
          <MenuPerfil />
          <div id="outer-container" className="w-100">
            <Cabecera />
            <div style={{
              height: cabeceraHeight
            }} />
            <AppContent />
            <ModalRegistrarse />
          </div>
        </div>
      </SocketContext.Provider>
    );
  }
}

export default connect(mapStateToProps)(App);
