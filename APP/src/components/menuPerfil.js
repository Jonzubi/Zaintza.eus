import React from "react";
import LogInForm from "./logInForm";
import { connect } from "react-redux";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { initializeUserSession } from "../redux/actions/user";
import { changeFormContent } from "../redux/actions/app";
import ipMaquina from "../util/ipMaquinaAPI";
import "./styles/menuPerfil.css";
import cogoToast from "cogo-toast";
import { trans } from "../util/funciones";
import Axios from "../util/axiosInstance";
import ChangeLang from "../components/changeLang";
import SocketContext from "../socketio/socket-context";
import { setCountNotify } from "../redux/actions/notifications";
import { ResetMaxDistance } from "../redux/actions/coords";
import {
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import {
  Person,
  CalendarToday,
  Drafts,
  BarChart,
  Notifications,
  Settings,
  Publish,
  Close,
  ExitToApp,
} from "@material-ui/icons";
import Logo from "../util/images/Logo.png";
import { colors } from "../util/colors";
import protocol from '../util/protocol';

const mapStateToProps = (state) => {
  return {
    isOpened: state.menuPerfil.isOpened,
    direcFoto: state.user.direcFoto,
    tipoUsuario: state.user.tipoUsuario,
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    nombre: state.user.nombre,
    apellido1: state.user.apellido1,
    countNotifies: state.notification.countNotifies,
    email: state.user.email,
    contrasena: state.user.contrasena,
  };
};

let gSocket = null;
let notifyReceiving = false;

const mapDispatchToProps = (dispatch) => {
  return {
    toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload)),
    initializeUserSession: () => dispatch(initializeUserSession()),
    changeFormContent: (form) => dispatch(changeFormContent(form)),
    setCountNotify: (payload) => dispatch(setCountNotify(payload)),
    resetMaxDistance: () => dispatch(ResetMaxDistance()),
  };
};

class MenuPerfil extends React.Component {
  handleNotifyReceived = () => {
    const {
      countNotifies,
      setCountNotify,
      idUsuario,
      email,
      contrasena,
    } = this.props;
    //Si no esta logueado no queremos saber notificaciones;
    if (
      typeof this.props.idUsuario == "undefined" ||
      this.props.idUsuario == ""
    )
      return;

    Axios.post(
      `${protocol}://${ipMaquina}:3001/api/procedures/getNotificationsWithIdUsuario/${idUsuario}`,
      {
        email,
        contrasena,
      }
    ).then((resultado) => {
      if (resultado.data != "Vacio" && countNotifies != resultado.data.length) {
        setCountNotify(resultado.data.length);
        cogoToast.info(<h5>{trans("menuPerfil.notificacionRecibida")}</h5>);
      } else if (resultado.data == "Vacio" && countNotifies != 0) {
        setCountNotify(0);
      }
    });
  };
  constructor(props) {
    super(props);

    this.handleClickPerfil = this.handleClickPerfil.bind(this);
    this.handleClickAcuerdos = this.handleClickAcuerdos.bind(this);
    this.handleClickNotificaciones = this.handleClickNotificaciones.bind(this);
    this.handleClickAjustes = this.handleClickAjustes.bind(this);
  }

  getAvatar = () => {
    return this.props.direcFoto == "" ? (
      <div className="w-100 text-center">
        <img width={256} height={125} src={Logo} alt="logo" />
      </div>
    ) : null;
  };

  handleClickPerfil() {
    const tipoUsuario = this.props.tipoUsuario;

    switch (tipoUsuario) {
      case "Cuidador":
        this.props.changeFormContent("perfilCuidador");
        break;
      case "Cliente":
        this.props.changeFormContent("perfilCliente");
        break;
      default:
        this.props.changeFormContent("tabla");
    }

    this.props.toogleMenuPerfil(false);
  }

  handleClickAcuerdos() {
    this.props.changeFormContent("acuerdos");
    this.props.toogleMenuPerfil(false);
  }

  handleClickNotificaciones() {
    this.props.changeFormContent("notificaciones");
    this.props.toogleMenuPerfil(false);
  }

