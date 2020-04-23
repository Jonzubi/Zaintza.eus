import React from "react";
import { Collapse } from "react-collapse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCircle,
  faUserMd,
  faCity
} from "@fortawesome/free-solid-svg-icons";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { trans, arrayOfFalses, getTodayDate } from "../util/funciones";
import Avatar from "react-avatar";
import cogoToast from "cogo-toast";
import SocketContext from "../socketio/socket-context";

const mapStateToProps = state => {
  return {
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario,
    email: state.user.email,
    contrasena: state.user.contrasena
  };
};

class AcuerdosForm extends React.Component {
  componentDidMount() {
    //buscarUsuOrCuid =>> En esta variable guardo si el usuario iniciado es cliente o cuidador para asi si es cuidador
    //buscar cliente en el acuerdo y viceversa, ESTO ME DARA LA INFORMACION DE LA OTRA PARTE DEL ACUERDO
    const { idPerfil, tipoUsuario, email, contrasena } = this.props;

    axios
      .post(
        "http://" + ipMaquina + ":3001/api/procedures/getAcuerdosConUsuarios",
        {
          tipoUsuario: tipoUsuario,
          idPerfil: idPerfil,
          email,
          contrasena
        }
      )
      .then(resultado => {
        this.setState({
          jsonAcuerdos: resultado.data,
          acuerdosCollapseState: arrayOfFalses(resultado.data.length)
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  constructor(props) {
    super(props);

    this.state = {
      jsonAcuerdos: [],
      acuerdosCollapseState: []
    };

    this.handleToogleCollapseAcuerdo = this.handleToogleCollapseAcuerdo.bind(
      this
    );
  }

  handleToogleCollapseAcuerdo(index) {
    let aux = this.state.acuerdosCollapseState;
    aux[index] = !aux[index];

    this.setState({
      acuerdosCollapseState: aux
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

  async handleTerminarAcuerdo(acuerdo, indice, socket) {
    if (acuerdo.estadoAcuerdo == 2) {
      return;
    }
    const { email, contrasena, tipoUsuario } = this.props;
    let today = getTodayDate();
    const objToday = new Date();

    await axios.patch(
      "http://" + ipMaquina + ":3001/api/procedures/terminarAcuerdo/" + acuerdo._id,
      {
        whoAmI: tipoUsuario,
        email,
        contrasena
      }
    );
    //Ahora se quiere notificar a la otra parte del acuerdo de la finalizacion del acuerdo
    let buscarUsuOrCuid =
      this.props.tipoUsuario == "Cliente" ? "idCuidador" : "idCliente";
    const idElOtro = acuerdo[buscarUsuOrCuid]._id;
    let elOtroUsu = await axios.get(`http://${ipMaquina}:3001/api/procedures/getIdUsuarioConIdPerfil/${idElOtro}`);
    const notificacionData = {
      idUsuario: elOtroUsu.data,
      idRemitente: this.props.idUsuario,
      tipoNotificacion: "AcuerdoGestionado",
      valorGestion: false,
      visto: false,
      dateEnvioNotificacion:
        today + " " + objToday.getHours() + ":" + objToday.getMinutes(),
      email,
      contrasena
    };
    await axios.post(
      "http://" + ipMaquina + ":3001/api/procedures/newNotification",
      notificacionData
    );

    socket.emit('notify', {
      idUsuario: elOtroUsu.data
    });

    let auxJsonAcuerdos = this.state.jsonAcuerdos;
    auxJsonAcuerdos[indice].estadoAcuerdo = 2;
    this.setState(
      {
        jsonAcuerdos: auxJsonAcuerdos
      },
      () => {
        cogoToast.success(<h5>{trans("acuerdosForm.acuerdoTerminado")}</h5>);
      }
    );
  }

  render() {
    const laOtraPersona =
      this.props.tipoUsuario != "Cuidador" ? "idCuidador" : "idCliente";
    return (
      <SocketContext.Consumer>
        {socket => (
          <div className="p-lg-5 p-2 h-100">
            {this.state.jsonAcuerdos.length != 0 ? (
              this.state.jsonAcuerdos.map((acuerdo, indice) => {
                return (
                  <div className="w-100 card">
                    <div className="card-header">
                      <div className="d-flex flex-row align-items-center justify-content-between">                
                        <div className="d-flex align-items-center">
                          <Avatar
                            size={50}
                            className=""
                            name={acuerdo[laOtraPersona].nombre}
                            src={
                              "http://" +
                              ipMaquina +
                              ":3001/api/image/" +
                              acuerdo[laOtraPersona].direcFoto
                            }
                          />
                          <div className="ml-3">
                            <span className="font-weight-bold">
                              {acuerdo[laOtraPersona].nombre +
                                " " +
                                acuerdo[laOtraPersona].apellido1}
                            </span>{" "}
                            <span className="d-lg-inline d-none">
                              {acuerdo.estadoAcuerdo == 0
                                ? trans("acuerdosForm.esperandoAcuerdo")
                                : acuerdo.estadoAcuerdo == 1
                                ? trans("acuerdosForm.aceptadoAcuerdo")
                                : trans("acuerdosForm.rechazadoAcuerdo")}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex flex-row align-items-center">
                          {acuerdo.estadoAcuerdo == 0 ? (
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {trans("acuerdosForm.estadoPendiente")}
                                </Tooltip>
                              }
                            >
                              <FontAwesomeIcon
                                className="text-secondary"
                                icon={faCircle}
                              />
                            </OverlayTrigger>
                          ) : acuerdo.estadoAcuerdo == 1 ? (
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {trans("acuerdosForm.estadoAceptado")}
                                </Tooltip>
                              }
                            >
                              <FontAwesomeIcon
                                className="text-success"
                                icon={faCircle}
                              />
                            </OverlayTrigger>
                          ) : (
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {trans("acuerdosForm.estadoRechazado")}
                                </Tooltip>
                              }
                            >
                              <FontAwesomeIcon
                                className="text-danger"
                                icon={faCircle}
                              />
                            </OverlayTrigger>
                          )}
                          <div className="">
                            <FontAwesomeIcon
                              style={{ cursor: "pointer" }}
                              size="2x"
                              icon={faCaretDown}
                              className="ml-5"
                              onClick={() =>
                                this.handleToogleCollapseAcuerdo(indice)
                              }
                            />
                        </div>
                        </div>
                      </div>
                    </div>
                    <Collapse
                      className="card-body"
                      isOpened={this.state.acuerdosCollapseState[indice]}
                    >
                      <div>
                        <h3 className="">
                          {acuerdo.tituloAcuerdo}
                        </h3>
                        <hr />
                        <div className="p-5 font-weight-bold text-center">
                          {acuerdo.descripcionAcuerdo}
                        </div>
                        <div className="row">
                          <div className="col-6 text-center">
                            <span>{trans("notificacionesForm.pueblos")}</span>
                            <hr />
                            <ul className="list-group">
                              {typeof acuerdo.pueblo.map != "undefined"
                                ? acuerdo.pueblo.map(pueblo => {
                                    return (
                                      <li className="list-group-item font-weight-bold">
                                        {pueblo}
                                      </li>
                                    );
                                  })
                                : null}
                            </ul>
                          </div>
                          <div className="col-6 text-center">
                            <span>{trans("notificacionesForm.dias")}</span>
                            <hr />
                            <ul className="list-group">
                              {typeof acuerdo.diasAcordados.map != "undefined"
                                ? acuerdo.diasAcordados.map(dia => {
                                    return (
                                      <li className="list-group-item">
                                        <span className="font-weight-bold">
                                          {this.traducirDia(dia.dia) + ": "}
                                        </span>
                                        <span>
                                          {dia.horaInicio + " - " + dia.horaFin}
                                        </span>
                                      </li>
                                    );
                                  })
                                : null}
                            </ul>
                          </div>
                        </div>
                        <div className="row ml-0 mr-0 mt-5">
                          <button
                            onClick={() =>
                              this.handleTerminarAcuerdo(acuerdo, indice, socket)
                            }
                            className={
                              acuerdo.estadoAcuerdo != 2
                                ? "w-100 btn btn-danger"
                                : "w-100 btn btn-danger disabled"
                            }
                          >
                            {trans("acuerdosForm.terminarAcuerdo")}
                          </button>
                        </div>
                      </div>
                    </Collapse>
                  </div>
                );
              })
            ) : (
              <div className="d-flex justify-content-center">
                <small className="text-danger my-auto">
                  {trans("acuerdosForm.noData")}
                </small>
              </div>
            )}
          </div>
        )}
      </SocketContext.Consumer>
    );
  }
}

export default connect(mapStateToProps, null)(AcuerdosForm);
