import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheck,
  faTimes,
  faSearch,
  faPlusCircle,
  faMinusCircle,
  faMobileAlt,
  faHome,
  faUser,
  faAt,
  faCalendarAlt,
  faVenusMars,
  faPhoneSquareAlt,
  faPenSquare,
  faClock,
  faEuroSign,
  faComments,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import Modal from "react-bootstrap/Modal";
import Collapse from "react-bootstrap/Collapse";
import AutoSuggest from "react-autosuggest";
import PuebloAutosuggest from "./pueblosAutosuggest";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import Button from "react-bootstrap/Button";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import "./styles/tablaCuidadores.css";
import TimeInput from "./customTimeInput";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { connect } from "react-redux";
import { trans, getTodayDate } from "../util/funciones";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import municipios from "../util/municipos";
import SocketContext from "../socketio/socket-context";
import BottomScrollListener from "react-bottom-scroll-listener";
import ClipLoader from "react-spinners/ClipLoader";
import i18next from "i18next";

const mapStateToProps = (state) => {
  return {
    tipoUsuario: state.user.tipoUsuario,
    idCliente: state.user._id,
    idUsuario: state.user._idUsuario,
    email: state.user.email,
    contrasena: state.user.contrasena,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload)),
  };
};

let gSocket = null;

