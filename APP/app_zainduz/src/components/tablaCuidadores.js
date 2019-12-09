import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheck,
  faTimes,
  faUser,
  faCalendarAlt,
  faPlusCircle,
  faMinusCircle
} from "@fortawesome/free-solid-svg-icons";
import loadGif from "../util/gifs/loadGif.gif";
import Axios from "axios";
import Modal from "react-bootstrap/Modal";
import Collapse from "react-bootstrap/Collapse";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import Button from "react-bootstrap/Button";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import "./styles/tablaCuidadores.css";
import TimeInput from "react-time-input";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { connect } from "react-redux";
import { t } from "../util/funciones";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";

const mapStateToProps = state => {
  return {
    tipoUsuario: state.user.tipoUsuario
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toogleMenuPerfil: payload => dispatch(toogleMenuPerfil(payload))
  };
};

class Tabla extends React.Component {
  componentDidMount() {
    Axios.get("http://" + ipMaquina + ":3001/cuidador")
      .then(data => {
        this.setState({
          jsonCuidadores: data.data,
          buscado: true
        });
      })
      .catch(err => {
        this.setState({
          buscado: true
        });
        cogoToast.error(<h5>{t("notificaciones.servidorNoDisponible")}</h5>);
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      buscado: false,
      jsonCuidadores: {},
      showModal: false,
      showPropuestaModal: false,
      selectedCuidador: {},
      txtTituloPropuesta: "",
      diasDisponible: [
        {
          dia: 0,
          horaInicio: "00:00",
          horaFin: "00:00"
        }
      ]
    };
    this.handleShowModalChange = this.handleShowModalChange.bind(this);
    this.handleShowPropuestaModalChange = this.handleShowPropuestaModalChange.bind(
      this
    );
    this.handlePedirCuidado = this.handlePedirCuidado.bind(this);
    this.handleEnviarPropuesta = this.handleEnviarPropuesta.bind(this);
    this.handleDiasDisponibleChange = this.handleDiasDisponibleChange.bind(this);
    this.addDiasDisponible = this.addDiasDisponible.bind(this);
    this.removeDiasDisponible = this.removeDiasDisponible.bind(this);
  }

  addDiasDisponible() {
    let auxDiasDisponible = this.state.diasDisponible;
    auxDiasDisponible.push({
      dia: 0,
      horaInicio: "00:00",
      horaFin: "00:00"
    });

    this.setState({
      diasDisponible: auxDiasDisponible
    });
  }

  handleDiasDisponibleChange(e, indice) {
    if (typeof indice == "undefined") {
      //Significa que lo que se ha cambiado es el combo de los dias
      var origen = e.target;
      var indice = parseInt(origen.id.substr(origen.id.length - 1));
      var valor = origen.value;

      let auxDiasDisponible = this.state.diasDisponible;
      auxDiasDisponible[indice]["dia"] = valor;

      this.setState({
        diasDisponible: auxDiasDisponible
      });
    } else {
      //Significa que ha cambiado la hora, no se sabe si inicio o fin, eso esta en "indice"
      let atributo = indice.substr(0, indice.length - 1);
      indice = indice.substr(indice.length - 1);

      let auxDiasDisponible = this.state.diasDisponible;
      auxDiasDisponible[indice][atributo] = e;

      this.setState({
        diasDisponible: auxDiasDisponible
      });
    }
  }

  removeDiasDisponible() {
    this.setState({
      diasDisponible:
        typeof this.state.diasDisponible.pop() != "undefined"
          ? this.state.diasDisponible
          : []
    });
  }

  handleInputChange(e) {
    var stateId = e.target.id;
    this.setState({
      [stateId]: e.target.value
    });
  }

  async handleShowModalChange(state) {
    await this.setState({
      showModal: state,
      showPropuestaModal: false,      
    });
    //El await lo hago porque si no aparece la inicializacion de horas en la pagina y no da un buen efecto
    this.setState({
      diasDisponible: [
        {
          dia: 0,
          horaInicio: "00:00",
          horaFin: "00:00"
        }
      ]
    });
  }

  handleShowPropuestaModalChange(state) {
    this.setState({
      showPropuestaModal: state
    });
  }

  handleViewCuidador(cuidador) {
    let idPerfil = cuidador._id;
    const objFiltros = {
      idPerfil: idPerfil
    };
    Axios.get("http://" + ipMaquina + ":3001/usuario", {
      params: {
        filtros: JSON.stringify(objFiltros)
      }
    })
      .then(resultado => {
        resultado = resultado.data[0];
        this.setState({
          showModal: true,
          selectedCuidador: Object.assign({}, cuidador, {
            email: resultado.email
          })
        });
      })
      .catch(err => {
        cogoToast.error(<h5>{t("registerFormClientes.errorGeneral")}</h5>);
      });
  }

  handlePedirCuidado() {
    if (!this.props.tipoUsuario) {
      cogoToast.error(<h5>{t("tablaCuidadores.errorNoLogueado")}</h5>);
      this.handleShowModalChange(false);
      this.props.toogleMenuPerfil(true);
      return;
    } else if (this.props.tipoUsuario != "C") {
      cogoToast.error(<h5>{t("tablaCuidadores.errorClienteObligatorio")}</h5>);
      this.handleShowModalChange(false);
      return;
    }

    this.setState({
      showPropuestaModal: true
    });
  }

  handleEnviarPropuesta() {}

  render() {
    const vSelectedCuidador = this.state.selectedCuidador;
    const fechaNacCuidador = new Date(vSelectedCuidador.fechaNacimiento);
    const telefonoFijoCuidador =
      typeof vSelectedCuidador.telefono == "undefined" ? (
        <em>Definitu gabe</em>
      ) : typeof vSelectedCuidador.telefono.fijo == "undefined" ? (
        <em>Definitu gabe</em>
      ) : (
        vSelectedCuidador.telefono.fijo.numero || <em>Definitu gabe</em>
      );
    const telefonoMovilCuidador =
      typeof vSelectedCuidador.telefono == "undefined" ? (
        <em>Definitu gabe</em>
      ) : typeof vSelectedCuidador.telefono.movil == "undefined" ? (
        <em>Definitu gabe</em>
      ) : (
        vSelectedCuidador.telefono.movil.numero || <em>Definitu gabe</em>
      );
    const traducDias = [
      "Astelehena",
      "Asteartea",
      "Asteazkena",
      "Osteguna",
      "Ostirala",
      "Larunbata",
      "Igandea"
    ];
    console.log(vSelectedCuidador);
    return (
      <div className="d-flex flex-wrap justify-content-center">
        {typeof this.state.jsonCuidadores.map != "undefined" &&
        this.state.buscado ? (
          this.state.jsonCuidadores.map((cuidador, indice) => {
            return (
              <div className="card w-20 m-4" style={{ width: "18rem" }}>
                <div
                  style={{
                    //backgroundImage:"url(http://" + ipMaquina + ":3001/image/" + cuidador.direcFotoContacto + ")",
                    height: "300px",
                    width: "calc(100% - 20px)",
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                    backgroundRepeat: "no-repeat",
                    margin: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                  className="card-img-top"
                  alt="Imagen no disponible"
                >
                  <img
                    style={{ maxHeight: "250px", height: "auto" }}
                    src={
                      "http://" +
                      ipMaquina +
                      ":3001/image/" +
                      cuidador.direcFotoContacto
                    }
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title mt-2">
                    {cuidador.nombre + " " + cuidador.apellido1}
                  </h5>
                  <p
                    className="card-text"
                    style={{ maxHeight: "75px", overflow: "hidden" }}
                  >
                    {cuidador.descripcion}
                  </p>
                </div>
                <div className="card-body">
                  <div className="row text-muted card-title">
                    <div className="col text-center">
                      {t("tablaCuidadores.ninos")}
                    </div>
                    <div className="col text-center">
                      {t("tablaCuidadores.terceraEdad")}
                    </div>
                    <OverlayTrigger
                      key="top"
                      placement="top"
                      overlay={
                        <Tooltip>
                          {t("tablaCuidadores.necesidadEspecial")}
                        </Tooltip>
                      }
                    >
                      <div className="col text-center">
                        {t("tablaCuidadores.necesidadEspecialAcortado")}
                      </div>
                    </OverlayTrigger>
                  </div>

                  <div className="row">
                    <div className="col text-center">
                      {cuidador.publicoDisponible.nino ? (
                        <FontAwesomeIcon
                          className="text-success"
                          icon={faCheck}
                        />
                      ) : (
                        <FontAwesomeIcon
                          className="text-danger"
                          icon={faTimes}
                        />
                      )}
                    </div>
                    <div className="col text-center">
                      {cuidador.publicoDisponible.terceraEdad ? (
                        <FontAwesomeIcon
                          className="text-success"
                          icon={faCheck}
                        />
                      ) : (
                        <FontAwesomeIcon
                          className="text-danger"
                          icon={faTimes}
                        />
                      )}
                    </div>
                    <div className="col text-center">
                      {cuidador.publicoDisponible.necesidadEspecial ? (
                        <FontAwesomeIcon
                          className="text-success"
                          icon={faCheck}
                        />
                      ) : (
                        <FontAwesomeIcon
                          className="text-danger"
                          icon={faTimes}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body card-footer">
                  <a
                    className="mr-0 w-100 btn btn-success text-light"
                    onClick={() => {
                      this.handleViewCuidador(cuidador);
                    }}
                  >
                    {t("tablaCuidadores.ver")}
                    <FontAwesomeIcon className="ml-1" icon={faEye} />
                  </a>
                </div>
              </div>
            );
          })
        ) : typeof this.state.jsonCuidadores.map == "undefined" &&
          !this.state.buscado ? (
          <div className="w-100 text-center">
            <img
              style={{ marginTop: "300px" }}
              src={loadGif}
              height={100}
              width={100}
            />
          </div>
        ) : (
          <small
            style={{ marginTop: "300px" }}
            className="text-danger text-center w-100"
          >
            {t("tablaCuidadores.noData")}
          </small>
        )}

        <Modal
          className="modalCustomClass"
          show={this.state.showModal}
          onHide={() => this.handleShowModalChange(false)}
        >
          <ModalHeader closeLabel="Itxi" closeButton></ModalHeader>
          <ModalBody className="container-fluid">
            <h5 style={{ marginBottom: "20px" }} className="display-4">
              {t("tablaCuidadores.datosPersonales")}
            </h5>
            <div
              style={{
                width: "calc(100% - 20px)",
                backgroundSize: "cover",
                backgroundPosition: "top",
                backgroundRepeat: "no-repeat",
                margin: "10px",
                display: "flex",
                overflow: "hidden"
              }}
              className=""
              alt="Imagen no disponible"
            >
              <img
                style={{
                  minHeight: "300px",
                  maxHeight: "300px",
                  height: "auto"
                }}
                src={
                  "http://" +
                  ipMaquina +
                  ":3001/image/" +
                  vSelectedCuidador.direcFotoContacto
                }
              />
              <div className="table mb-0">
                {/* Aqui van los datos personales en forma de tabla */}
                <div className="row h-100">
                  <div className="col-5 h-100 border-right border-top">
                    <div className="row ml-0 h-25 border-bottom">
                      <span className="col-3 text-center my-auto font-weight-bold">
                        {t("tablaCuidadores.nombre")}:
                      </span>
                      <span className="col-9 text-center my-auto">
                        {vSelectedCuidador.nombre}
                      </span>
                    </div>

                    <div className="row ml-0 h-25 border-bottom">
                      <span className="col-3 text-center my-auto font-weight-bold">
                        {t("tablaCuidadores.apellidos")}:
                      </span>
                      <span className="col-9 text-center my-auto">
                        {(
                          vSelectedCuidador.apellido1 +
                          " " +
                          vSelectedCuidador.apellido2
                        ).length > 1 ? (
                          vSelectedCuidador.apellido1 +
                          " " +
                          vSelectedCuidador.apellido2
                        ) : (
                          <em>{t("tablaCuidadores.sinDefinir")}</em>
                        )}
                      </span>
                    </div>

                    <div className="row ml-0 h-25 border-bottom">
                      <span className="col-3 text-center my-auto font-weight-bold">
                        {t("tablaCuidadores.fechaNac")}:
                      </span>
                      <span className="col-9 text-center my-auto">
                        {fechaNacCuidador.getFullYear() +
                          "/" +
                          (fechaNacCuidador.getMonth() + 1) +
                          "/" +
                          fechaNacCuidador.getDate()}
                      </span>
                    </div>
                    <div className="row ml-0 h-25 border-bottom">
                      <span className="col-3 text-center my-auto font-weight-bold">
                        {t("tablaCuidadores.sexo")}:
                      </span>
                      <span className="col-9 text-center my-auto">
                        {vSelectedCuidador.sexo == "M"
                          ? "Gizonezkoa"
                          : "Emakumezkoa"}
                      </span>
                    </div>
                  </div>
                  <div className="col-3 h-100 border-right p-0 border-top">
                    <div
                      className="row ml-0 mr-0 border-bottom"
                      style={{ height: "34%" }}
                    >
                      <span className="col-3 text-center my-auto font-weight-bold">
                        {t("tablaCuidadores.email")}:
                      </span>
                      <span className="col-9 text-center my-auto">
                        {vSelectedCuidador.email}
                      </span>
                    </div>
                    <div
                      className="row ml-0 mr-0 border-bottom"
                      style={{ height: "33%" }}
                    >
                      <span className="col-3 text-center my-auto font-weight-bold">
                        {t("tablaCuidadores.movil")}:
                      </span>
                      <span className="col-9 text-center my-auto">
                        {telefonoMovilCuidador}
                      </span>
                    </div>
                    <div
                      className="row ml-0 mr-0 border-bottom"
                      style={{ height: "33%" }}
                    >
                      <span className="col-3 text-center my-auto font-weight-bold">
                        {t("tablaCuidadores.telefFijo")}:
                      </span>
                      <span className="col-9 text-center my-auto">
                        {telefonoFijoCuidador}
                      </span>
                    </div>
                  </div>
                  <div className="col-4 h-100 p-0 border-bottom border-top border-right">
                    <div className="panel panel-default">
                      <div className="panel-header text-center mb-5 font-weight-bold">
                        {t("tablaCuidadores.descripcion")}
                      </div>
                      <div className="panel-body p-2">
                        {vSelectedCuidador.descripcion}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h5 style={{ margin: "20px 0px" }} className="display-4">
              {t("tablaCuidadores.condiciones")}
            </h5>
            <hr />
            <div className="row h-100">
              <div className="col-4 h-100 panel panel-default">
                <h5 className="panel-header text-center">
                  {t("tablaCuidadores.pueblos")}
                </h5>
                <div className="panel-body list-group">
                  {typeof vSelectedCuidador.ubicaciones != "undefined"
                    ? vSelectedCuidador.ubicaciones.map((ubicacion, index) => {
                        return (
                          <span className="list-group-item">{ubicacion}</span>
                        );
                      })
                    : null}
                </div>
              </div>
              <div className="col-4 h-100">
                <h5 className="panel-header text-center">
                  {t("tablaCuidadores.horasLibres")}
                </h5>
                <div className="list-group">
                  {typeof vSelectedCuidador.diasDisponible != "undefined" &&
                  vSelectedCuidador.diasDisponible.length > 0 ? (
                    vSelectedCuidador.diasDisponible.map(dia => {
                      return (
                        <div className="list-group-item">
                          <span className="list-group-item border-right font-weight-bold text-center">
                            {traducDias[dia.dia - 1]}
                          </span>
                          <span className="list-group-item text-center">
                            {dia.horaInicio + " - " + dia.horaFin}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="list-group">
                      <em className="text-center list-group-item">
                        {t("tablaCuidadores.sinDefinir")}
                      </em>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-4 h-100">
                <h5 className="panel-header text-center">
                  {t("tablaCuidadores.precios")}
                </h5>
                <div className="list-group">
                  <div className="list-group-item">
                    <span className="list-group-item font-weight-bold">
                      {t("tablaCuidadores.ninos")}
                    </span>
                    <span className="list-group-item">
                      {typeof vSelectedCuidador.precioPorPublico !=
                      "undefined" ? (
                        vSelectedCuidador.precioPorPublico.nino != "" ? (
                          vSelectedCuidador.precioPorPublico.nino + "€ /orduko"
                        ) : (
                          <em>Definitu gabe</em>
                        )
                      ) : null}
                    </span>
                  </div>
                  <div className="list-group-item">
                    <span className="list-group-item font-weight-bold">
                      {t("tablaCuidadores.terceraEdad")}
                    </span>
                    <span className="list-group-item">
                      {typeof vSelectedCuidador.precioPorPublico !=
                      "undefined" ? (
                        vSelectedCuidador.precioPorPublico.terceraEdad != "" ? (
                          vSelectedCuidador.precioPorPublico.terceraEdad +
                          "€ /orduko"
                        ) : (
                          <em>Definitu gabe</em>
                        )
                      ) : null}
                    </span>
                  </div>
                  <div className="list-group-item">
                    <span className="list-group-item font-weight-bold">
                      {t("tablaCuidadores.necesidadEspecial")}
                    </span>
                    <span className="list-group-item">
                      {typeof vSelectedCuidador.precioPorPublico !=
                      "undefined" ? (
                        vSelectedCuidador.precioPorPublico.necesidadEspecial !=
                        "" ? (
                          vSelectedCuidador.precioPorPublico.necesidadEspecial +
                          "€ /orduko"
                        ) : (
                          <em>Definitu gabe</em>
                        )
                      ) : null}
                    </span>
                  </div>
                </div>
              </div>
              <Collapse className="w-100" in={this.state.showPropuestaModal}>
                <div>
                  <h5 className="display-4 mb-2">
                    {t("tablaCuidadores.tuPropuesta")}
                  </h5>
                  <div className="row mr-0 ml-0 mb-2 p-2 text-center">
                    <label
                      className="w-100 text-center"
                      htmlFor="txtTituloPropuesta"
                    >
                      {t("tablaCuidadores.tituloPropuesta")}
                    </label>
                    <input
                      onChange={this.handleInputChange}
                      type="text"
                      className="form-control"
                      id="txtTituloPropuesta"
                      aria-describedby="txtNombreHelp"
                      placeholder="Idatzi proposamen izenburua..."
                      value={this.state.txtTituloPropuesta}
                    />
                  </div>
                  <div className="row ml-0 mr-0 mb-2">
                    <div className="col-6">
                      <label className="w-100 text-center">
                        {t("tablaCuidadores.horasPropuesta")}:
                      </label>
                      <div className="w-100 mt-2" id="diasDisponible">
                        {/* Aqui iran los dias dinamicamente */}
                        {this.state.diasDisponible.map((objDia, indice) => {
                          return (
                            <div
                              className="col-6 mx-auto text-center"
                              id={"diaDisponible" + indice}
                            >
                              <div className="form-control mt-4 w-100">
                                <select
                                  value={this.state.diasDisponible[indice].dia}
                                  onChange={this.handleDiasDisponibleChange}
                                  className="d-inline"
                                  id={"dia" + indice}
                                >
                                  <option>Aukeratu eguna</option>
                                  <option value="1">Astelehena</option>
                                  <option value="2">Asteartea</option>
                                  <option value="3">Asteazkena</option>
                                  <option value="4">Osteguna</option>
                                  <option value="5">Ostirala</option>
                                  <option value="6">Larunbata</option>
                                  <option value="7">Igandea</option>
                                </select>
                                <br />
                                <br />
                                <b>
                                  {t("registerFormCuidadores.horaInicio")} :
                                </b>
                                <TimeInput
                                  onTimeChange={valor => {
                                    this.handleDiasDisponibleChange(
                                      valor,
                                      "horaInicio" + indice
                                    );
                                  }}
                                  id={"horaInicio" + indice}
                                  initTime={
                                    this.state.diasDisponible[indice]
                                      .horaInicio != "00:00"
                                      ? this.state.diasDisponible[indice]
                                          .horaInicio
                                      : "00:00"
                                  }
                                  className="mt-1 text-center d-inline form-control"
                                />
                                <br />
                                <b>{t("registerFormCuidadores.horaFin")} :</b>
                                <TimeInput
                                  onTimeChange={valor => {
                                    this.handleDiasDisponibleChange(
                                      valor,
                                      "horaFin" + indice
                                    );
                                  }}
                                  id={"horaFin" + indice}
                                  initTime={
                                    this.state.diasDisponible[indice].horaFin !=
                                    "00:00"
                                      ? this.state.diasDisponible[indice]
                                          .horaFin
                                      : "00:00"
                                  }
                                  className="mt-1 text-center d-inline form-control"
                                />
                                <br />
                                <br />
                              </div>
                            </div>
                          );
                        })}
                        <div id="botonesDiasDisponible" className="w-100 mt-2">
                          {this.state.diasDisponible.length > 0 ? (
                            <a
                              onClick={this.removeDiasDisponible}
                              className="btn btn-danger float-left text-light"
                            >
                              {t("registerFormCuidadores.eliminarDia")}{" "}
                              <FontAwesomeIcon icon={faMinusCircle} />
                            </a>
                          ) : (
                            ""
                          )}
                          <a
                            onClick={this.addDiasDisponible}
                            className="btn btn-success float-right text-light"
                          >
                            {t("registerFormCuidadores.anadir")}{" "}
                            <FontAwesomeIcon icon={faPlusCircle} />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <label className="w-100 text-center">
                        {t("tablaCuidadores.pueblos")}:
                      </label>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="w-100 btn-success"
              onClick={() => this.handlePedirCuidado()}
            >
              {t("tablaCuidadores.acordar")}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tabla);
