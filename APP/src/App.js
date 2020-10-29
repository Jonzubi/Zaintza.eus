import React from "react";
import cogoToast from 'cogo-toast';
import MenuPerfil from "./components/menuPerfil";
import Cabecera from "./components/header";
import SlideTab from "./components/slideTab";
import { isMobile, osName } from 'react-device-detect';
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
import PrivacidadScreen from './screens/PrivacidadScreen/privacidadScreen';
import MisAnuncios from "./screens/MisAnunciosScreen/misAnunciosForm";
import CuidadorStatsForm from "./screens/CuidadorStatsScreen/cuidadorStatsForm";
import SocketContext from "./socketio/socket-context";
import * as io from "socket.io-client";
import ipMaquina from './util/ipMaquinaAPI';
import { toogleMenuPerfil } from "./redux/actions/menuPerfil";
import { initializeUserSession } from "./redux/actions/user";
import { changeFormContent } from "./redux/actions/app";
import { ResetMaxDistance } from './redux/actions/coords';
import { SetCoords } from './redux/actions/coords';
import i18next from 'i18next';
import CookieConsent from './components/CookieConsent';
import AvisoLegal from './screens/AvisoLegalScreen/avisoLegal';
import Footer from './components/footer';
import protocol from "./util/protocol";
import axios from "./util/axiosInstance";
import moment from 'moment';
import { trans } from './util/funciones';
import { saveUserSession } from "./redux/actions/user";
import { changeLang } from "./redux/actions/app";
import { SetMaxDistance } from "./redux/actions/coords";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.socket = io(`${protocol}://${ipMaquina}:3002`, {
      query: `deviceData=${JSON.stringify({
        isMobile,
        osName
      })}`
    });

    this.socket.on('banned', (dias) => {
      const { idUsuario, resetMaxDistance, initializeUserSession, changeFormContent } = this.props;
    
      initializeUserSession();
      resetMaxDistance();
      changeFormContent("tabla");
      toogleMenuPerfil(false);
      this.socket.emit("logout", {
        idUsuario: idUsuario,
      });
      cogoToast.warn(<h5>{i18next.t('ban.banned', { dias })}</h5>)
    });
  }

  componentDidMount() {
    const { setCoords } = this.props;
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords({
        latitud: position.coords.latitude,
        longitud: position.coords.longitude
      });
    }, null, {
      enableHighAccuracy: true
    });
    
    const mantenerSesionData = window.localStorage.getItem("mantenerSesion")
    if (mantenerSesionData !== null) {
      this.mantenerSesionLogin(JSON.parse(mantenerSesionData));
    }
  }

  mantenerSesionLogin = async (loginData) => {
    const { lastLogin } = loginData;

    // Si el ultimo login fue hace mas de una semana tiene que volver a iniciar sesion
    if (moment().isAfter(moment(lastLogin).add(7, 'days'))) {
      return;
    }

    const { saveUserSession, changeLang, setMaxDistance } = this.props;
    const login = await axios.get(`${protocol}://${ipMaquina}:3001/api/procedures/getUsuarioConPerfil`, { params: loginData })
      .catch((err) => {
        if (err.response.status === 401) {
          const { bannedUntilDate } = err.response.data;
          cogoToast.error(
            <h5>{i18next.t('notificaciones.baneado', {
              fecha: moment(bannedUntilDate).format('YYYY-MM-DD')
            })}</h5>
          );
          return;
        }
        cogoToast.error(<h5>{trans("notificaciones.errorConexion")}</h5>);
        return;
      });
    const usuario = login.data.idUsuario || login.data;
    const idPerfil = usuario.idPerfil._id;
    const idUsuario = usuario._id;

    saveUserSession(
      Object.assign({}, usuario.idPerfil, {
        _id: idPerfil,
        _idUsuario: idUsuario,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        contrasena: usuario.contrasena,
        idLangPred: login.data.idLangPred || "",
      })
    );

    if (login.data.idLangPred !== undefined) {
      i18next.changeLanguage(login.data.idLangPred);
      changeLang(login.data.idLangPred);
    }

    if (login.data.maxDistance !== undefined) {
      setMaxDistance(login.data.maxDistance);
    }

    this.socket.emit("login", {
      idUsuario: idUsuario,
    });

    cogoToast.success(
      <h5>{trans("notificaciones.sesionIniciada")}</h5>
    );

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
      case "avisoLegal":
        return <AvisoLegal />;
      case "privacidad":
        return <PrivacidadScreen />;
      default:
        return <h5>Bad gateway</h5>
    }
  }

  render() {
    const AppContent = this.getContent.bind(this);
    return (
      <SocketContext.Provider value={this.socket}>
        <div className="h-100">
          <CookieConsent />
          <MenuPerfil />
          <div id="outer-container" className="h-100 w-100">
            <Cabecera />
            <div style={{
              height: 80
            }} />
            <div
              style={{
                minHeight: 'calc(100vh - 104px)'
              }}
            >
              <AppContent />
            </div>            
            <ModalRegistrarse />
            <Footer />
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
  setCoords: payload => dispatch(SetCoords(payload)),
  toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload)),
  initializeUserSession: () => dispatch(initializeUserSession()),
  changeFormContent: (form) => dispatch(changeFormContent(form)),
  resetMaxDistance: () => dispatch(ResetMaxDistance()),
  saveUserSession: (user) => dispatch(saveUserSession(user)),
  changeLang: (payload) => dispatch(changeLang(payload)),
  setMaxDistance: (payload) => dispatch(SetMaxDistance(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
