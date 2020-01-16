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
import { t, arrayOfFalses } from "../util/funciones";
import Avatar from "react-avatar";
import cogoToast from "cogo-toast";

const mapStateToProps = state => {
  return {
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario
  };
};

class AcuerdosForm extends React.Component {
  componentDidMount() {
    //buscarUsuOrCuid =>> En esta variable guardo si el usuario iniciado es cliente o cuidador para asi si es cuidador
    //buscar cliente en el acuerdo y viceversa, ESTO ME DARA LA INFORMACION DE LA OTRA PARTE DEL ACUERDO
    const { idPerfil, tipoUsuario } = this.props;
    
    axios.get("http://" + ipMaquina + ":3001/api/procedures/getAcuerdosConUsuarios", {
      params: {
        tipoUsuario: tipoUsuario,
        idPerfil: idPerfil
      }      
    })
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

  async handleTerminarAcuerdo(acuerdo, indice) {
    if (acuerdo.estadoAcuerdo == 2) {
      return;
    }
    var objToday = new Date();
    var dd = objToday.getDate();
    var mm = objToday.getMonth() + 1;

    var yyyy = objToday.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    var today = mm + "/" + dd + "/" + yyyy;

    await axios.patch("http://" + ipMaquina + ":3001/api/acuerdo/" + acuerdo._id, {
      estadoAcuerdo: 2,
      dateFinAcuerdo: today
    });
    //Ahora se quiere notificar a la otra parte del acuerdo de la finalizacion del acuerdo
    let buscarUsuOrCuid =
      this.props.tipoUsuario == "Cliente" ? "idCuidador" : "idCliente";
    const idElOtro = acuerdo[buscarUsuOrCuid];
    let elOtroUsu = await axios.get("http://" + ipMaquina + ":3001/api/usuario", {
      params: {
        filtros: {
          idPerfil: idElOtro
        }
      }
    });
    const notificacionData = {
      idUsuario: elOtroUsu.data[0]._id,
      idRemitente: this.props.idUsuario,
      tipoNotificacion: "AcuerdoGestionado",
      valorGestion: false,
      visto: false,
      dateEnvioNotificacion: today + " " + objToday.getHours() + ":" + objToday.getMinutes()
    };
    await axios.post(
      "http://" + ipMaquina + ":3001/api/notificacion",
      notificacionData
    );

    let auxJsonAcuerdos = this.state.jsonAcuerdos;
    auxJsonAcuerdos[indice].estadoAcuerdo = 2;
    this.setState(
      {
        jsonAcuerdos: auxJsonAcuerdos
      },
      () => {
        cogoToast.success(<h5>{t("acuerdosForm.acuerdoTerminado")}</h5>);
      }
    );
  }

  render() {
    const laOtraPersona = this.props.tipoUsuario != "Cuidador" ? "idCuidador" : "idCliente";
    return (
      <div className="p-5 h-100">
        {this.state.jsonAcuerdos.length != 0 ? (
          this.state.jsonAcuerdos.map((acuerdo, indice) => {
            return (
              <div className="w-100 card">
                <div className="card-header">
                  <div className="row">
                    <div className="col-10 text-center">
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
                          <span>
                            {acuerdo.estadoAcuerdo == 0
                              ? t("acuerdosForm.esperandoAcuerdo")
                              : acuerdo.estadoAcuerdo == 1
                              ? t("acuerdosForm.aceptadoAcuerdo")
                              : t("acuerdosForm.rechazadoAcuerdo")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-1 text-center my-auto">
                      {acuerdo.estadoAcuerdo == 0 ? (
                        <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip>
                              {t("acuerdosForm.estadoPendiente")}
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
                              {t("acuerdosForm.estadoAceptado")}
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
                              {t("acuerdosForm.estadoRechazado")}
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            className="text-danger"
                            icon={faCircle}
                          />
                        </OverlayTrigger>
                      )}
                    </div>
                    <div className="col-1 text-center my-auto">
                      <FontAwesomeIcon
                        style={{ cursor: "pointer" }}
                        size="2x"
                        icon={faCaretDown}
                        className=""
                        onClick={() => this.handleToogleCollapseAcuerdo(indice)}
                      />
                    </div>
                  </div>
                </div>
                <Collapse
                  className="card-body"
                  isOpened={this.state.acuerdosCollapseState[indice]}
                >
                  <div>
                    <span className="display-4">{acuerdo.tituloAcuerdo}</span>
                    <hr />
                    <div className="p-5 font-weight-bold text-center">
                      {acuerdo.descripcionAcuerdo}
                    </div>
                    <div className="row">
                      <div className="col-6 text-center">
                        <span>{t("notificacionesForm.pueblos")}</span>
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
                        <span>{t("notificacionesForm.dias")}</span>
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
                          this.handleTerminarAcuerdo(acuerdo, indice)
                        }
                        className={
                          acuerdo.estadoAcuerdo != 2
                            ? "w-100 btn btn-danger"
                            : "w-100 btn btn-danger disabled"
                        }
                      >
                        {t("acuerdosForm.terminarAcuerdo")}
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
              {t("acuerdosForm.noData")}
            </small>
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(AcuerdosForm);
