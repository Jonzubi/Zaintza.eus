import React from "react";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { connect } from "react-redux";
import { trans, arrayOfFalses, getTodayDate } from "../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faEye,
  faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import { Collapse } from "react-collapse";
import Avatar from "react-avatar";
import cogoToast from "cogo-toast";
import { setCountNotify } from "../redux/actions/notifications";
import SocketContext from "../socketio/socket-context";

class NotificacionesForm extends React.Component {
  componentDidMount() {
    const { idUsuario, email, contrasena } = this.props;

    axios
      .post(
        "http://" +
          ipMaquina +
          ":3001/api/procedures/getNotificacionesConUsuarios",
        {          
          idUsuario: idUsuario,
          email,
          contrasena          
        }
      )
      .then(notificaciones => {
        this.setState({
          jsonNotificaciones: notificaciones.data,
          notificacionesCollapseState: arrayOfFalses(notificaciones.data.length)
        });
      })
      .catch(err => {
        //TODO gestionar error
      });
  }
  constructor(props) {
    super(props);

    this.state = {
      jsonNotificaciones: [],
      notificacionesCollapseState: []
    };

    this.handleToogleCollapseNotificacion = this.handleToogleCollapseNotificacion.bind(
      this
    );
  }

  async handleToogleCollapseNotificacion(index) {
    const { setCountNotify, countNotifies, email, contrasena } = this.props;
    let aux = this.state.notificacionesCollapseState;
    aux[index] = !aux[index];

    let auxJsonNotif = this.state.jsonNotificaciones;
    if (!auxJsonNotif[index].visto) {
      await axios.patch(
        "http://" +
          ipMaquina +
          ":3001/api/notificacion/" +
          auxJsonNotif[index]._id,
        {
          visto: true,
          email,
          contrasena
        }
      );
      auxJsonNotif[index].visto = true;
      setCountNotify(countNotifies - 1);
    }

    this.setState({
      notificacionesCollapseState: aux,
      jsonNotificaciones: auxJsonNotif
    });
  }

  traducirDia(indice) {
    switch (parseInt(indice)) {
      case 1:
        return "Astelehena";
      case 2:
        return "Asteartea";
      case 3:
        return "Asteazkena";
      case 4:
        return "Osteguna";
      case 5:
        return "Ostirala";
      case 6:
        return "Larunbata";
      case 7:
        return "Igandea";
      default:
        return "WTF";
    }
  }

  async handleGestionarPropuesta(notificacion, indice, ifAccept, socket) {
    const { email, contrasena, tipoUsuario } = this.props;
    let today = getTodayDate();
    const objToday = new Date();
    const acuerdo = notificacion.acuerdo;
    let auxJsonNotif = this.state.jsonNotificaciones;
    //Squi estoy pillando el estado actual del acuerdo para comprobar que el acuerdo no se ha cancelado ya por el usuario.
    //Por ejemplo sui ha hecho una propuesta erronea
    let estadoAcuerdo = await axios.post(
      "http://" + ipMaquina + ":3001/api/procedure/getAcuerdoStatus/" + notificacion.acuerdo._id,
      {
        whoAmI: tipoUsuario,
        email,
        contrasena
      }
    );
    estadoAcuerdo = estadoAcuerdo.data;
    if (estadoAcuerdo == 2) {
      cogoToast.error(
        <h5>{trans("notificacionesForm.acuerdoYaRechazado")}</h5>
      );
      await axios.patch(
        "http://" + ipMaquina + ":3001/api/notificacion/" + notificacion._id, {
          show: false,
          email,
          contrasena
        }
      );
      delete auxJsonNotif[indice];
      this.setState({
        jsonNotificaciones: auxJsonNotif
      });
      return;
    }

    await axios.patch(
      "http://" + ipMaquina + ":3001/api/procedures/gestionarAcuerdo/" + acuerdo._id,
      {
        estadoAcuerdo: ifAccept ? 1 : 2, //Si Accept es true acepta el acuerdo mandando un 1 a la BD, si no un 2
        email,
        contrasena,
        whoAmI: tipoUsuario
      }
    );
    //Aqui se manda la notificacion con el usuario recogido anteriormente,
    //el acuerdo ha sido gestionado con un valor de aceptado o rechazado en el valorGestion
    await axios.post("http://" + ipMaquina + ":3001/api/procedures/newNotification", {
      idUsuario: notificacion.idRemitente._id,
      idRemitente: notificacion.idUsuario,
      tipoNotificacion: "AcuerdoGestionado",
      valorGestion: ifAccept,
      visto: false,
      show: true,
      dateEnvioNotificacion:
        today + " " + objToday.getHours() + ":" + objToday.getMinutes(),
      email,
      contrasena
    });

    socket.emit('notify', {
      idUsuario: notificacion.idRemitente._id
    });
    await axios.patch(
      "http://" + ipMaquina + ":3001/api/notificacion/" + notificacion._id, {
        show: false,
        email,
        contrasena
      }
    );
    delete auxJsonNotif[indice];
    this.setState(
      {
        jsonNotificaciones: auxJsonNotif
      },
      () => {
        ifAccept
          ? cogoToast.success(
              <h5>{trans("notificacionesForm.acuerdoAceptado")}</h5>
            )
          : cogoToast.success(
              <h5>{trans("notificacionesForm.acuerdoRechazado")}</h5>
            );
      }
    );
  }

