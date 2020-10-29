import React from "react";
import { connect } from "react-redux";
import { trans } from "../../util/funciones";
import { changeFormContent } from "../../redux/actions/app";
import axios from "../../util/axiosInstance";
import cogoToast from "cogo-toast";
import ipMaquina from "../../util/ipMaquinaAPI";
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
  faUpload,
  faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import "./tablaAnuncios.css";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import { toogleMenuPerfil } from "../../redux/actions/menuPerfil";
import i18next from "i18next";
import BottomScrollListener from "react-bottom-scroll-listener";
import PuebloAutosuggest from "../../components/pueblosAutosuggest";
import Button from "react-bootstrap/Button";
import ClipLoader from "react-spinners/ClipLoader";
import SocketContext from "../../socketio/socket-context";
import NoData from "../../components/noData";
import protocol from "../../util/protocol";

const mapStateToProps = (state) => {
  return {
    tipoUsuario: state.user.tipoUsuario,
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    email: state.user.email,
    contrasena: state.user.contrasena,
    latitud: state.coords.latitud,
    longitud: state.coords.longitud,
    maxDistance: state.coords.maxDistance,
    nowLang: state.app.nowLang
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
      propuestaIsLoading: false,
      requiredCards: 100,
      hoverFilter: false,
      isFiltering: false,
      auxFilterPueblo: "",
    };

    this.renderHorarioModal = this.renderHorarioModal.bind(this);
  }

  componentDidMount() {
    this.refrescarAnuncios();
  }

  componentDidUpdate(prevProps) {
    const { latitud, longitud, maxDistance } = this.props;
    const prevLatitud = prevProps.latitud;
    const prevLongitud = prevProps.longitud;

    if (latitud !== prevLatitud && longitud !== prevLongitud) {
      this.refrescarAnuncios();
    }

    if (maxDistance !== prevProps.maxDistance) {
      this.refrescarAnuncios();
    }
  }

  refrescarAnuncios = (isBottom) => {
    const { requiredCards } = this.state;
    const { latitud, longitud, maxDistance } = this.props;
    let coords = null;
    if (latitud !== 0 && longitud !== 0) {
      coords = {
        latitud,
        longitud,
      };
    }
    this.setState(
      {
        jsonAnuncios: {},
        buscado: false,
        auxFilterPueblo: "",
      },
      () => {
        axios
          .get(
            `${protocol}://${ipMaquina}:3001/api/procedures/getAnunciosConPerfil`,
            {
              params: {
                coords,
                maxDistance,
                options: {
                  limit: !isBottom ? requiredCards : requiredCards + 100,
                },
                filtros: {
                  show: true,
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
            cogoToast.error(
              <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
            );
          });
      }
    );
  };

  onScreenBottom = () => {
    const { jsonAnuncios, requiredCards } = this.state;

    if (jsonAnuncios.length === requiredCards) {
      this.refrescarAnuncios(true);
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

  handleEnviarPropuesta = async (anuncio, socket) => {
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
      this.setState(
        {
          showModalAnuncio: false,
        },
        () => toogleMenuPerfil(true)
      );
      return;
    }

    if (tipoUsuario != "Cuidador") {
      cogoToast.error(<h5>{trans("formAnuncio.cuidadorNecesario")}</h5>);
      this.setState({
        showModalAnuncio: false,
      });
      return;
    }

    let comprobAcuerdoUnico = await axios.post(
      `${protocol}://${ipMaquina}:3001/api/procedures/checkIfAcuerdoExists`,
      {
        idCliente: anuncio.idCliente._id,
        idCuidador: idPerfil,
        whoAmI: tipoUsuario,
        email,
        contrasena,
      }
    );
    if (comprobAcuerdoUnico.data != "Vacio") {
      cogoToast.error(<h5>{trans("tablaCuidadores.acuerdoExistente")}</h5>);
      this.setState({
        showModalAnuncio: false,
      });
      return;
    }

    const idUsuarioCliente = await axios.get(
      `${protocol}://${ipMaquina}:3001/api/procedures/getIdUsuarioConIdPerfil/${anuncio.idCliente._id}`
    );

    let formData = {
      idCuidador: idPerfil,
      idCliente: anuncio.idCliente._id,
      idUsuario: idUsuario,
      diasAcordados: anuncio.horario,
      tituloAcuerdo: anuncio.titulo,
      pueblo: anuncio.pueblo,
      descripcionAcuerdo: anuncio.descripcion,
      origenAcuerdo: "Cuidador",
      email,
      contrasena,
    };
    this.setState(
      {
        propuestaIsLoading: true,
      },
      () => {
        axios
          .post(
            `${protocol}://${ipMaquina}:3001/api/procedures/postPropuestaAcuerdo`,
            formData
          )
          .then(() => {
            this.setState({
              propuestaIsLoading: false,
            });
            cogoToast.success(
              <h5>{trans("tablaAnuncios.propuestaEnviada")}</h5>
            );
            socket.emit("notify", {
              idUsuario: idUsuarioCliente.data,
            });
          })
          .catch((err) => {
            cogoToast.error(
              <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
            );
            this.setState({
              propuestaIsLoading: false,
            });
            return;
          });
      }
    );
  };

  botonAddAnuncio = () => {
    const { tipoUsuario, changeFormContent } = this.props;

    if (tipoUsuario === "Cliente") {
      return (
        <div
          style={{
            borderRadius: 50,
          }}
          className="d-flex flex-row align-items-center justify-content-center btn btn-success"
          onClick={() => changeFormContent("formAnuncio")}
        >
          <span className="d-sm-inline d-none" style={{ fontSize: 20 }}>
            {trans("tablaAnuncios.addAnuncio")}
          </span>
          <FontAwesomeIcon icon={faUpload} className="ml-sm-2 ml-0" />
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
            `${protocol}://${ipMaquina}:3001/api/procedures/getAnunciosConPerfil`,
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
    this.refrescarAnuncios();
  };

  handleViewAnuncio = async (anuncio) => {
    const { idPerfil, email, contrasena } = this.props;

    if (anuncio.idCliente._id !== idPerfil) {
      // Significa que el anuncio no es mio, por lo tanto registro la visita
      const formData = {
        email,
        contrasena,
      };
      axios.post(
        `${protocol}://${ipMaquina}:3001/api/procedures/registerAnuncioVisita/${anuncio._id}`,
        formData
      );
    }

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
      propuestaIsLoading,
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

    return (
      <BottomScrollListener onBottom={this.onScreenBottom}>
        <SocketContext.Consumer>
          {(socket) => (
            <div className="">
              <div
                key="divFilter"
                className="d-flex align-items-center justify-content-between mb-3 mt-3 ml-5 mr-5 p-1"
                onMouseEnter={() => this.handleHoverFilter(true)}
                onMouseLeave={() => this.handleHoverFilter(false)}
              >
                <div
                  style={{
                    borderRadius: 50,
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    this.setState({ showModalFilter: true });
                  }}
                  className="d-flex flex-row justify-content-between align-items-center bg-success text-white p-2"
                >
                  <span className="d-sm-inline d-none" style={{ fontSize: 20 }}>
                    {trans("tablaCuidadores.filtrar")}
                  </span>
                  <FontAwesomeIcon
                    className="ml-sm-2 ml-0"
                    key="iconFilter"
                    size={"1x"}
                    icon={faSearch}
                  />
                </div>
                {this.botonAddAnuncio()}
              </div>
              <div className="d-flex flex-wrap justify-content-center">
                {buscado ? (
                  jsonAnuncios.length > 0 ? (
                    jsonAnuncios.map((anuncio, indice) => {
                      return (
                        <div
                          onClick={() => { this.handleViewAnuncio(anuncio.anuncio); }}
                          className="card w-20 m-4 cardHoverAnimation"
                        >
                        {anuncio.distancia !== undefined && anuncio.distancia !== false ? 
                          <div
                            className="card-header d-flex flex-row align-items-center justify-content-center"
                          >
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                            <span>{i18next.t('tablaCuidadores.distancia', {
                              distancia: anuncio.distancia
                            })}
                            </span>
                          </div>
                          : 
                          null
                        }
                          <div
                            style={{
                              //backgroundImage:"url(https://" + ipMaquina + ":3001/api/image/" + cuidador.direcFotoContacto + ")",
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
                              alt="Foto de contacto del anuncio"
                              style={{ maxHeight: "250px", height: "auto" }}
                              src={`${protocol}://${ipMaquina}:3001/api/image/${anuncio.anuncio.direcFoto}`}
                            />
                          </div>
                          <div className="card-body">
                            <h5 style={{ height: '50px', overflow: "hidden" }} className="card-title mt-2">
                              {anuncio.anuncio.titulo}
                            </h5>
                            <p
                              className="card-text"
                              style={{ height: "75px", overflow: "hidden", whiteSpace: 'pre-line' }}
                            >
                              {anuncio.anuncio.descripcion}
                            </p>
                          </div>
                          <div className="card-body card-footer">
                            <a
                              className="mr-0 w-100 btn btn-success text-light"
                              onClick={() => {
                                this.handleViewAnuncio(anuncio.anuncio);
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
                    <div
                      style={{
                        height: "70vh",
                      }}
                      className="d-flex align-items-center"
                    >
                      <NoData />
                    </div>
                  )
                ) : (
                  <div
                    style={{
                      height: "70vh",
                    }}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <ClipLoader color="#28a745" />
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
                    <h5>{trans("tablaAnuncios.tituloAnuncio")}</h5>
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
                          alt="Foto de contacto del anuncio"
                          style={{
                            minHeight: "300px",
                            maxHeight: "300px",
                            height: "auto",
                          }}
                          src={`${protocol}://${ipMaquina}:3001/api/image/${selectedAnuncio.direcFoto}`}
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
                            {trans("tablaAnuncios.titulo")}
                          </span>
                        </div>
                        <span>{selectedAnuncio.titulo}</span>
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
                          <FontAwesomeIcon
                            className="mr-5"
                            icon={faMobileAlt}
                          />
                          <div>
                            <span>
                              {selectedAnuncio.idCliente.telefonoMovil}{" "}
                            </span>
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
                  <ModalFooter className="d-flex flex-column">
                    {!propuestaIsLoading ? (
                      <Button
                        className="w-100 btn-success"
                        onClick={() => {
                          this.handleEnviarPropuesta(selectedAnuncio, socket);
                        }}
                      >
                        {trans("tablaAnuncios.ofrecerCuidado")}
                      </Button>
                    ) : (
                      <div className="d-flex flex-row justify-content-center">
                        <ClipLoader color="#28a745" />
                      </div>
                    )}
                  </ModalFooter>
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
                  <div className="d-flex flex-row align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                      className="text-success mr-2"
                      icon={faHome}
                      />
                      <PuebloAutosuggest
                        onSuggestionSelected={this.handleFilterPuebloSelected}
                      />
                    </div>
                    
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
          )}
        </SocketContext.Consumer>
      </BottomScrollListener>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TablaAnuncios);
