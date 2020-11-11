import React from "react";
import axios from "../../util/axiosInstance";
import ipMaquina from "../../util/ipMaquinaAPI";
import { connect } from "react-redux";
import { trans, arrayOfFalses, getTodayDate } from "../../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faFileSignature,
  faHome,
  faClock,
  faCheck,
  faTimes,
  faAward,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import cogoToast from "cogo-toast";
import { setCountNotify } from "../../redux/actions/notifications";
import SocketContext from "../../socketio/socket-context";
import ClipLoader from "react-spinners/ClipLoader";
import "./notificacionesForm.css";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import moment from "moment";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
  Badge,
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import { colors } from "../../util/colors";
import i18next from 'i18next';
import protocol from '../../util/protocol';
import NoNotification from '../../util/images/noNotifications.svg'

class NotificacionesForm extends React.Component {
  componentDidMount() {
    this.refrescarDatos();
  }
  constructor(props) {
    super(props);

    this.state = {
      jsonNotificaciones: [],
      notificacionesCollapseState: [],
      isLoading: true,
      showModalNotificacion: false,
      showModalDecision: false,
      showModalDeleteNotificacion: false,
      selectedNotificacion: null,
    };
  }

  refrescarDatos = () => {
    const { idUsuario, email, contrasena } = this.props;

    axios
      .post(
        `${protocol}://${ipMaquina}:3001/api/procedures/getNotificacionesConUsuarios`,
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
  };

  handleMarcarComoVisto = async (notificacion) => {
    const { setCountNotify, countNotifies, email, contrasena } = this.props;

    if (!notificacion.visto) {
      await axios.patch(
        `${protocol}://${ipMaquina}:3001/api/notificacion/${notificacion._id}`,
        {
          visto: true,
          email,
          contrasena,
        }
      );
      setCountNotify(countNotifies - 1);
      this.setState(
        {
          isLoading: true,
        },
        () => this.refrescarDatos()
      );
    }
  };

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

  async handleGestionarPropuesta(notificacion, ifAccept, socket) {
    const { email, contrasena, tipoUsuario } = this.props;
    let today = getTodayDate();
    const objToday = new Date();
    const acuerdo = notificacion.acuerdo;
    //Squi estoy pillando el estado actual del acuerdo para comprobar que el acuerdo no se ha cancelado ya por el usuario.
    //Por ejemplo sui ha hecho una propuesta erronea
    let estadoAcuerdo = await axios.post(
      `${protocol}://${ipMaquina}:3001/api/procedures/getAcuerdoStatus/${notificacion.acuerdo._id}`,
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
        `${protocol}://${ipMaquina}:3001/api/notificacion/${notificacion._id}`,
        {
          show: false,
          email,
          contrasena,
        }
      );
      this.setState(
        {
          isLoading: true,
        },
        () => this.refrescarDatos()
      );

      return;
    }

    await axios.patch(
      `${protocol}://${ipMaquina}:3001/api/procedures/gestionarAcuerdo/${acuerdo._id}`,
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
      `${protocol}://${ipMaquina}:3001/api/procedures/newNotification`,
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
      `${protocol}://${ipMaquina}:3001/api/notificacion/${notificacion._id}`,
      {
        show: false,
        email,
        contrasena,
      }
    );
    this.setState(
      {
        isLoading: true,
      },
      () => {
        this.refrescarDatos();
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

  handleDeleteNotificacionAfterDecision = async (notificacion) => {
    const {
      email,
      contrasena,
    } = this.props;

    await axios.patch(
      `${protocol}://${ipMaquina}:3001/api/notificacion/${notificacion._id}`,
      {
        show: false,
        email,
        contrasena,
      }
    );

    this.setState(
      {
        isLoading: true,
      },
      () => this.refrescarDatos()
    );
  };

  async handleDeleteNotificacion(notificacion, socket) {
    const {
      countNotifies,
      setCountNotify,
      email,
      contrasena,
      tipoUsuario,
    } = this.props;

    await axios.patch(
      `${protocol}://${ipMaquina}:3001/api/notificacion/${notificacion._id}`,
      {
        show: false,
        email,
        contrasena,
      }
    );

    let estadoAcuerdo;
    if (notificacion.tipoNotificacion === "Acuerdo") {
      estadoAcuerdo = await axios.post(
        `${protocol}://${ipMaquina}:3001/api/procedures/getAcuerdoStatus/${notificacion.acuerdo._id}`,
        {
          whoAmI: tipoUsuario,
          email,
          contrasena,
        }
      );
    }

    if (
      notificacion.tipoNotificacion === "Acuerdo" &&
      estadoAcuerdo.data === 0
    ) {
      this.handleGestionarPropuesta(notificacion, false, socket);
    }
    if (!notificacion.visto) {
      setCountNotify(countNotifies - 1);
    }
    this.setState(
      {
        isLoading: true,
      },
      () => this.refrescarDatos()
    );
  }

  getDetalleNotificacion = (notificacion) => {
    switch (notificacion.tipoNotificacion) {
      case "Acuerdo":
        return <span>{trans("notificacionesForm.detalleAcuerdo")}</span>;
      case "AcuerdoGestionado":
        return notificacion.valorGestion ? (
          <span className="text-success">
            {trans("notificacionesForm.otraPersonaAcuerdoAceptado")}
          </span>
        ) : (
          <span className="text-danger">
            {trans("notificacionesForm.otraPersonaAcuerdoRechazado")}
          </span>
        );
      case "Valoracion":
        return <span>{trans("notificacionesForm.valoracionRecibido")}</span>;

      default:
        return <span>ERROR</span>;
    }
  };

  renderNotificaciones = (jsonNotificaciones) => {
    return jsonNotificaciones.map((notificacion, indice) => {
      return (
        <>
          <ListItem button onClick={() => {
            this.setState({
              selectedNotificacion: notificacion,
              showModalNotificacion: true,
            });
            this.handleMarcarComoVisto(jsonNotificaciones[indice]);
          }}>
            <ListItemAvatar>
              <Badge color="primary" badgeContent={!notificacion.visto ? i18next.t('notificacionesForm.nuevo') : 0}>
                <Avatar
                  alt="avatar"
                  src={`${protocol}://${ipMaquina}:3001/api/image/${notificacion.idRemitente.idPerfil.direcFoto}`}
                />
              </Badge>
              
            </ListItemAvatar>
            <ListItemText
              primary={`${notificacion.idRemitente.idPerfil.nombre} ${notificacion.idRemitente.idPerfil.apellido1}`}
              secondary={`${moment(notificacion.dateEnvioNotificacion).format(
                "YYYY/MM/DD HH:mm"
              )}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                onClick={() => {
                  this.setState({
                    showModalDeleteNotificacion: true,
                    selectedNotificacion: notificacion,
                  });
                }}
              >
                <Delete style={{ color: colors.red }} />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
        </>
      );
    });
  };

  render() {
    const {
      isLoading,
      showModalNotificacion,
      selectedNotificacion,
      showModalDecision,
      jsonNotificaciones,
      showModalDeleteNotificacion,
    } = this.state;
    return (
      <SocketContext.Consumer>
        {(socket) => (
          <div
            style={{
              minminHeight: "calc(100vh - 80px)",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  minminHeight: "calc(100vh - 80px)",
                }}
                className="d-flex align-items-center justify-content-center"
              >
                <ClipLoader color="#28a745" />
              </div>
            ) : jsonNotificaciones.length !== 0 ? (
              <List>{this.renderNotificaciones(jsonNotificaciones)}</List>
            ) : (
              <div
                style={{
                  minHeight: "calc(100vh - 80px)",
                }}
                className="d-flex align-items-center justify-content-center"
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <img src={NoNotification} height={150} />
                  <h3 className="mt-5 text-center">{trans("notificacionesForm.noData")}</h3>
                </div>                
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
                <ModalBody className="d-flex flex-column align-items-center">
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
                      alt="Avatar del contacto"
                      style={{
                        minHeight: "150px",
                        maxHeight: "150px",
                        height: "auto",
                      }}
                      src={`${protocol}://${ipMaquina}:3001/api/image/${selectedNotificacion.idRemitente.idPerfil.direcFoto}`}
                    />
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="mt-3 d-flex flex-row align-items-center justify-content-between"
                  >
                    <span className="font-weight-bold">
                      {trans("notificacionesForm.tipoNotificacion")}:
                    </span>
                    <span>
                      {trans(
                        `notificacionesForm.tipo${selectedNotificacion.tipoNotificacion}`
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="mt-3 d-flex flex-row align-items-center justify-content-between"
                  >
                    <span className="font-weight-bold">
                      {trans("notificacionesForm.detalle")}:
                    </span>
                    {this.getDetalleNotificacion(selectedNotificacion)}
                  </div>
                  {selectedNotificacion.tipoNotificacion === "Acuerdo" ? (
                    <div
                      className="mt-5"
                      style={{
                        width: 300,
                      }}
                    >
                      <div className="d-flex flex-row align-items-center justify-content-center">
                        <FontAwesomeIcon
                          size={"2x"}
                          icon={faComments}
                          className="mr-2"
                        />
                        <span
                          style={{
                            fontSize: 20,
                          }}
                          className="font-weight-bold"
                        >
                          {trans("notificacionesForm.acuerdoInfo")}
                        </span>
                      </div>
                      <div
                        style={{
                          width: 300,
                        }}
                        className="mt-3 d-flex flex-column"
                      >
                        <div className="d-flex flex-row align-items-center justify-content-center">
                          <FontAwesomeIcon
                            icon={faFileSignature}
                            className="mr-2"
                          />
                          <span className="font-weight-bold">
                            {trans("notificacionesForm.acuerdoTitulo")}
                          </span>
                        </div>
                        <span className="">
                          {selectedNotificacion.acuerdo.tituloAcuerdo}
                        </span>
                      </div>
                      <div
                        style={{
                          width: 300,
                        }}
                        className="mt-3 d-flex flex-column"
                      >
                        <div className="d-flex flex-row align-items-center justify-content-center">
                          <FontAwesomeIcon
                            icon={faFileSignature}
                            className="mr-2"
                          />
                          <span className="font-weight-bold">
                            {trans("notificacionesForm.acuerdoDescripcion")}
                          </span>
                        </div>
                        <span className="">
                          {selectedNotificacion.acuerdo.descripcionAcuerdo}
                        </span>
                      </div>
                      <div
                        style={{
                          width: 300,
                        }}
                        className="mt-3 d-flex flex-column"
                      >
                        <div className="d-flex flex-row align-items-center justify-content-center">
                          <FontAwesomeIcon icon={faHome} className="mr-2" />
                          <span className="font-weight-bold">
                            {trans("notificacionesForm.acuerdoPueblos")}
                          </span>
                        </div>
                        <div className="">
                          {selectedNotificacion.acuerdo.pueblo.map((pueblo) => (
                            <span>
                              {pueblo}
                              <br />
                            </span>
                          ))}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 300,
                        }}
                        className="mt-3 d-flex flex-column"
                      >
                        <div className="d-flex flex-row align-items-center justify-content-center">
                          <FontAwesomeIcon icon={faClock} className="mr-2" />
                          <span className="font-weight-bold">
                            {trans("notificacionesForm.acuerdoHorario")}
                          </span>
                        </div>
                        {selectedNotificacion.acuerdo.diasAcordados.map(
                          (dia) => (
                            <div className="d-flex flex-row align-items-center justify-content-between">
                              <span>{trans(`dias.dia_${dia.dia}`)}</span>
                              <div>
                                <span>{dia.horaInicio}</span>
                                {" - "}
                                <span>{dia.horaFin}</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : selectedNotificacion.tipoNotificacion === "Valoracion" ? (
                    <div
                      className="mt-5 d-flex flex-column"
                      style={{
                        width: 300,
                      }}
                    >
                      <div className="d-flex flex-row align-items-center justify-content-center">
                        <FontAwesomeIcon
                          size={"2x"}
                          icon={faAward}
                          className="mr-2"
                        />
                        <span
                          style={{
                            fontSize: 20,
                          }}
                          className="font-weight-bold"
                        >
                          {trans("notificacionesForm.tipoValoracion")}:
                        </span>
                      </div>
                      <div className="mt-3 d-flex flex-row align-items-center justify-content-center">
                        <span
                          style={{
                            fontSize: 15,
                            marginRight: 5,
                          }}
                        >
                          {selectedNotificacion.valoracion}
                        </span>
                        <FontAwesomeIcon
                          icon={faStar}
                          style={{
                            color: "yellow",
                          }}
                        />
                      </div>

                      <div className="mt-3 d-flex flex-row align-items-center justify-content-center">
                        <FontAwesomeIcon
                          size={"2x"}
                          icon={faFileSignature}
                          className="mr-2"
                        />
                        <span
                          style={{
                            fontSize: 20,
                          }}
                          className="font-weight-bold"
                        >
                          {trans("notificacionesForm.comentario")}:
                        </span>
                      </div>
                      <div
                        className="mt-3"
                        style={{
                          maxWidth: 300,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {selectedNotificacion.valoracionDetalle}
                      </div>
                    </div>
                  ) : null}
                </ModalBody>
                {selectedNotificacion.tipoNotificacion === "Acuerdo" ? (
                  <ModalFooter className="d-flex flex-row align-items-center justify-content-between">
                    <button
                      onClick={() => {
                        this.decisionAcuerdo = "Aceptar";
                        this.setState({
                          showModalDecision: true,
                        });
                      }}
                      className="btn btn-success"
                    >
                      {trans("notificacionesForm.aceptarAcuerdo")}
                      <FontAwesomeIcon icon={faCheck} className="ml-2" />
                    </button>
                    <button
                      onClick={() => {
                        this.decisionAcuerdo = "Rechazar";
                        this.setState({
                          showModalDecision: true,
                        });
                      }}
                      className="btn btn-danger"
                    >
                      {trans("notificacionesForm.rechazarAcuerdo")}
                      <FontAwesomeIcon icon={faTimes} className="ml-2" />
                    </button>
                  </ModalFooter>
                ) : null}
              </Modal>
            ) : null}
            <Modal
              onHide={() => this.setState({ showModalDecision: false })}
              show={showModalDecision}
              className="modalRegistrarse"
            >
              <ModalBody className="d-flex flex-row align-items-center justify-content-center">
                {trans(
                  `notificacionesForm.decisionAcuerdo${this.decisionAcuerdo}`
                )}
              </ModalBody>
              <ModalFooter className="d-flex flex-row align-items-center justify-content-between">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    this.handleGestionarPropuesta(
                      selectedNotificacion,
                      this.decisionAcuerdo === "Aceptar",
                      socket
                    );
                    this.handleDeleteNotificacionAfterDecision(
                      selectedNotificacion
                    );
                    this.setState({
                      showModalNotificacion: false,
                      showModalDecision: false,
                    });
                  }}
                >
                  {trans("misAnunciosForm.si")}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    this.handleGestionarPropuesta(
                      selectedNotificacion,
                      false,
                      socket
                    );
                    this.handleDeleteNotificacionAfterDecision(
                      selectedNotificacion
                    );
                    this.setState({
                      showModalNotificacion: false,
                      showModalDecision: false,
                    });
                  }}
                >
                  {trans("misAnunciosForm.no")}
                </button>
              </ModalFooter>
            </Modal>
            <Modal
              onHide={() =>
                this.setState({ showModalDeleteNotificacion: false })
              }
              show={showModalDeleteNotificacion}
              className="modalRegistrarse"
            >
              <ModalBody className="d-flex flex-row align-items-center justify-content-center">
                {trans(`notificacionesForm.askDeleteNotificacion`)}
              </ModalBody>
              <ModalFooter className="d-flex flex-row align-items-center justify-content-between">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    this.handleDeleteNotificacion(selectedNotificacion, socket);
                    this.setState({
                      showModalDeleteNotificacion: false,
                    });
                  }}
                >
                  {trans("misAnunciosForm.si")}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    this.setState({
                      showModalDeleteNotificacion: false,
                    });
                  }}
                >
                  {trans("misAnunciosForm.no")}
                </button>
              </ModalFooter>
            </Modal>
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
    nowLang: state.app.nowLang,
  };
};

const mapDispatchToPros = (dispatch) => ({
  setCountNotify: (payload) => dispatch(setCountNotify(payload)),
});

export default connect(mapStateToProps, mapDispatchToPros)(NotificacionesForm);
