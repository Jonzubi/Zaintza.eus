import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileSignature,
  faStar,
  faHome,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import axios from "../../util/axiosInstance";
import ipMaquina from "../../util/ipMaquinaAPI";
import { trans, arrayOfFalses, getTodayDate } from "../../util/funciones";
import cogoToast from "cogo-toast";
import SocketContext from "../../socketio/socket-context";
import ClipLoader from "react-spinners/ClipLoader";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import ModalHeader from "react-bootstrap/ModalHeader";
import Rating from "react-rating";
import i18next from "i18next";
import "./acuerdosForm.css";
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
} from "@material-ui/core";
import { Visibility, Delete } from "@material-ui/icons";
import { colors } from "../../util/colors";
import protocol from '../../util/protocol';
import NoAcuerdo from '../../util/images/noAcuerdo.svg';

const mapStateToProps = (state) => {
  return {
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario,
    email: state.user.email,
    contrasena: state.user.contrasena,
    nowLang: state.app.nowLang,
  };
};

class AcuerdosForm extends React.Component {
  componentDidMount() {
    this.refrescarAcuerdoData();
  }

  constructor(props) {
    super(props);

    this.state = {
      jsonAcuerdos: [],
      acuerdosCollapseState: [],
      isLoading: true,
      showAcuerdoModal: false,
      showModalTerminarAcuerdo: false,
      showModalValoracion: false,
      selectedAcuerdo: null,
      isOpenThreeDotLayer: [],
      valoracionValue: 3,
      valoracionDetalle: "",
      valoracionIsUploading: false,
      valoracionEsAnonimo: false,
    };

    this.handleToogleCollapseAcuerdo = this.handleToogleCollapseAcuerdo.bind(
      this
    );
  }

  refrescarAcuerdoData = () => {
    //buscarUsuOrCuid =>> En esta variable guardo si el usuario iniciado es cliente o cuidador para asi si es cuidador
    //buscar cliente en el acuerdo y viceversa, ESTO ME DARA LA INFORMACION DE LA OTRA PARTE DEL ACUERDO
    const { idPerfil, tipoUsuario, email, contrasena } = this.props;

    axios
      .post(
        `${protocol}://${ipMaquina}:3001/api/procedures/getAcuerdosConUsuarios`,
        {
          tipoUsuario: tipoUsuario,
          idPerfil: idPerfil,
          email,
          contrasena,
        }
      )
      .then((resultado) => {
        this.setState({
          jsonAcuerdos: resultado.data,
          isOpenThreeDotLayer: arrayOfFalses(resultado.data.length),
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isLoading: false,
        });
      });
  };