  handleLogOut() {
    const { idUsuario, resetMaxDistance } = this.props;

    this.props.initializeUserSession();
    resetMaxDistance();
    this.props.changeFormContent("tabla");
    this.props.toogleMenuPerfil(false);
    // Elimina los posibles datos guardados para iniciar sesion automaticamente
    window.localStorage.removeItem("mantenerSesion");
    gSocket.emit("logout", {
      idUsuario: idUsuario,
    });
    cogoToast.success(<h5>{trans("notificaciones.sesionCerrada")}</h5>);
  }

  handleClickCalendario() {
    this.props.changeFormContent("calendario");
    this.props.toogleMenuPerfil(false);
  }

  handleClickAjustes() {
    this.props.changeFormContent("ajustes");
    this.props.toogleMenuPerfil(false);
  }

  handleClickAnuncios = () => {
    const { changeFormContent, toogleMenuPerfil } = this.props;
    changeFormContent("misanuncios");
    toogleMenuPerfil(false);
  };

  handleClickStats = () => {
    const { changeFormContent, toogleMenuPerfil } = this.props;
    changeFormContent("stats");
    toogleMenuPerfil(false);
  };

  getMenuContent = () => {
    if (!this.props.tipoUsuario) {
      return <LogInForm />;
    } else {
      return (
        <SocketContext.Consumer>
          {(socket) => {
            gSocket = socket;
            if (!notifyReceiving) {
              socket.on("notifyReceived", this.handleNotifyReceived);
              notifyReceiving = true;
            }
            const { countNotifies, tipoUsuario } = this.props;

            return (
              <List style={{ width: 250 }}>
                <ListItem button onClick={() => this.handleClickPerfil()}>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary={trans("menuPerfil.perfil")} />
                </ListItem>
                <ListItem button onClick={() => this.handleClickCalendario()}>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText primary={trans("menuPerfil.calendario")} />
                </ListItem>
                <ListItem button onClick={() => this.handleClickAcuerdos()}>
                  <ListItemIcon>
                    <Drafts />
                  </ListItemIcon>
                  <ListItemText primary={trans("menuPerfil.contratos")} />
                </ListItem>
                {tipoUsuario === "Cliente" ? (
                  <ListItem button onClick={() => this.handleClickAnuncios()}>
                    <ListItemIcon>
                      <Publish />
                    </ListItemIcon>
                    <ListItemText primary={trans("menuPerfil.misAnuncios")} />
                  </ListItem>
                ) : (
                  <ListItem button onClick={() => this.handleClickStats()}>
                    <ListItemIcon>
                      <BarChart />
                    </ListItemIcon>
                    <ListItemText primary={trans("menuPerfil.stats")} />
                  </ListItem>
                )}

                <ListItem
                  button
                  onClick={() => this.handleClickNotificaciones()}
                >
                  <ListItemIcon>
                    <Badge color="primary" badgeContent={countNotifies}>
                      <Notifications />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary={trans("menuPerfil.notificaciones")} />
                </ListItem>
                <ListItem button onClick={() => this.handleClickAjustes()}>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText primary={trans("menuPerfil.ajustes")} />
                </ListItem>
                <ListItem button onClick={() => this.handleLogOut()}>
                  <ListItemIcon>
                    <ExitToApp style={{ fill: colors.red }} />
                  </ListItemIcon>
                  <ListItemText primary={trans("menuPerfil.salir")} />
                </ListItem>
              </List>
            );
          }}
        </SocketContext.Consumer>
      );
    }
  };

  render() {
    const { toogleMenuPerfil, isOpened, tipoUsuario } = this.props;
    const IconAvatar = this.getAvatar.bind(this);
    const MenuContent = this.getMenuContent.bind(this);
    return (
      <Drawer
        onClose={() => toogleMenuPerfil(false)}
        open={isOpened}
        anchor={"right"}
      >
        <div
          className="d-flex flex-row justify-content-end p-3"
        >
          <Close style={{ cursor: "pointer" }} onClick={() => toogleMenuPerfil(false)} />
        </div>
        <div
          style={{
            outline: "none",
          }}
          className={
            !tipoUsuario
              ? "d-flex flex-column h-100 p-4 p-sm-5"
              : "d-flex flex-column h-100"
          }
        >
          <IconAvatar />
          <MenuContent />
          <div className="d-flex flex-column h-100 justify-content-end">
            <ChangeLang />
          </div>
        </div>
      </Drawer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuPerfil);
