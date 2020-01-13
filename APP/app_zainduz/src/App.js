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

const mapStateToProps = state => {
  return { formContent: state.app.formContent };
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenMenuPerfil: false,
      formContent: "tabla"
    };
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
      default:
        return <h5>Bad gateway</h5>
    }
  }

  render() {
    const AppContent = this.getContent.bind(this);

    return (
      <div>
        <MenuPerfil />
        <div id="outer-container" className="w-100">
          <Cabecera />
          <AppContent />
          <ModalRegistrarse />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