  handleToogleCollapseAcuerdo(index) {
    const { jsonAcuerdos } = this.state;
    let aux = this.state.acuerdosCollapseState;
    aux[index] = !aux[index];

    this.setState({
      acuerdosCollapseState: aux,
      selectedAcuerdo: jsonAcuerdos[index],
      showAcuerdoModal: true,
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

  async handleTerminarAcuerdo(acuerdo, socket) {
    if (acuerdo.estadoAcuerdo == 2) {
      return;
    }
    const { email, contrasena, tipoUsuario } = this.props;
    let today = getTodayDate();
    const objToday = new Date();

    await axios.patch(
      `${protocol}://${ipMaquina}:3001/api/procedures/terminarAcuerdo/${acuerdo._id}`,
      {
        whoAmI: tipoUsuario,
        email,
        contrasena,
      }
    );
    //Ahora se quiere notificar a la otra parte del acuerdo de la finalizacion del acuerdo
    let buscarUsuOrCuid =
      this.props.tipoUsuario == "Cliente" ? "idCuidador" : "idCliente";
    const idElOtro = acuerdo[buscarUsuOrCuid]._id;
    let elOtroUsu = await axios.get(
      `${protocol}://${ipMaquina}:3001/api/procedures/getIdUsuarioConIdPerfil/${idElOtro}`
    );
    const notificacionData = {
      idUsuario: elOtroUsu.data,
      idRemitente: this.props.idUsuario,
      tipoNotificacion: "AcuerdoGestionado",
      valorGestion: false,
      visto: false,
      dateEnvioNotificacion:
        today + " " + objToday.getHours() + ":" + objToday.getMinutes(),
      email,
      contrasena,
    };
    await axios.post(
      `${protocol}://${ipMaquina}:3001/api/procedures/newNotification`,
      notificacionData
    );

    socket.emit("notify", {
      idUsuario: elOtroUsu.data,
    });

    this.setState(
      {
        isLoading: true,
        showModalValoracion: true,
      },
      () => {
        this.refrescarAcuerdoData();
        cogoToast.success(<h5>{trans("acuerdosForm.acuerdoTerminado")}</h5>);
      }
    );
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

  handleValoracionDetalleChange = (event) => {
    this.setState({
      valoracionDetalle: event.target.value,
    });
  };

  handleValoracionValueChange = (value) => {
    this.setState({
      valoracionValue: value,
    });
  };

  handleEnviarValoracion = async (socket) => {
    const {
      valoracionDetalle,
      valoracionValue,
      selectedAcuerdo,
      valoracionEsAnonimo,
    } = this.state;
    const { idUsuario, email, contrasena } = this.props;

    this.setState(
      {
        valoracionIsUploading: true,
      },
      async () => {
        const idUsuarioAValorar = await axios.get(
          `${protocol}://${ipMaquina}:3001/api/procedures/getIdUsuarioConIdPerfil/${selectedAcuerdo.idCuidador._id}`
        );
        const formData = {
          idUsuario: idUsuarioAValorar.data,
          idValorador: idUsuario,
          idAcuerdo: selectedAcuerdo._id,
          valor: valoracionValue,
          comentario: valoracionDetalle,
          email,
          contrasena,
          fechaValorado: moment(),
          esAnonimo: valoracionEsAnonimo,
        };
        axios
          .post(
            `${protocol}://${ipMaquina}:3001/api/procedures/postNewValoracion`,
            formData
          )
          .then(() => {
            socket.emit("notify", {
              idUsuario: idUsuarioAValorar.data,
            });
            cogoToast.success(
              <h5>{trans("acuerdosForm.valoracionEnviada")}</h5>
            );
          })
          .catch(() => {
            cogoToast.error(<h5>{trans("notificaciones.errorGeneral")}</h5>);
          })
          .finally(() => {
            this.setState({
              valoracionIsUploading: false,
              showModalValoracion: false,
            });
          });
      }
    );
  };

  handleValoracionEsAnonimoChange = () => {
    const { valoracionEsAnonimo } = this.state;
    this.setState({
      valoracionEsAnonimo: !valoracionEsAnonimo,
    });
  };

  renderAcuerdo = (jsonAcuerdos, laOtraPersona) => {
    return jsonAcuerdos.map((acuerdo, indice) => {
      const laOtra = acuerdo[laOtraPersona];
      let subtitulo = "";
      switch (acuerdo.estadoAcuerdo) {
        case 0:
          subtitulo = i18next.t("acuerdosForm.esperandoAcuerdo");
          break;
        case 1:
          subtitulo = i18next.t("acuerdosForm.aceptadoAcuerdo");
          break;
        case 2:
          subtitulo = i18next.t("acuerdosForm.rechazadoAcuerdo");
          break;
        default:
          subtitulo = "";
      }
      return (
        <>
          <ListItem button onClick={() => {
            this.setState({
              selectedAcuerdo: acuerdo,
              showAcuerdoModal: true,
            });
          }}>
            <ListItemAvatar>
              <Avatar
                alt="avatar"
                src={`${protocol}://${ipMaquina}:3001/api/image/${laOtra.direcFoto}`}
              />
            </ListItemAvatar>
            <ListItemText
              primary={`${laOtra.nombre} ${laOtra.apellido1}`}
              secondary={subtitulo}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="comments"
                onClick={() => {
                  if (acuerdo.estadoAcuerdo !== 2) {
                    this.setState({
                      showModalTerminarAcuerdo: true,
                      selectedAcuerdo: acuerdo,
                    });
                  }
                }}
              >
                <Delete
                  style={{
                    color:
                      acuerdo.estadoAcuerdo !== 2 ? colors.red : colors.lightGrey,
                  }}
                />
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
      jsonAcuerdos,
      showAcuerdoModal,
      selectedAcuerdo,
      isOpenThreeDotLayer,
      showModalTerminarAcuerdo,
      showModalValoracion,
      valoracionDetalle,
      valoracionValue,
      valoracionIsUploading,
      valoracionEsAnonimo,
    } = this.state;
    const { tipoUsuario } = this.props;
    const laOtraPersona =
      tipoUsuario != "Cuidador" ? "idCuidador" : "idCliente";
    return (
      <SocketContext.Consumer>
        {(socket) => (
          <div
            onClick={() => this.closeOpenedOptionsDiv()}
            style={{
              minHeight: "calc(100vh - 80px)",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  minHeight: "calc(100vh - 80px)",
                }}
                className="d-flex align-items-center justify-content-center"
              >
                <ClipLoader color="#28a745" />
              </div>
            ) : jsonAcuerdos.length != 0 ? (
              <List>{this.renderAcuerdo(jsonAcuerdos, laOtraPersona)}</List>
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
                  <img src={NoAcuerdo} height={150} />
                  <h3 className="mt-5 text-center">{trans("acuerdosForm.noData")}</h3>
                </div>               
              </div>
            )}
            {selectedAcuerdo !== null ? (
              <Modal
                style={{
                  maxWidth: 500,
                }}
                show={showAcuerdoModal}
                onHide={() => this.setState({ showAcuerdoModal: false })}
              >
                <ModalHeader closeButton>
                  <h5>{trans("acuerdosForm.acuerdo")}</h5>
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
                      src={`${protocol}://${ipMaquina}:3001/api/image/${selectedAcuerdo[laOtraPersona].direcFoto}`}
                    />
                    <div className="mt-2">
                      <span className="mr-2">
                        {trans("acuerdosForm.estado")}:
                      </span>
                      {selectedAcuerdo.estadoAcuerdo === 2 ? (
                        <span className="text-danger">
                          {trans("acuerdosForm.estadoRechazado")}
                        </span>
                      ) : selectedAcuerdo.estadoAcuerdo === 1 ? (
                        <span className="text-success">
                          {trans("acuerdosForm.estadoAceptado")}
                        </span>
                      ) : (
                        <span className="text-secondary">
                          {trans("acuerdosForm.estadoPendiente")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="mt-5 d-flex flex-column"
                  >
                    <div className="d-flex flex-row align-items-center justify-content-center">
                      <FontAwesomeIcon
                        icon={faFileSignature}
                        className="mr-1"
                      />
                      <span className="font-weight-bold">
                        {trans("acuerdosForm.titulo")}
                      </span>
                    </div>
                    <span>{selectedAcuerdo.tituloAcuerdo}</span>
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
                        className="mr-1"
                      />
                      <span className="font-weight-bold">
                        {trans("acuerdosForm.descripcion")}
                      </span>
                    </div>
                    <span>{selectedAcuerdo.descripcionAcuerdo}</span>
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="mt-3"
                  >
                    <div className="text-center">
                      <FontAwesomeIcon icon={faHome} className="mr-1" />
                      <span className="font-weight-bold text-center">
                        {trans("acuerdosForm.pueblos")}
                      </span>
                    </div>
                    <span className="">
                      {typeof selectedAcuerdo.pueblo != "undefined"
                        ? selectedAcuerdo.pueblo.map((ubicacion, index) => {
                            return (
                              <div>
                                <span>{ubicacion}</span>
                                <br />
                              </div>
                            );
                          })
                        : null}
                    </span>
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="mt-3"
                  >
                    <div className="text-center">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      <span className="font-weight-bold text-center">
                        {trans("acuerdosForm.horario")}
                      </span>
                    </div>
                    <span className="">
                      {typeof selectedAcuerdo.diasAcordados != "undefined"
                        ? selectedAcuerdo.diasAcordados.map((dia, index) => {
                            return (
                              <div className="d-flex flex-row justify-content-between">
                                <span>{trans(`dias.dia_${dia.dia}`)}</span>
                                <span>
                                  {dia.horaInicio + " - " + dia.horaFin}
                                </span>
                              </div>
                            );
                          })
                        : null}
                    </span>
                  </div>
                </ModalBody>
              </Modal>
            ) : null}
            <Modal
              className="modalRegistrarse"
              show={showModalTerminarAcuerdo}
              onHide={() => this.setState({ showModalTerminarAcuerdo: false })}
            >
              <ModalBody className="d-flex flex-row align-items-center justify-content-center">
                {trans("acuerdosForm.askTerminarAcuerdo")}
              </ModalBody>
              <ModalFooter className="d-flex flex-row align-items-center justify-content-between">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    this.handleTerminarAcuerdo(selectedAcuerdo, socket);
                    this.setState({
                      showModalTerminarAcuerdo: false,
                    });
                  }}
                >
                  {trans("acuerdosForm.si")}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    this.setState({
                      showModalTerminarAcuerdo: false,
                    })
                  }
                >
                  {trans("acuerdosForm.no")}
                </button>
              </ModalFooter>
            </Modal>
            {tipoUsuario === "Cliente" ? (
              <Modal
                show={showModalValoracion}
                onHide={() => this.setState({ showModalValoracion: false })}
                style={{
                  maxWidth: 500,
                }}
                className="modalRegistrarse"
              >
                <ModalBody className="p-1 d-flex flex-column justify-content-between">
                  <span className="d-flex flex-row align-items-center justify-content-center font-weight-bold">
                    {trans("acuerdosForm.valorarCuidador")}
                  </span>
                  <Rating
                    onChange={this.handleValoracionValueChange}
                    className="mt-3 d-flex flex-row align-items-center justify-content-center"
                    initialRating={valoracionValue}
                    emptySymbol={
                      <FontAwesomeIcon
                        size={"2x"}
                        icon={faStar}
                        className="text-secondary"
                      />
                    }
                    fullSymbol={
                      <FontAwesomeIcon
                        size={"2x"}
                        icon={faStar}
                        className="text-warning"
                      />
                    }
                  />
                  <textarea
                    className="mt-3"
                    rows={3}
                    placeholder={i18next.t("acuerdosForm.detalles")}
                    value={valoracionDetalle}
                    onChange={this.handleValoracionDetalleChange}
                  />
                  <div className="my-2 d-flex flex-row align-items-center justify-content-center">
                    <input
                      type="checkbox"
                      value={valoracionEsAnonimo}
                      checked={valoracionEsAnonimo}
                      onChange={this.handleValoracionEsAnonimoChange}
                      className=""
                    />
                    <span className="ml-1">
                      {trans("acuerdosForm.valoracionAnonima")}
                    </span>
                  </div>
                </ModalBody>
                <ModalFooter className="d-flex flex-row align-items-center justify-content-center">
                  {valoracionIsUploading ? (
                    <ClipLoader color="#28a745" />
                  ) : (
                    <button
                      onClick={() => this.handleEnviarValoracion(socket)}
                      className="btn btn-success"
                    >
                      {trans("acuerdosForm.enviarValoracion")}
                    </button>
                  )}
                </ModalFooter>
              </Modal>
            ) : null}
          </div>
        )}
      </SocketContext.Consumer>
    );
  }
}

export default connect(mapStateToProps, null)(AcuerdosForm);
