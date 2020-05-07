import React from "react";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { connect } from "react-redux";
import { trans, arrayOfFalses, getTodayDate } from "../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrashAlt,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { Collapse } from "react-collapse";
import Avatar from "react-avatar";
import cogoToast from "cogo-toast";
import { setCountNotify } from "../redux/actions/notifications";
import SocketContext from "../socketio/socket-context";
import ClipLoader from "react-spinners/ClipLoader";
import "./styles/notificacionesForm.css";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";

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
          contrasena,
        }
      )
      .then((notificaciones) => {
        this.setState({
          jsonNotificaciones: notificaciones.data,
          notificacionesCollapseState: arrayOfFalses(
            notificaciones.data.length
          ),
          isLoading: false,
        });
      })
      .catch((err) => {
        //TODO gestionar error
      });
  }
  constructor(props) {
    super(props);

    this.state = {
      jsonNotificaciones: [],
      notificacionesCollapseState: [],
      isLoading: true,
      isOpenThreeDotLayer: [],
      showModalNotificacion: false,
      selectedNotificacion: null,
    };

    this.handleToogleCollapseNotificacion = this.handleToogleCollapseNotificacion.bind(
      this
    );
  }

  async handleToogleCollapseNotificacion(index, notificacion) {
    const { setCountNotify, countNotifies, email, contrasena } = this.props;
    let aux = this.state.notificacionesCollapseState;
    // Esta condicion es para que no se abra un collapse vacio en caso de ser una gestion de acuerdo
    if (notificacion.tipoNotificacion !== "AcuerdoGestionado") {
      aux[index] = !aux[index];
    }

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
          contrasena,
        }
      );
      auxJsonNotif[index].visto = true;
      setCountNotify(countNotifies - 1);
    }

    this.setState({
      notificacionesCollapseState: aux,
      jsonNotificaciones: auxJsonNotif,
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
      "http://" +
        ipMaquina +
        ":3001/api/procedures/getAcuerdoStatus/" +
        notificacion.acuerdo._id,
      {
        whoAmI: tipoUsuario,
        email,
        contrasena,
      }
    );
    estadoAcuerdo = estadoAcuerdo.data;
    if (estadoAcuerdo == 2) {
      cogoToast.error(
        <h5>{trans("notificacionesForm.acuerdoYaRechazado")}</h5>
      );
      await axios.patch(
        "http://" + ipMaquina + ":3001/api/notificacion/" + notificacion._id,
        {
          show: false,
          email,
          contrasena,
        }
      );
      delete auxJsonNotif[indice];
      this.setState({
        jsonNotificaciones: auxJsonNotif,
      });
      return;
    }

    await axios.patch(
      "http://" +
        ipMaquina +
        ":3001/api/procedures/gestionarAcuerdo/" +
        acuerdo._id,
      {
        estadoAcuerdo: ifAccept ? 1 : 2, //Si Accept es true acepta el acuerdo mandando un 1 a la BD, si no un 2
        email,
        contrasena,
        whoAmI: tipoUsuario,
      }
    );
    //Aqui se manda la notificacion con el usuario recogido anteriormente,
    //el acuerdo ha sido gestionado con un valor de aceptado o rechazado en el valorGestion
    await axios.post(
      "http://" + ipMaquina + ":3001/api/procedures/newNotification",
      {
        idUsuario: notificacion.idRemitente._id,
        idRemitente: notificacion.idUsuario,
        tipoNotificacion: "AcuerdoGestionado",
        valorGestion: ifAccept,
        visto: false,
        show: true,
        dateEnvioNotificacion:
          today + " " + objToday.getHours() + ":" + objToday.getMinutes(),
        email,
        contrasena,
      }
    );

    socket.emit("notify", {
      idUsuario: notificacion.idRemitente._id,
    });
    await axios.patch(
      "http://" + ipMaquina + ":3001/api/notificacion/" + notificacion._id,
      {
        show: false,
        email,
        contrasena,
      }
    );
    delete auxJsonNotif[indice];
    this.setState(
      {
        jsonNotificaciones: auxJsonNotif,
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
      "http://" + ipMaquina + ":3001/api/notificacion/" + notificacion._id,
      {
        show: false,
        email,
        contrasena,
      }
    );
    delete auxJsonNotif[indice];

    if (!notificacion.visto) {
      setCountNotify(countNotifies - 1);
    }

    this.setState({
      jsonNotificaciones: auxJsonNotif,
    });
  }

  handleClickOptions = (index) => {
    const { isOpenThreeDotLayer } = this.state;
    let auxIsOpen = isOpenThreeDotLayer.slice();
    if (!index) {
      this.setState({
        isOpenThreeDotLayer: arrayOfFalses(isOpenThreeDotLayer.length),
      });
    }
    if (auxIsOpen[index]) {
      auxIsOpen[index] = false;
    } else {
      auxIsOpen = arrayOfFalses(isOpenThreeDotLayer.length);
      auxIsOpen[index] = true;
    }
    this.setState({
      isOpenThreeDotLayer: auxIsOpen,
    });
  };

  closeOpenedOptionsDiv = () => {
    const { isOpenThreeDotLayer } = this.state;

    if (isOpenThreeDotLayer.includes(true)) {
      this.setState({
        isOpenThreeDotLayer: arrayOfFalses(isOpenThreeDotLayer.length),
      });
    }
  };

  render() {
    const {
      isLoading,
      isOpenThreeDotLayer,
      showModalNotificacion,
      selectedNotificacion,
    } = this.state;
    console.log(selectedNotificacion);
    const laOtraPersona =
      this.props.tipoUsuario != "Cuidador" ? "idCuidador" : "idCliente";
    return (
      <SocketContext.Consumer>
        {(socket) => (
          <div
            className={
              this.state.jsonNotificaciones.length !== 0 ? "p-lg-5 p-2" : "p-0"
            }
            onClick={() => this.closeOpenedOptionsDiv()}
            style={{
              height: "calc(100vh - 80px)",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  height: "calc(100vh - 80px)",
                }}
                className="d-flex align-items-center justify-content-center"
              >
                <ClipLoader color="#28a745" />
              </div>
            ) : this.state.jsonNotificaciones.length !== 0 ? (
              this.state.jsonNotificaciones.map((notificacion, indice) => {
                return (
                  <div className="w-100 card mt-2 mb-2">
                    <div className="card-header">
                      <div className="d-flex flex-row align-items-center justify-content-between">
                        <div className="">
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
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="">
                          {new Date(
                            notificacion.dateEnvioNotificacion
                          ).getHours() +
                            ":" +
                            new Date(
                              notificacion.dateEnvioNotificacion
                            ).getMinutes()}
                        </div>
                        <div>
                          <FontAwesomeIcon
                            style={{
                              cursor: "pointer",
                            }}
                            icon={faEllipsisV}
                            onClick={() => this.handleClickOptions(indice)}
                          />
                          <div
                            style={{
                              position: "absolute",
                              width: 200,
                              right: 10,
                              backgroundColor: "white",
                              boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                              zIndex: 2,
                            }}
                            className={
                              isOpenThreeDotLayer[indice]
                                ? "d-flex flex-column rounded border"
                                : "d-none"
                            }
                          >
                            <div
                              style={{
                                cursor: "pointer",
                              }}
                              className="threeDotsMenu p-1 d-flex flex-row align-items-center justify-content-between"
                              onClick={() => {
                                this.setState({
                                  selectedNotificacion: notificacion,
                                  showModalNotificacion: true,
                                });
                                this.handleClickOptions(indice);
                              }}
                            >
                              <span className="mr-5">
                                {trans("notificacionesForm.verNotificacion")}
                              </span>
                              <FontAwesomeIcon
                                className="text-success"
                                icon={faEye}
                              />
                            </div>
                            <div
                              className="threeDotsMenu p-1 d-flex flex-row align-items-center justify-content-between"
                              onClick={() => {
                                this.setState({});
                                this.handleClickOptions(indice);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <span className="">
                                {trans(
                                  "notificacionesForm.eliminarNotificacion"
                                )}
                              </span>
                              <FontAwesomeIcon
                                className="text-danger"
                                icon={faTrashAlt}
                              />
                            </div>
                          </div>
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
                                        (pueblo) => {
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
                                        (dia) => {
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
              <div
                style={{
                  height: "calc(100vh - 80px)",
                }}
                className="d-flex align-items-center justify-content-center"
              >
                <small className="text-danger">
                  {trans("notificacionesForm.noData")}
                </small>
              </div>
            )}
            {selectedNotificacion ? (
              <Modal
                style={{
                  maxWidth: 500,
                }}
                show={showModalNotificacion}
                onHide={() => this.setState({ showModalNotificacion: false })}
              >
                <ModalHeader closeButton>
                  {<h5>{trans("notificacionesForm.notificacion")}</h5>}
                </ModalHeader>
                <ModalBody className="d-flex flex-column align-items-center justify-content-between">
                  <div
                    style={{
                      width: "calc(100% - 20px)",
                      backgroundSize: "cover",
                      backgroundPosition: "top",
                      backgroundRepeat: "no-repeat",
                      margin: "10px",
                      display: "flex",
                      overflow: "hidden",
                    }}
                    className="flex-column align-items-center justify-content-center"
                    alt="Imagen no disponible"
                  >
                    <img
                      style={{
                        minHeight: "150px",
                        maxHeight: "150px",
                        height: "auto",
                      }}
                      src={
                        "http://" +
                        ipMaquina +
                        ":3001/api/image/" +
                        selectedNotificacion.idRemitente.idPerfil.direcFoto
                      }
                    />
                  </div>
                </ModalBody>
                <ModalFooter></ModalFooter>
              </Modal>
            ) : null}
          </div>
        )}
      </SocketContext.Consumer>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario,
    countNotifies: state.notification.countNotifies,
    email: state.user.email,
    contrasena: state.user.contrasena,
  };
};

const mapDispatchToPros = (dispatch) => ({
  setCountNotify: (payload) => dispatch(setCountNotify(payload)),
});

export default connect(mapStateToProps, mapDispatchToPros)(NotificacionesForm);