class Tabla extends React.Component {
  componentDidMount() {
    const { requiredCards } = this.state;
    Axios.get("http://" + ipMaquina + ":3001/api/cuidador", {
      params: {
        filtros: {
          isPublic: true,
        },
        options: {
          limit: requiredCards,
        },
      },
    })
      .then((data) => {
        this.setState({
          jsonCuidadores: data.data,
          buscado: true,
        });
      })
      .catch((err) => {
        this.setState({
          buscado: true,
        });
        cogoToast.error(
          <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
        );
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      requiredCards: 100,
      propuestaIsLoading: false,
      buscado: false,
      jsonCuidadores: {},
      showModal: false,
      showPropuestaModal: false,
      showModalFilter: false,
      selectedCuidador: {},
      suggestionsPueblos: [],
      auxAddPueblo: "",
      ubicaciones: [],
      error: {
        txtNombre: false,
      },
      txtTituloPropuesta: "",
      diasDisponible: [
        {
          dia: 0,
          horaInicio: "00:00",
          horaFin: "00:00",
        },
      ],
      txtDescripcion: "",
      auxFilterPueblo: "",
      isFiltering: false,
    };

    this.requiredStates = [
      "txtTituloPropuesta",
      "diasDisponible",
      "ubicaciones",
      "txtDescripcion",
    ];
    this.requiredStatesTraduc = {
      txtTituloPropuesta: "tablaCuidadores.tituloPropuesta",
      diasDisponible: "tablaCuidadores.diasDisponible",
      ubicaciones: "tablaCuidadores.ubicaciones",
      txtDescripcion: "tablaCuidadores.descripcion",
    };

    this.handleShowModalChange = this.handleShowModalChange.bind(this);
    this.handleShowPropuestaModalChange = this.handleShowPropuestaModalChange.bind(
      this
    );
    this.handleEnviarPropuesta = this.handleEnviarPropuesta.bind(this);
    this.handlePedirCuidado = this.handlePedirCuidado.bind(this);
    this.handleDiasDisponibleChange = this.handleDiasDisponibleChange.bind(
      this
    );
    this.addDiasDisponible = this.addDiasDisponible.bind(this);
    this.removeDiasDisponible = this.removeDiasDisponible.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(
      this
    );
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(
      this
    );
    this.handleAddPueblo = this.handleAddPueblo.bind(this);
    this.handleAuxAddPuebloChange = this.handleAuxAddPuebloChange.bind(this);
    this.handleRemovePueblo = this.handleRemovePueblo.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  onScreenBottom = () => {
    const { jsonCuidadores, requiredCards } = this.state;

    if (jsonCuidadores.length === requiredCards) {
      Axios.get("http://" + ipMaquina + ":3001/api/cuidador", {
        params: {
          filtros: {
            isPublic: true,
          },
          options: {
            limit: requiredCards + 100,
          },
        },
      })
        .then((data) => {
          this.setState({
            jsonCuidadores: data.data,
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

  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  getSuggestions(value) {
    const escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue === "") {
      return [];
    }

    const regex = new RegExp("^" + escapedValue, "i");

    return municipios.filter((pueblo) => regex.test(pueblo));
  }

  getSuggestionValue(suggestion) {
    return suggestion;
  }

  renderSuggestion(suggestion) {
    return <span>{suggestion}</span>;
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestionsPueblos: this.getSuggestions(value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestionsPueblos: [],
    });
  };

  handleAddPueblo(c, { suggestion }) {
    this.setState({}, () => {
      let pueblo = suggestion;
      if (pueblo == "") return;

      if (!municipios.includes(pueblo)) {
        cogoToast.error(
          <h5>
            {pueblo} {trans("registerFormCuidadores.errorPuebloNoExiste")}
          </h5>
        );
        return;
      }

      for (var clave in this.state.ubicaciones) {
        if (this.state.ubicaciones[clave] == pueblo) {
          cogoToast.error(
            <h5>
              {pueblo} {trans("registerFormCuidadores.errorPuebloRepetido")}
            </h5>
          );
          return;
        }
      }
      this.state.ubicaciones.push(pueblo);
      this.setState({
        ubicaciones: this.state.ubicaciones,
        auxAddPueblo: "",
      });
    });
  }

  handleFilterPuebloSelected = (c, { suggestion }) => {
    this.setState({
      auxFilterPueblo: suggestion,
    });
  };

  handleRemovePueblo(pueblo) {
    const { ubicaciones } = this.state;
    const ubicacionesFiltrado = ubicaciones.filter((p) => p !== pueblo);
    this.setState({
      ubicaciones: ubicacionesFiltrado,
    });
  }

  addDiasDisponible() {
    let auxDiasDisponible = this.state.diasDisponible;
    auxDiasDisponible.push({
      dia: 0,
      horaInicio: "00:00",
      horaFin: "00:00",
    });

    this.setState({
      diasDisponible: auxDiasDisponible,
    });
  }

  handleHoverFilter = (isHover) => {
    this.setState({
      hoverFilter: isHover,
    });
  };

  handleDiasDisponibleChange(e, indice) {
    if (typeof indice == "undefined") {
      //Significa que lo que se ha cambiado es el combo de los dias
      var origen = e.target;
      var indice = parseInt(origen.id.substr(origen.id.length - 1));
      var valor = origen.value;

      let auxDiasDisponible = this.state.diasDisponible;
      auxDiasDisponible[indice]["dia"] = valor;

      this.setState({
        diasDisponible: auxDiasDisponible,
      });
    } else {
      //Significa que ha cambiado la hora, no se sabe si inicio o fin, eso esta en "indice"
      let atributo = indice.substr(0, indice.length - 1);
      indice = indice.substr(indice.length - 1);

      let auxDiasDisponible = [...this.state.diasDisponible];
      auxDiasDisponible[indice][atributo] = e;

      this.setState({
        diasDisponible: auxDiasDisponible,
      });
    }
  }

  removeDiasDisponible() {
    this.setState({
      diasDisponible:
        typeof this.state.diasDisponible.pop() != "undefined"
          ? this.state.diasDisponible
          : [],
    });
  }

  handleInputChange(e) {
    var stateId = e.target.id;
    this.setState({
      [stateId]: e.target.value,
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
          horaFin: "00:00",
        },
      ],
      ubicaciones: [],
      txtTituloPropuesta: "",
      txtDescripcion: "",
    });
  }

  handleShowPropuestaModalChange(state) {
    this.setState({
      showPropuestaModal: state,
    });
  }

  handleViewCuidador(cuidador) {
    let idPerfil = cuidador._id;
    const objFiltros = {
      idPerfil: idPerfil,
    };
    Axios.get(
      `http://${ipMaquina}:3001/api/procedures/getEmailWithIdPerfil/${idPerfil}`
    )
      .then((email) => {
        const response = email.data;
        this.setState({
          showModal: true,
          selectedCuidador: Object.assign({}, cuidador, {
            email: response !== "Vacio" ? response : "ERROR",
          }),
        });
      })
      .catch((err) => {
        cogoToast.error(<h5>{trans("registerFormClientes.errorGeneral")}</h5>);
      });
  }

  async handlePedirCuidado() {
    const { email, contrasena, tipoUsuario, idCliente } = this.props;
    const { selectedCuidador } = this.state;

    if (!this.props.tipoUsuario) {
      cogoToast.error(<h5>{trans("tablaCuidadores.errorNoLogueado")}</h5>);
      this.handleShowModalChange(false);
      this.props.toogleMenuPerfil(true);
      this.setState({
        propuestaIsLoading: false,
      });
      return;
    } else if (this.props.tipoUsuario != "Cliente") {
      cogoToast.error(
        <h5>{trans("tablaCuidadores.errorClienteObligatorio")}</h5>
      );
      this.handleShowModalChange(false);
      this.setState({
        propuestaIsLoading: false,
      });
      return;
    }

    let comprobAcuerdoUnico = await Axios.post(
      "http://" + ipMaquina + ":3001/api/procedures/checkIfAcuerdoExists",
      {
        idCliente,
        idCuidador: selectedCuidador._id,
        whoAmI: tipoUsuario,
        email,
        contrasena,
      }
    );
    if (comprobAcuerdoUnico.data != "Vacio") {
      cogoToast.error(<h5>{trans("tablaCuidadores.acuerdoExistente")}</h5>);
      this.setState({
        propuestaIsLoading: false,
      });
      return;
    }

    if (!this.state.showPropuestaModal) {
      this.setState({
        showPropuestaModal: true,
        diasDisponible: JSON.parse(
          JSON.stringify(selectedCuidador.diasDisponible)
        ),
        ubicaciones: JSON.parse(JSON.stringify(selectedCuidador.ubicaciones)),
        propuestaIsLoading: false,
      });
      return;
    }

    //Comprobacion de errores
    for (var clave in this.state) {
      if (
        (this.state[clave].length == 0 || !this.state[clave]) &&
        this.requiredStates.includes(clave)
      ) {
        cogoToast.error(
          <h5>
            {trans("registerFormCuidadores.errorRellenaTodo")} (
            {trans(this.requiredStatesTraduc[clave])})
          </h5>
        );
        let auxError = this.state.error;
        auxError[clave] = true;
        this.setState({
          error: auxError,
          propuestaIsLoading: false,
        });
        return;
      }
      //Hago una comporbacion diferente para los dias, para que haya elegido un dia en el combo
      if (clave == "diasDisponible") {
        let error = false;
        this.state[clave].map((confDia) => {
          if (confDia.dia == 0 || isNaN(confDia.dia)) {
            cogoToast.error(
              <h5>{trans("registerFormCuidadores.errorDiaNoElegido")}</h5>
            );
            error = true;
            return;
          }
        });
        if (error) {
          this.setState({
            propuestaIsLoading: false,
          });
          return;
        }
      }
    }

    this.handleEnviarPropuesta();
  }

  handleAuxAddPuebloChange(e, { newValue }) {
    this.setState({
      auxAddPueblo: newValue,
    });
  }

  async handleEnviarPropuesta() {
    const { email, tipoUsuario, contrasena } = this.props;

    this.setState({
      propuestaIsLoading: true,
    });

    var today = getTodayDate();
    const objToday = new Date();

    //Aqui me monto el acuerdo para subirlo
    //Estado acuerdo no lo tengo definido todavia pero seria algo como:
    //0 -> Pendiente
    //1 -> Aceptado
    //2 -> Finzalizado o Cancelado
    let formData = {
      idCuidador: this.state.selectedCuidador._id,
      idCliente: this.props.idCliente,
      diasAcordados: this.state.diasDisponible,
      tituloAcuerdo: this.state.txtTituloPropuesta,
      pueblo: this.state.ubicaciones,
      descripcionAcuerdo: this.state.txtDescripcion,
      origenAcuerdo: this.props.tipoUsuario,
      whoAmI: tipoUsuario,
      email,
      contrasena,
    };

    Axios.post(
      "http://" + ipMaquina + ":3001/api/procedures/newAcuerdo",
      formData
    )
      .then((resultado) => {
        Axios.get(
          "http://" +
            ipMaquina +
            ":3001/api/procedures/getIdUsuarioConIdPerfil/" +
            this.state.selectedCuidador._id
        ).then((usuario) => {
          let notificacionData = {
            idUsuario: usuario.data,
            idRemitente: this.props.idUsuario,
            tipoNotificacion: "Acuerdo",
            acuerdo: resultado.data,
            email,
            contrasena,
          };
          Axios.post(
            "http://" + ipMaquina + ":3001/api/procedures/newNotification",
            notificacionData
          ).then((notif) => {
            this.setState({
              showModal: false,
              showPropuestaModal: false,
              diasDisponible: [
                {
                  dia: 0,
                  horaInicio: "00:00",
                  horaFin: "00:00",
                },
              ],
              ubicaciones: [],
              txtTituloPropuesta: "",
              txtDescripcion: "",
            });

            gSocket.emit("notify", {
              idUsuario: usuario.data,
            });

            cogoToast.success(
              <h5>{trans("tablaCuidadores.exitoEnviarPropuesta")}</h5>
            );

            this.setState({
              propuestaIsLoading: false,
            });
          });
        });
      })
      .catch((err) => {
        cogoToast.error(<h5>{trans("tablaCuidadores.errorGeneral")}</h5>);
        this.setState({
          propuestaIsLoading: false,
        });
      });
  }

  handleApplyFilters = () => {
    const { auxFilterPueblo, requiredCards } = this.state;

    let objFiltros = {
      isPublic: true,
    };

    if (auxFilterPueblo !== "") {
      objFiltros.ubicaciones = auxFilterPueblo;
    }

    this.setState(
      {
        jsonCuidadores: {},
        buscado: false,
      },
      () => {
        Axios.get("http://" + ipMaquina + ":3001/api/cuidador", {
          params: {
            filtros: objFiltros,
            options: {
              limit: requiredCards,
            },
          },
        })
          .then((data) => {
            this.setState({
              jsonCuidadores: data.data,
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
        jsonCuidadores: {},
        buscado: false,
        auxFilterPueblo: "",
      },
      () => {
        Axios.get("http://" + ipMaquina + ":3001/api/cuidador", {
          params: {
            filtros: {
              isPublic: true,
            },
            options: {
              limit: requiredCards,
            },
          },
        })
          .then((data) => {
            this.setState({
              jsonCuidadores: data.data,
              buscado: true,
              isFiltering: false,
              showModalFilter: false,
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

  render() {
    const {
      showModalFilter,
      auxFilterPueblo,
      isFiltering,
      diasDisponible,
      showPropuestaModal,
      propuestaIsLoading,
    } = this.state;
    const vSelectedCuidador = this.state.selectedCuidador;
    const fechaNacCuidador = new Date(vSelectedCuidador.fechaNacimiento);
    const telefonoFijoCuidador = vSelectedCuidador.telefonoFijo !== "" ? vSelectedCuidador.telefonoFijo : <em>Definitu gabe</em>;
    const telefonoMovilCuidador = vSelectedCuidador.telefonoMovil !== "" ? vSelectedCuidador.telefonoMovil : <em>Definitu gabe</em>;
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
        <div
          key="divFilter"
          className="d-flex align-items-center justify-content-between mb-3 mt-3 ml-5 mr-5 p-1"
        >
          <div
            style={{
              cursor: "pointer",
            }}
          >
            <div
              style={{
                borderRadius: 50,
              }}
              onClick={() => {
                this.setState({ showModalFilter: true });
              }}
              className="d-flex flex-row justify-content-center align-items-center bg-success text-white p-2"
              onMouseEnter={() => this.handleHoverFilter(true)}
              onMouseLeave={() => this.handleHoverFilter(false)}
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
          </div>
        </div>
        <SocketContext.Consumer>
          {(socket) => {
            gSocket = socket;
            return (
              <div className="d-flex flex-wrap justify-content-center">
                {typeof this.state.jsonCuidadores.map != "undefined" &&
                this.state.buscado ? (
                  this.state.jsonCuidadores.map((cuidador, indice) => {
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
                              {trans("tablaCuidadores.ninos")}
                            </div>
                            <div className="col text-center">
                              {trans("tablaCuidadores.terceraEdad")}
                            </div>
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {trans("tablaCuidadores.necesidadEspecial")}
                                </Tooltip>
                              }
                            >
                              <div className="col text-center">
                                {trans(
                                  "tablaCuidadores.necesidadEspecialAcortado"
                                )}
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
                            {trans("tablaCuidadores.ver")}
                            <FontAwesomeIcon className="ml-1" icon={faEye} />
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : typeof this.state.jsonCuidadores.map == "undefined" &&
                  !this.state.buscado ? (
                  <div
                    style={{
                      height: "70vh"
                    }}
                    className="d-flex align-items-center justify-content-center">
                      <ClipLoader color="#28a745" />
                  </div>
                ) : (
                  <small
                  style={{
                    height: "70vh"
                  }}
                  className="d-flex align-items-center justify-content-center text-danger"
                  >
                    {trans("tablaCuidadores.noData")}
                  </small>
                )}

                <Modal
                  className="modalCustomClass"
                  show={this.state.showModal}
                  onHide={() => this.handleShowModalChange(false)}
                >
                  <ModalHeader closeLabel="Itxi" closeButton>
                    <h5>{trans('tablaCuidadores.cuidador')}</h5>
                  </ModalHeader>
                  <ModalBody className="d-flex flex-column justify-content-between align-items-center">
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
                          vSelectedCuidador.direcFotoContacto
                        }
                      />
                    </div>
                    <div
                      style={{
                        width: 300,
                      }}
                      className="d-flex flex-row align-items-center justify-content-between"
                    >
                      <FontAwesomeIcon className="mr-5" icon={faUser} />
                      <div>
                        <span>{vSelectedCuidador.nombre} </span>
                        <span>
                          {vSelectedCuidador.apellido1 +
                            " " +
                            vSelectedCuidador.apellido2}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 300,
                      }}
                      className="d-flex flex-row align-items-center justify-content-between"
                    >
                      <FontAwesomeIcon className="mr-5" icon={faCalendarAlt} />
                      <span>
                        {fechaNacCuidador.getFullYear() +
                          "/" +
                          (fechaNacCuidador.getMonth() + 1) +
                          "/" +
                          fechaNacCuidador.getDate()}
                      </span>
                    </div>
                    <div
                      style={{
                        width: 300,
                      }}
                      className="d-flex flex-row align-items-center justify-content-between"
                    >
                      <FontAwesomeIcon className="mr-5" icon={faVenusMars} />
                      <div>
                        <span>
                          {vSelectedCuidador.sexo == "M"
                            ? "Gizonezkoa"
                            : "Emakumezkoa"}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 300,
                      }}
                      className="d-flex flex-row align-items-center justify-content-between"
                    >
                      <FontAwesomeIcon className="mr-5" icon={faAt} />
                      <div>
                        <span>{vSelectedCuidador.email}</span>
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
                        <span>{telefonoMovilCuidador}</span>
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
                        icon={faPhoneSquareAlt}
                      />
                      <div>
                        <span>{telefonoFijoCuidador}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 300,
                      }}
                      className="mt-3 d-flex flex-column align-items-center"
                    >
                      <div>
                        <FontAwesomeIcon
                          icon={faPenSquare}
                          flip="horizontal"
                          className="mr-1"
                        />
                        <span className="font-weight-bold">
                          {trans("tablaCuidadores.descripcion")}
                        </span>
                      </div>

                      <span className="">{vSelectedCuidador.descripcion}</span>
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
                        {typeof vSelectedCuidador.ubicaciones != "undefined"
                          ? vSelectedCuidador.ubicaciones.map(
                              (ubicacion, index) => {
                                return (
                                  <div>
                                    <span>{ubicacion}</span>
                                    <br />
                                  </div>
                                );
                              }
                            )
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
                          {trans("tablaCuidadores.horasLibres")}
                        </span>
                      </div>
                      <span className="">
                        {typeof vSelectedCuidador.diasDisponible !=
                          "undefined" &&
                        vSelectedCuidador.diasDisponible.length > 0 ? (
                          vSelectedCuidador.diasDisponible.map((dia) => {
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
                      <div className="text-center">
                        <FontAwesomeIcon icon={faEuroSign} className="mr-1" />
                        <span className="font-weight-bold text-center">
                          {trans("tablaCuidadores.precios")}
                        </span>
                      </div>
                      <div className="">
                        <div className="d-flex flex-row justify-content-between">
                          <span>{trans("tablaCuidadores.ninos")}</span>

                          <span>
                            {typeof vSelectedCuidador.precioPorPublico !=
                            "undefined" ? (
                              vSelectedCuidador.precioPorPublico.nino != "" ? (
                                vSelectedCuidador.precioPorPublico.nino +
                                "€ /orduko"
                              ) : (
                                <em>Definitu gabe</em>
                              )
                            ) : null}
                          </span>
                        </div>
                        <div className="d-flex flex-row justify-content-between">
                          <span>{trans("tablaCuidadores.terceraEdad")}</span>

                          <span>
                            {typeof vSelectedCuidador.precioPorPublico !=
                            "undefined" ? (
                              vSelectedCuidador.precioPorPublico.terceraEdad !=
                              "" ? (
                                vSelectedCuidador.precioPorPublico.terceraEdad +
                                "€ /orduko"
                              ) : (
                                <em>Definitu gabe</em>
                              )
                            ) : null}
                          </span>
                        </div>
                        <div className="d-flex flex-row justify-content-between">
                          <span>
                            {trans("tablaCuidadores.necesidadEspecial")}
                          </span>

                          <span>
                            {typeof vSelectedCuidador.precioPorPublico !=
                            "undefined" ? (
                              vSelectedCuidador.precioPorPublico
                                .necesidadEspecial != "" ? (
                                vSelectedCuidador.precioPorPublico
                                  .necesidadEspecial + "€ /orduko"
                              ) : (
                                <em>Definitu gabe</em>
                              )
                            ) : null}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {showPropuestaModal ? (
                        <Collapse className="mt-5">
                          <div className="d-flex flex-column justify-content-between align-items-center">
                            <div className="d-flex flex-row align-items-center justify-content-center">
                              <FontAwesomeIcon
                                size="2x"
                                icon={faComments}
                                className="mr-2"
                              />
                              <span
                                className="font-weight-bold"
                                style={{
                                  fontSize: 20,
                                }}
                              >
                                {trans("tablaCuidadores.tuPropuesta")}
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
                                  {trans("tablaCuidadores.tituloPropuesta")}
                                </span>
                              </div>
                              <input
                                onChange={this.handleInputChange}
                                type="text"
                                className="mt-1"
                                id="txtTituloPropuesta"
                                aria-describedby="txtNombreHelp"
                                placeholder={`${i18next.t('tablaCuidadores.tituloPropuesta')}...`}
                                value={this.state.txtTituloPropuesta}
                              />
                            </div>
                            <div
                              style={{
                                width: 300,
                              }}
                              className="mt-3 d-flex flex-column"
                            >
                              <div className="d-flex flex-row align-items-center justify-content-between">
                                <FontAwesomeIcon
                                  style={{ cursor: "pointer" }}
                                  onClick={this.removeDiasDisponible}
                                  className="text-danger"
                                  icon={faMinusCircle}
                                />
                                <div>
                                  <FontAwesomeIcon
                                    icon={faClock}
                                    className="mr-1"
                                  />
                                  <span className="font-weight-bold">
                                    {trans("tablaCuidadores.horasPropuesta")}
                                  </span>
                                </div>
                                <FontAwesomeIcon
                                  style={{ cursor: "pointer" }}
                                  onClick={this.addDiasDisponible}
                                  className="text-success"
                                  icon={faPlusCircle}
                                />
                              </div>
                              {diasDisponible.map((dia, indice) => (
                                <div className="mt-1 d-flex flex-row align-items-center justify-content-between">
                                  <select
                                    value={dia.dia}
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
                                  <div className="d-flex flex-row align-items-center">
                                    <TimeInput
                                      onTimeChange={(valor) => {
                                        this.handleDiasDisponibleChange(
                                          valor,
                                          "horaInicio" + indice
                                        );
                                      }}
                                      id={"horaInicio" + indice}
                                      initTime={
                                        diasDisponible[indice].horaInicio
                                      }
                                      style={{
                                        width: 50,
                                      }}
                                      className="text-center"
                                    />
                                    -
                                    <TimeInput
                                      onTimeChange={(valor) => {
                                        this.handleDiasDisponibleChange(
                                          valor,
                                          "horaFin" + indice
                                        );
                                      }}
                                      id={"horaFin" + indice}
                                      initTime={diasDisponible[indice].horaFin}
                                      style={{
                                        width: 50,
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div
                              style={{
                                width: 300,
                              }}
                              className="mt-3 d-flex flex-column"
                            >
                              <div className="text-center mb-1">
                                <FontAwesomeIcon
                                  icon={faHome}
                                  className="mr-1"
                                />
                                <span className="font-weight-bold text-center">
                                  {trans("tablaCuidadores.pueblos")}
                                </span>
                              </div>
                              <PuebloAutosuggest
                                onSuggestionSelected={this.handleAddPueblo}
                              />
                              {this.state.ubicaciones.map((pueblo) => {
                                return (
                                  <div className="mt-1 d-flex flex-row justify-content-between">
                                    <span>{pueblo}</span>
                                    <FontAwesomeIcon
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        this.handleRemovePueblo(pueblo)
                                      }
                                      className="text-danger"
                                      icon={faMinusCircle}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            <div
                              style={{
                                width: 300,
                              }}
                              className="mt-3 d-flex flex-column"
                            >
                              <div className="d-flex flex-row justify-content-center align-items-center">
                                <FontAwesomeIcon
                                  icon={faPenSquare}
                                  flip="horizontal"
                                  className="mr-1"
                                />
                                <span className="font-weight-bold">
                                  {trans("tablaCuidadores.descripcion")}
                                </span>
                              </div>
                              <textarea
                                onChange={this.handleInputChange}
                                className={
                                  this.state.error.txtNombre
                                    ? "border border-danger form-control mt-1"
                                    : "form-control mt-1"
                                }
                                rows="5"
                                id="txtDescripcion"
                                placeholder={`${i18next.t('tablaCuidadores.descripcionPropuesta')}...`}
                                value={this.state.txtDescripcion}
                              ></textarea>
                            </div>
                          </div>
                        </Collapse>
                      ) : null}
                    </div>
                  </ModalBody>
                  <ModalFooter className="d-flex flex-column">
                    {!propuestaIsLoading ? (
                      <Button
                        className="w-100 btn-success"
                        onClick={() => {
                          this.setState(
                            {
                              propuestaIsLoading: true,
                            },
                            () => {
                              this.handlePedirCuidado();
                            }
                          );
                        }}
                      >
                        {this.state.showPropuestaModal
                          ? trans("tablaCuidadores.enviarAcuerdo")
                          : trans("tablaCuidadores.acordar")}
                      </Button>
                    ) : (
                      <div className="d-flex flex-row justify-content-center">
                        <ClipLoader color="#28a745" />
                      </div>
                    )}
                  </ModalFooter>
                </Modal>
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
                      <FontAwesomeIcon
                        className="text-success mr-2"
                        icon={faHome}
                      />
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
            );
          }}
        </SocketContext.Consumer>
      </BottomScrollListener>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tabla);
