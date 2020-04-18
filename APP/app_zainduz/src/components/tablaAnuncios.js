import React from "react";
import { connect } from "react-redux";
import { trans } from "../util/funciones";
import { changeFormContent } from "../redux/actions/app";
import axios from "axios";
import cogoToast from "cogo-toast";
import ipMaquina from "../util/ipMaquinaAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneAlt,
  faEye,
  faMobileAlt,
  faFileSignature,
  faHome,
  faUser,
  faSearch,
  faClock,
  faUsers,
  faEuroSign,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import "./styles/tablaAnuncios.css";
import ModalBody from "react-bootstrap/ModalBody";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import i18next from "i18next";
import BottomScrollListener from "react-bottom-scroll-listener";
import PuebloAutosuggest from "./pueblosAutosuggest";
import Button from "react-bootstrap/Button";

const mapStateToProps = (state) => {
  return {
    tipoUsuario: state.user.tipoUsuario,
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    email: state.user.email,
    contrasena: state.user.contrasena,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeFormContent: (form) => dispatch(changeFormContent(form)),
    toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload)),
  };
};

class TablaAnuncios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonAnuncios: [],
      buscado: false,
      selectedAnuncio: {},
      showModalAnuncio: false,
      showModalFilter: false,
      requiredCards: 100,
      hoverFilter: false,
      isFiltering: false,
      auxFilterPueblo: "",
    };

    this.renderHorarioModal = this.renderHorarioModal.bind(this);
    this.handleEnviarPropuesta = this.handleEnviarPropuesta.bind(this);
  }

  componentDidMount() {
    const { requiredCards } = this.state;
    axios
      .get(
        "http://" + ipMaquina + ":3001/api/procedures/getAnunciosConPerfil",
        {
          params: {
            options: {
              limit: requiredCards,
            },
          },
        }
      )
      .then((res) => {
        this.setState({
          jsonAnuncios: res.data,
          buscado: true,
        });
      })
      .catch((err) => {
        cogoToast.error(
          <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
        );
      });
  }

  onScreenBottom = () => {
    const { jsonAnuncios, requiredCards } = this.state;

    if (jsonAnuncios.length === requiredCards) {
      axios
        .get(
          "http://" + ipMaquina + ":3001/api/procedures/getAnunciosConPerfil",
          {
            params: {
              options: {
                limit: requiredCards + 100,
              },
            },
          }
        )
        .then((data) => {
          this.setState({
            jsonAnuncios: data.data,
            requiredCards: requiredCards + 100,
          });
        })
        .catch((err) => {
          cogoToast.error(
            <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
          );
        });
    }
  };

  renderHorarioModal() {
    const { selectedAnuncio } = this.state;
    let resultado = [];
    if (selectedAnuncio.horario.length === 0) {
      return (
        <span className="text-center font-weight-bold">
          {trans("tablaAnuncios.noDefinido")}
        </span>
      );
    }
    selectedAnuncio.horario.map((sesion) => {
      const auxDia = sesion.dia == 7 ? 0 : sesion.dia;
      resultado.push(
        <div className="list-group-item">
          <span className="list-group-item border-right font-weight-bold text-center">
            {i18next.t(`dias.dia_${auxDia}`)}
          </span>
          <span className="list-group-item text-center">
            {sesion.horaInicio + " - " + sesion.horaFin}
          </span>
        </div>
      );
    });
    return resultado;
  }

  handleEnviarPropuesta = async (anuncio) => {
    const {
      tipoUsuario,
      toogleMenuPerfil,
      idPerfil,
      idUsuario,
      email,
      contrasena,
    } = this.props;
    if (!tipoUsuario) {
      cogoToast.error(<h5>{trans("tablaCuidadores.errorNoLogueado")}</h5>);
      toogleMenuPerfil(true);
      return;
    }

    if (tipoUsuario != "Cuidador") {
      cogoToast.error(<h5>{trans("formAnuncio.cuidadorNecesario")}</h5>);
      return;
    }

    let comprobAcuerdoUnico = await axios.post(
      "http://" + ipMaquina + ":3001/api/procedures/checkIfAcuerdoExists",
      {
        idCliente: anuncio.idCliente,
        idCuidador: idPerfil,
        whoAmI: tipoUsuario,
        email,
        contrasena,
      }
    );
    if (comprobAcuerdoUnico.data != "Vacio") {
      cogoToast.error(<h5>{trans("tablaCuidadores.acuerdoExistente")}</h5>);
      return;
    }

    let formData = {
      idCuidador: idPerfil,
      idCliente: anuncio.idCliente,
      idUsuario: idUsuario,
      diasAcordados: anuncio.horario,
      tituloAcuerdo: anuncio.titulo,
      pueblo: anuncio.pueblo,
      descripcionAcuerdo: anuncio.descripcion,
      origenAcuerdo: "Cuidador",
      email,
      contrasena,
    };

    await axios
      .post(
        "http://" + ipMaquina + ":3001/api/procedures/postPropuestaAcuerdo",
        formData
      )
      .catch((err) => {
        cogoToast.error(
          <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
        );
        return;
      });
    cogoToast.success(<h5>{trans("tablaAnuncios.propuestaEnviada")}</h5>);
  };

  botonAddAnuncio = () => {
    const { tipoUsuario, changeFormContent } = this.props;

    if (tipoUsuario === "Cliente") {
      return (
        <div
          className="d-flex justify-content-center btn btn-success"
          onClick={() => changeFormContent("formAnuncio")}
        >
          {trans("tablaAnuncios.addAnuncio")}
        </div>
      );
    }

    return null;
  };

  handleHoverFilter = (isHover) => {
    this.setState({
      hoverFilter: isHover,
    });
  };

  handleFilterPuebloSelected = (c, { suggestion }) => {
    this.setState({
      auxFilterPueblo: suggestion,
    });
  };

  handleApplyFilters = () => {
    const { auxFilterPueblo, requiredCards } = this.state;

    let objFiltros = {};

    if (auxFilterPueblo !== "") {
      objFiltros.pueblo = auxFilterPueblo;
    }

    this.setState(
      {
        jsonAnuncios: [],
        buscado: false,
      },
      () => {
        axios
          .get(
            "http://" + ipMaquina + ":3001/api/procedures/getAnunciosConPerfil",
            {
              params: {
                options: {
                  limit: requiredCards,
                },
                filtros: objFiltros,
              },
            }
          )
          .then((res) => {
            this.setState({
              jsonAnuncios: res.data,
              buscado: true,
              showModalFilter: false,
              isFiltering: true,
            });
          })
          .catch((err) => {
            this.setState({
              buscado: true,
              showModalFilter: false,
            });
            cogoToast.error(
              <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
            );
          });
      }
    );
  };

  handleResetFilters = () => {
    const { requiredCards } = this.state;
    this.setState(
      {
        jsonAnuncios: {},
        buscado: false,
        auxFilterPueblo: "",
      },
      () => {
        axios
          .get(
            "http://" + ipMaquina + ":3001/api/procedures/getAnunciosConPerfil",
            {
              params: {
                options: {
                  limit: requiredCards,
                },
              },
            }
          )
          .then((res) => {
            this.setState({
              jsonAnuncios: res.data,
              buscado: true,
              showModalFilter: false,
              isFiltering: false,
            });
          })
          .catch((err) => {
            this.setState({
              buscado: true,
              showModalFilter: false,
            });
            cogoToast.error(
              <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
            );
          });
      }
    );
  };

  handleViewAnuncio = async (anuncio) => {
    this.setState({
      showModalAnuncio: true,
      selectedAnuncio: anuncio,
    });
  };

  render() {
    const {
      jsonAnuncios,
      showModalAnuncio,
      showModalFilter,
      selectedAnuncio,
      auxFilterPueblo,
      isFiltering,
      buscado,
    } = this.state;
    const traducDias = [
      "Astelehena",
      "Asteartea",
      "Asteazkena",
      "Osteguna",
      "Ostirala",
      "Larunbata",
      "Igandea",
    ];
    console.log(selectedAnuncio);
    return (
      <BottomScrollListener onBottom={this.onScreenBottom}>
        <div className="">
          {this.botonAddAnuncio()}
          <div
            onClick={() => {
              this.setState({ showModalFilter: true });
            }}
            style={{ cursor: "pointer" }}
            key="divFilter"
            className="d-flex align-items-center justify-content-start mb-3 mt-3 ml-5 mr-5 p-1"
            onMouseEnter={() => this.handleHoverFilter(true)}
            onMouseLeave={() => this.handleHoverFilter(false)}
          >
            <div
              style={{
                borderRadius: 50,
              }}
              className="bg-success text-white rounded-pill p-2"
            >
              <span className="pl-1" style={{ fontSize: 20 }}>
                {trans("tablaCuidadores.filtrar")}
              </span>
              <FontAwesomeIcon
                className="ml-2"
                key="iconFilter"
                size={"1x"}
                icon={faSearch}
              />
            </div>
          </div>
          <div className="d-flex flex-wrap justify-content-center">
            {buscado ? (
              jsonAnuncios.map((anuncio, indice) => {
                return (
                  <div className="card w-20 m-4" style={{ width: "18rem" }}>
                    <div
                      style={{
                        //backgroundImage:"url(http://" + ipMaquina + ":3001/api/image/" + cuidador.direcFotoContacto + ")",
                        height: "300px",
                        width: "calc(100% - 20px)",
                        backgroundSize: "cover",
                        backgroundPosition: "top",
                        backgroundRepeat: "no-repeat",
                        margin: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                      className="card-img-top"
                      alt="Imagen no disponible"
                    >
                      <img
                        style={{ maxHeight: "250px", height: "auto" }}
                        src={
                          "http://" +
                          ipMaquina +
                          ":3001/api/image/" +
                          anuncio.direcFoto
                        }
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title mt-2">{anuncio.titulo}</h5>
                      <p
                        className="card-text"
                        style={{ maxHeight: "75px", overflow: "hidden" }}
                      >
                        {anuncio.descripcion}
                      </p>
                    </div>
                    <div className="card-body card-footer">
                      <a
                        className="mr-0 w-100 btn btn-success text-light"
                        onClick={() => {
                          this.handleViewAnuncio(anuncio);
                        }}
                      >
                        {trans("tablaAnuncios.ver")}
                        <FontAwesomeIcon className="ml-1" icon={faEye} />
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-100 text-center">
                <img
                  style={{ marginTop: "300px" }}
                  src={"http://" + ipMaquina + ":3001/api/image/loadGif"}
                  height={100}
                  width={100}
                />
              </div>
            )}
          </div>
          {selectedAnuncio.idCliente !== undefined ? (
            <Modal
              className="modalAnuncio"
              show={showModalAnuncio}
              onHide={() => this.setState({ showModalAnuncio: false })}
            >
              <ModalHeader closeButton>
                <h5>Kontaktua</h5>
              </ModalHeader>
              <ModalBody className="d-flex flex-column justify-content-between align-items-center">
                <div className="">
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
                    className="flex-row align-items-center justify-content-center"
                    alt="Imagen no disponible"
                  >
                    <img
                      style={{
                        minHeight: "300px",
                        maxHeight: "300px",
                        height: "auto",
                      }}
                      src={
                        "http://" +
                        ipMaquina +
                        ":3001/api/image/" +
                        selectedAnuncio.direcFoto
                      }
                    />
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="d-flex flex-row align-items-center justify-content-between"
                  >
                    <FontAwesomeIcon className="mr-5" icon={faUsers} />
                    <span>
                      {trans(`tablaAnuncios.${selectedAnuncio.publico}`)}
                    </span>
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="d-flex flex-row align-items-center justify-content-between"
                  >
                    <FontAwesomeIcon className="mr-5" icon={faEuroSign} />
                    <span>{`${selectedAnuncio.precio}€/h`}</span>
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="mt-3 d-flex flex-column"
                  >
                    <div className="text-center">
                      <FontAwesomeIcon icon={faHome} className="mr-1" />
                      <span className="font-weight-bold text-center">
                        {trans("tablaCuidadores.pueblos")}
                      </span>
                    </div>
                    <span className="">
                      {typeof selectedAnuncio.pueblo != "undefined"
                        ? selectedAnuncio.pueblo.map((ubicacion, index) => {
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
                    className="mt-3 d-flex flex-column"
                  >
                    <div className="text-center">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      <span className="font-weight-bold text-center">
                        {trans("tablaAnuncios.horario")}
                      </span>
                    </div>
                    <span className="">
                      {typeof selectedAnuncio.horario != "undefined" &&
                      selectedAnuncio.horario.length > 0 ? (
                        selectedAnuncio.horario.map((dia) => {
                          return (
                            <div className="d-flex flex-row justify-content-between">
                              <span>{traducDias[dia.dia - 1]}</span>
                              <span>
                                {dia.horaInicio + " - " + dia.horaFin}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <em className="mt-1">
                          {trans("tablaCuidadores.sinDefinir")}
                        </em>
                      )}
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
                        className="mr-1"
                      />
                      <span className="font-weight-bold">
                        {trans("tablaAnuncios.descripcion")}
                      </span>
                    </div>
                    <span>{selectedAnuncio.descripcion}</span>
                  </div>
                  <div
                    style={{
                      width: 300,
                    }}
                    className="mt-3 d-flex flex-column"
                  >
                    <div className="d-flex flex-row align-items-center justify-content-center">
                      <FontAwesomeIcon icon={faIdCard} className="mr-1" />
                      <span className="font-weight-bold">
                        {trans("tablaAnuncios.contacto")}
                      </span>
                    </div>
                    <div
                      style={{
                        width: 300,
                      }}
                      className="d-flex flex-row align-items-center justify-content-between"
                    >
                      <FontAwesomeIcon className="mr-5" icon={faUser} />
                      <div>
                        <span>{selectedAnuncio.idCliente.nombre} </span>
                        <span>
                          {selectedAnuncio.idCliente.apellido1 +
                            " " +
                            selectedAnuncio.idCliente.apellido2}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 300,
                      }}
                      className="d-flex flex-row align-items-center justify-content-between"
                    >
                      <FontAwesomeIcon className="mr-5" icon={faMobileAlt} />
                      <div>
                        <span>{selectedAnuncio.idCliente.telefonoMovil} </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 300,
                      }}
                      className="d-flex flex-row align-items-center justify-content-between"
                    >
                      <FontAwesomeIcon className="mr-5" icon={faPhoneAlt} />
                      <div>
                        <span>
                          {selectedAnuncio.idCliente.telefonoFijo || (
                            <em>{trans("tablaAnuncios.noDefinido")}</em>
                          )}{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </Modal>
          ) : null}
          <Modal
            className="modalAnuncio"
            show={showModalFilter}
            onHide={() => this.setState({ showModalFilter: false })}
          >
            <ModalHeader closeButton>
              <h5>Filtrar</h5>
            </ModalHeader>
            <ModalBody className="d-flex flex-column justify-content-between align-items-stretch">
              <div className="d-flex flex-row align-items-center justify-content-center">
                <FontAwesomeIcon className="text-success mr-2" icon={faHome} />
                <PuebloAutosuggest
                  onSuggestionSelected={this.handleFilterPuebloSelected}
                />
                {auxFilterPueblo !== "" ? (
                  <span className="ml-2 font-weight-bold">
                    {auxFilterPueblo}
                  </span>
                ) : null}
              </div>
              <div className="d-flex flex-row justify-content-between">
                <Button
                  onClick={this.handleApplyFilters}
                  className="btn btn-success"
                >
                  Aplicar filtro
                </Button>
                <Button
                  onClick={this.handleResetFilters}
                  disabled={!isFiltering}
                  className="btn btn-danger"
                >
                  Restablecer filtros
                </Button>
              </div>
            </ModalBody>
          </Modal>
        </div>
      </BottomScrollListener>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TablaAnuncios);
