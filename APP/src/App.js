import React from "react";
import MenuPerfil from "./components/menuPerfil";
import Cabecera from "./components/header";
import SlideTab from "./components/slideTab";
import RegisterFormCuidador from "./screens/RegisterCuidadorScreen/registerFormCuidador";
import RegisterFormCliente from "./screens/RegisterClienteScreen/registerFormCliente";
import PerfilCuidador from "./screens/PerfilCuidadorScreen/perfilCuidador";
import PerfilCliente from "./screens/PerfilClienteScreen/perfilCliente";
import ModalRegistrarse from "./components/modalRegistrarse";
import { connect } from "react-redux";
import AcuerdosForm from "./screens/AcuerdosScreen/acuerdosForm";
import NotificacionesForm from "./screens/NotificacionesScreen/notificacionesForm";
import CalendarioForm from "./screens/CalendarioScreen/calendarioForm";
import FormAnuncio from "./screens/AnunciosScreen/formAnuncio";
import Ajustes from "./screens/AjustesScreen/ajustesForm";
import MisAnuncios from "./screens/MisAnunciosScreen/misAnunciosForm";
import CuidadorStatsForm from "./screens/CuidadorStatsScreen/cuidadorStatsForm";
import SocketContext from "./socketio/socket-context";
import * as io from "socket.io-client";
import ipMaquina from './util/ipMaquinaAPI';
import { SetCoords } from './redux/actions/coords';

const socket = io(`http://${ipMaquina}:3002`);


class App extends React.Component {

  componentDidMount() {
    const { setCoords } = this.props;
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("Actualizando coordenadas", position);
      console.log(setCoords);
      setCoords({
        latitud: position.coords.latitude,
        longitud: position.coords.longitude
      });
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
      case "misanuncios":
        return <MisAnuncios />;
      case "stats":
        return <CuidadorStatsForm />;
      default:
        return <h5>Bad gateway</h5>
    }
  }

  render() {
    const AppContent = this.getContent.bind(this);
    return (
      <SocketContext.Provider value={socket}>
        <div>
          <MenuPerfil />
          <div id="outer-container" className="w-100">
            <Cabecera />
            <div style={{
              height: 80
            }} />
            <AppContent />
            <ModalRegistrarse />
          </div>
        </div>
      </SocketContext.Provider>
    );
  }
}

const mapStateToProps = state => {
  return { formContent: state.app.formContent };
};

const mapDispatchToProps = dispatch => ({
  setCoords: payload => dispatch(SetCoords(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);