  async handleDeleteNotificacion(notificacion, indice) {
    const { countNotifies, setCountNotify, email, contrasena } = this.props;
    let auxJsonNotif = this.state.jsonNotificaciones;

    await axios.patch(
      "http://" + ipMaquina + ":3001/api/notificacion/" + notificacion._id, {
        show: false,
        email,
        contrasena
      }
    );
    delete auxJsonNotif[indice];
    
    if(!notificacion.visto){
      setCountNotify(countNotifies - 1);
    }
    
    this.setState({
      jsonNotificaciones: auxJsonNotif
    });
  }

  render() {
    return (
      <SocketContext.Consumer>
        {socket => (
          <div className="p-5">
            {this.state.jsonNotificaciones.length != 0 ? (
              this.state.jsonNotificaciones.map((notificacion, indice) => {
                return (
                  <div className="w-100 card mt-2 mb-2">
                    <div className="card-header">
                      <div className="row">
                        <div className="col-10 text-center">
                          {notificacion.tipoNotificacion == "Acuerdo" ? (
                            <div className="d-flex align-items-center">
                              <Avatar
                                size={50}
                                className=""
                                name={notificacion.idRemitente.idPerfil.nombre}
                                src={
                                  "http://" +
                                  ipMaquina +
                                  ":3001/api/image/" +
                                  notificacion.idRemitente.idPerfil.direcFoto
                                }
                              />
                              <div className="ml-3">
                                <span className="font-weight-bold">
                                  {notificacion.idRemitente.idPerfil.nombre +
                                    " " +
                                    notificacion.idRemitente.idPerfil.apellido1}
                                </span>{" "}
                                <span>
                                  {trans("notificacionesForm.propuestaAcuerdo")}
                                </span>
                              </div>
                            </div>
                          ) : notificacion.tipoNotificacion ==
                            "AcuerdoGestionado" ? (
                            <div className="d-flex align-items-center">
                              <Avatar
                                size={50}
                                className=""
                                name={notificacion.idRemitente.idPerfil.nombre}
                                src={
                                  "http://" +
                                  ipMaquina +
                                  ":3001/api/image/" +
                                  notificacion.idRemitente.idPerfil.direcFoto
                                }
                              />
                              <div className="ml-3">
                                <span className="font-weight-bold">
                                  {notificacion.idRemitente.idPerfil.nombre +
                                    " " +
                                    notificacion.idRemitente.idPerfil.apellido1}
                                </span>{" "}
                                <span>
                                  {notificacion.valorGestion
                                    ? trans(
                                        "notificacionesForm.otraPersonaAcuerdoAceptado"
                                      )
                                    : trans(
                                        "notificacionesForm.otraPersonaAcuerdoRechazado"
                                      )}
                                </span>
                              </div>
                              <span className="ml-5">
                                {new Date(
                                  notificacion.dateEnvioNotificacion
                                ).getHours() +
                                  ":" +
                                  new Date(
                                    notificacion.dateEnvioNotificacion
                                  ).getMinutes()}
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <div className="col-1 text-center my-auto">
                          <FontAwesomeIcon
                            style={{ cursor: "pointer" }}
                            color={notificacion.visto ? "#7F8C8D" : "#17202A"}
                            size="2x"
                            icon={faEye}
                            className=""
                            onClick={() =>
                              this.handleToogleCollapseNotificacion(indice)
                            }
                          />
                        </div>
                        <div className="col-1 text-center my-auto">
                          <FontAwesomeIcon
                            style={{ cursor: "pointer" }}
                            size="2x"
                            icon={faTrashAlt}
                            className="text-danger"
                            onClick={() =>
                              this.handleDeleteNotificacion(
                                notificacion,
                                indice
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <Collapse
                      className="card-body"
                      isOpened={this.state.notificacionesCollapseState[indice]}
                    >
                      <div className="p-2">
                        {notificacion.tipoNotificacion == "Acuerdo" ? (
                          <div>
                            <span className="display-4">
                              {notificacion.acuerdo.tituloAcuerdo}
                            </span>
                            <hr />
                            <div className="p-5 font-weight-bold text-center">
                              {notificacion.acuerdo.descripcionAcuerdo}
                            </div>
                            <div className="row">
                              <div className="col-6 text-center">
                                <span>
                                  {trans("notificacionesForm.pueblos")}
                                </span>
                                <hr />
                                <ul className="list-group">
                                  {typeof notificacion.acuerdo.pueblo.map !=
                                  "undefined"
                                    ? notificacion.acuerdo.pueblo.map(
                                        pueblo => {
                                          return (
                                            <li className="list-group-item font-weight-bold">
                                              {pueblo}
                                            </li>
                                          );
                                        }
                                      )
                                    : null}
                                </ul>
                              </div>
                              <div className="col-6 text-center">
                                <span>{trans("notificacionesForm.dias")}</span>
                                <hr />
                                <ul className="list-group">
                                  {typeof notificacion.acuerdo.diasAcordados
                                    .map != "undefined"
                                    ? notificacion.acuerdo.diasAcordados.map(
                                        dia => {
                                          return (
                                            <li className="list-group-item">
                                              <span className="font-weight-bold">
                                                {this.traducirDia(dia.dia) +
                                                  ": "}
                                              </span>
                                              <span>
                                                {dia.horaInicio +
                                                  " - " +
                                                  dia.horaFin}
                                              </span>
                                            </li>
                                          );
                                        }
                                      )
                                    : null}
                                </ul>
                              </div>
                            </div>
                            <div className="row mt-5 ml-0 mr-0">
                              <button
                                onClick={() =>
                                  this.handleGestionarPropuesta(
                                    notificacion,
                                    indice,
                                    true,
                                    socket
                                  )
                                }
                                className="btn btn-success col-6"
                              >
                                {trans("notificacionesForm.aceptarAcuerdo")}
                              </button>
                              <button
                                onClick={() =>
                                  this.handleGestionarPropuesta(
                                    notificacion,
                                    indice,
                                    false,
                                    socket
                                  )
                                }
                                className="btn btn-danger col-6"
                              >
                                {trans("notificacionesForm.rechazarAcuerdo")}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </Collapse>
                  </div>
                );
              })
            ) : (
              <div className="d-flex justify-content-center">
                <small className="text-danger my-auto">
                  {trans("notificacionesForm.noData")}
                </small>
              </div>
            )}
          </div>
        )}
      </SocketContext.Consumer>
    );
  }
}

const mapStateToProps = state => {
  return {
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario,
    countNotifies: state.notification.countNotifies,
    email: state.user.email,
    contrasena: state.user.contrasena
  };
};

const mapDispatchToPros = dispatch => ({
  setCountNotify: payload => dispatch(setCountNotify(payload))
});

export default connect(mapStateToProps, mapDispatchToPros)(NotificacionesForm);
