import React from "react";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { connect } from "react-redux";
import { t } from "../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faEye } from "@fortawesome/free-solid-svg-icons";
import { Collapse } from "react-collapse";
import Avatar from "react-avatar";
import cogoToast from "cogo-toast";

const mapStateToProps = state => {
  return {
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario
  };
};

class NotificacionesForm extends React.Component {
  componentDidMount() {
    let jsonNotificaciones = [];
    let auxNotificacionesCollapseState = [];
    axios
      .get("http://" + ipMaquina + ":3001/notificacion", {
        params: {
          filtros: {
            idUsuario: this.props.idUsuario
          }
        }
      })
      .then(notificaciones => {
        for (let i = 0; i < notificaciones.data.length; i++) {
          let notificacion = notificaciones.data[i];
          switch (notificacion.tipoNotificacion) {
            //Si es acuerdo recupero los datos de la persona que envio la propuesta
            case "Acuerdo":
              const tablaLaOtraPersona =
                this.props.tipoUsuario == "C" ? "cuidador" : "cliente";
              const idLaOtraPersona =
                this.props.tipoUsuario == "C" ? "idCuidador" : "idCliente";
              axios
                .get(
                  "http://" +
                    ipMaquina +
                    ":3001/" +
                    tablaLaOtraPersona +
                    "/" +
                    notificacion.acuerdo[idLaOtraPersona]
                )
                .then(laOtraPersona => {
                  //Le asigno un nuevo atributo a la notificacion con todos los datos de la otra persona
                  notificacion.laOtraPersona = laOtraPersona.data;
                  jsonNotificaciones.push(notificacion);
                  auxNotificacionesCollapseState.push(false);

                  if (i == notificaciones.data.length - 1) {
                    this.setState({
                      jsonNotificaciones: jsonNotificaciones,
                      notificacionesCollapseState: auxNotificacionesCollapseState
                    });
                  }
                });
              break;
            default:
              break;
          }
        }
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
    let aux = this.state.notificacionesCollapseState;
    aux[index] = !aux[index];

    let auxJsonNotif = this.state.jsonNotificaciones;
    if (!auxJsonNotif[index].visto) {
      await axios.patch(
        "http://" + ipMaquina + ":3001/notificacion/" + auxJsonNotif[index]._id,
        {
          visto: true
        }
      );
      auxJsonNotif[index].visto = true;
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

  async handleGestionarPropuesta(notificacion, indice, ifAccept) {
    const acuerdo = notificacion.acuerdo;
    let auxJsonNotif = this.state.jsonNotificaciones;

    await axios.patch("http://" + ipMaquina + ":3001/acuerdo/" + acuerdo._id, {
      estadoAcuerdo: ifAccept ? 1 : 2 //Si Accept es true acepta el acuerdo mandando un 1 a la BD, si no un 2
    });
    await axios.delete(
      "http://" + ipMaquina + ":3001/notificacion/" + notificacion._id
    );
    delete auxJsonNotif[indice];
    this.setState(
      {
        jsonNotificaciones: auxJsonNotif
      },
      () => {
        ifAccept
          ? cogoToast.success(
              <h5>{t("notificacionesForm.acuerdoAceptado")}</h5>
            )
          : cogoToast.success(
              <h5>{t("notificacionesForm.acuerdoRechazado")}</h5>
            );
      }
    );
  }

  render() {
    return (
      <div className="p-5">
        {this.state.jsonNotificaciones.length != 0 ? this.state.jsonNotificaciones.map((notificacion, indice) => {
          return (
            <div className="w-100 card mt-2 mb-2">
              <div className="card-header">
                <div className="row">
                  <div className="col-11 text-center">
                    {notificacion.tipoNotificacion == "Acuerdo" ? (
                      <div className="d-flex align-items-center">
                        <Avatar
                          size={50}
                          className=""
                          name={notificacion.laOtraPersona.nombre}
                          src={
                            "http://" +
                            ipMaquina +
                            ":3001/image/" +
                            notificacion.laOtraPersona.direcFoto
                          }
                        />
                        <div className="ml-3">
                          <span className="font-weight-bold">
                            {notificacion.laOtraPersona.nombre +
                              " " +
                              notificacion.laOtraPersona.apellido1}
                          </span>{" "}
                          <span>
                            {t("notificacionesForm.propuestaAcuerdo")}
                          </span>
                        </div>
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
                          <span>{t("notificacionesForm.pueblos")}</span>
                          <hr />
                          <ul className="list-group">
                            {typeof notificacion.acuerdo.pueblo.map !=
                            "undefined"
                              ? notificacion.acuerdo.pueblo.map(pueblo => {
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
                            {typeof notificacion.acuerdo.diasAcordados.map !=
                            "undefined"
                              ? notificacion.acuerdo.diasAcordados.map(dia => {
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
                      <div className="row mt-5 ml-0 mr-0">
                        <button
                          onClick={() =>
                            this.handleGestionarPropuesta(notificacion, indice, true)
                          }
                          className="btn btn-success col-6"
                        >
                          {t("notificacionesForm.aceptarAcuerdo")}
                        </button>
                        <button onClick={() => this.handleGestionarPropuesta(notificacion, indice, false)} className="btn btn-danger col-6">
                          {t("notificacionesForm.rechazarAcuerdo")}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Collapse>
            </div>
          );
        }) : (
          <div className="d-flex justify-content-center">
            <small className="text-danger my-auto">
              {t("notificacionesForm.noData")}
            </small>
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(NotificacionesForm);
