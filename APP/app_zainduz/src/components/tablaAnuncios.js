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
  faCalendar,
  faMobileAlt,
  faHome,
  faUser,
  faSearch
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

const mapStateToProps = state => {
  return {
    tipoUsuario: state.user.tipoUsuario,
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    email: state.user.email,
    contrasena: state.user.contrasena
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeFormContent: form => dispatch(changeFormContent(form)),
    toogleMenuPerfil: payload => dispatch(toogleMenuPerfil(payload))
  };
};

class TablaAnuncios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonAnuncios: [],
      buscado: false,
      selectedAnuncio: null,
      showModalTelefono: false,
      showModalCalendar: false,
      showModalFilter: false,
      requiredCards: 100,
      hoverFilter: false,
      isFiltering: false,
      auxFilterPueblo: ""
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
              limit: requiredCards
            }
          }
        }
      )
      .then(res => {
        this.setState({
          jsonAnuncios: res.data,
          buscado: true
        });
      })
      .catch(err => {
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
                limit: requiredCards + 100
              }
            }
          }
        )
        .then(data => {
          this.setState({
            jsonAnuncios: data.data,
            requiredCards: requiredCards + 100
          });
        })
        .catch(err => {
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
    selectedAnuncio.horario.map(sesion => {
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

  handleEnviarPropuesta = async anuncio => {
    const { tipoUsuario, toogleMenuPerfil, idPerfil, idUsuario, email, contrasena } = this.props;
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
        contrasena
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
      contrasena
    };

    await axios
      .post(
        "http://" + ipMaquina + ":3001/api/procedures/postPropuestaAcuerdo",
        formData
      )
      .catch(err => {
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

  handleHoverFilter = isHover => {
    this.setState({
      hoverFilter: isHover
    });
  };

  handleFilterPuebloSelected = (c, { suggestion }) => {
    this.setState({
      auxFilterPueblo: suggestion
    });
  };

  handleApplyFilters = () => {
    const { auxFilterPueblo, requiredCards } = this.state;

    let objFiltros= {};

    if (auxFilterPueblo !== ""){
      objFiltros.pueblo = auxFilterPueblo;
    }

    this.setState(
      {
        jsonAnuncios: [],
        buscado: false
      },
      () => {
        axios
          .get(
            "http://" + ipMaquina + ":3001/api/procedures/getAnunciosConPerfil",
            {
              params: {
                options: {
                  limit: requiredCards
                },
                filtros: objFiltros
              }
            }
          )
          .then(res => {
            this.setState({
              jsonAnuncios: res.data,
              buscado: true,
              showModalFilter: false,
              isFiltering: true
            });
          })
          .catch(err => {
            this.setState({
              buscado: true,
              showModalFilter: false,
            })
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
        auxFilterPueblo: ""
      },
      () => {
        axios
          .get(
            "http://" + ipMaquina + ":3001/api/procedures/getAnunciosConPerfil",
            {
              params: {
                options: {
                  limit: requiredCards
                }
              }
            }
          )
          .then(res => {
            this.setState({
              jsonAnuncios: res.data,
              buscado: true,
              showModalFilter: false,
              isFiltering: false
            });
          })
          .catch(err => {
            this.setState({
              buscado: true,
              showModalFilter: false
            })
            cogoToast.error(
              <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
            );
          });
      }
    );
  };

  render() {
    const {
      jsonAnuncios,
      showModalTelefono,
      showModalCalendar,
      showModalFilter,
      selectedAnuncio,
      hoverFilter,
      auxFilterPueblo,
      isFiltering,
      buscado
    } = this.state;
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
                borderRadius: 50
              }}
              className="bg-success text-white rounded-pill p-2">
              <span
                className="pl-1"
                style={{ fontSize: 20 }}
              >
                {trans('tablaCuidadores.filtrar')}
              </span>
              <FontAwesomeIcon
                className="ml-2"
                key="iconFilter"
                size={"1x"}
                icon={faSearch}
              />
            </div>
          </div>
          {buscado ? (
            jsonAnuncios.map((anuncio, indice) => {
              return (
                <div
                  key={`contAnuncio${indice}`}
                  className="row card-header mt-2 mb-2"
                >
                  <div key={`anuncio${indice}`} style={{ width: "300px" }}>
                    <img
                      key={`img${indice}`}
                      className="img-responsive"
                      src={
                        "http://" +
                        ipMaquina +
                        ":3001/api/image/" +
                        anuncio.direcFoto
                      }
                      style={{
                        minHeight: "300px",
                        maxHeight: "300px",
                        height: "auto"
                      }}
                    />
                    <div
                      key={`local${indice}`}
                      className="align-center text-center"
                    >
                      <FontAwesomeIcon
                        key={`localizacion${indice}`}
                        className="text-success"
                        icon={faHome}
                      />{" "}
                      <span
                        key={`nombreLocalizacion${indice}`}
                        className="font-weight-bold"
                      >
                        {anuncio.pueblo}
                      </span>
                    </div>
                  </div>

                  <div key={`info${indice}`} className="col">
                    <h3 key={`titulo${indice}`}>{anuncio.titulo}</h3>
                    <hr />
                    <h5 key={`desc${indice}`}>{anuncio.descripcion}</h5>
                    <div key={`fila${indice}`} className="row">
                      <FontAwesomeIcon
                        key={`iconTelefono${indice}`}
                        style={{ cursor: "pointer" }}
                        size={"2x"}
                        className="col text-success"
                        icon={faPhoneAlt}
                        onClick={() =>
                          this.setState({
                            showModalTelefono: true,
                            selectedAnuncio: anuncio
                          })
                        }
                      />
                      <FontAwesomeIcon
                        key={`iconCalendar${indice}`}
                        style={{ cursor: "pointer" }}
                        size={"2x"}
                        className="col text-success"
                        icon={faCalendar}
                        onClick={() =>
                          this.setState({
                            showModalCalendar: true,
                            selectedAnuncio: anuncio
                          })
                        }
                      />
                      <div
                        className="col btn btn-success"
                        key={`btnPropuesta${indice}`}
                        onClick={() => this.handleEnviarPropuesta(anuncio)}
                      >
                        {i18next.t("tablaAnuncios.enviarPropuesta")}
                      </div>
                    </div>
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
          <Modal
            className="modalAnuncio"
            show={showModalTelefono}
            onHide={() => this.setState({ showModalTelefono: false })}
          >
            <ModalHeader closeButton>
              <h5>Kontaktua</h5>
            </ModalHeader>
            <ModalBody className="d-flex align-middle justify-content-center">
              <div className="align-self-center row">
                <FontAwesomeIcon
                  className="col-3 mb-5 text-success"
                  size="2x"
                  icon={faUser}
                />
                {selectedAnuncio !== null ? (
                  <span className="font-weight-bold col-9 text-center">
                    {selectedAnuncio.idCliente.nombre +
                      " " +
                      selectedAnuncio.idCliente.apellido1}
                  </span>
                ) : null}
                <br />
                <FontAwesomeIcon
                  className="col-3 mb-5 text-success"
                  size="2x"
                  icon={faMobileAlt}
                />
                {selectedAnuncio !== null ? (
                  <span className="font-weight-bold col-9 text-center">
                    {selectedAnuncio.idCliente.telefono.movil.numero ||
                      trans("tablaAnuncios.noDefinido")}
                  </span>
                ) : null}
                <br />
                <FontAwesomeIcon
                  className="col-3 text-success"
                  size="2x"
                  icon={faPhoneAlt}
                />
                {selectedAnuncio !== null ? (
                  <span className="font-weight-bold col-9 text-center">
                    {selectedAnuncio.idCliente.telefono.fijo.numero ||
                      trans("tablaAnuncios.noDefinido")}
                  </span>
                ) : null}
              </div>
            </ModalBody>
          </Modal>
          <Modal
            className="modalAnuncio"
            show={showModalCalendar}
            onHide={() => this.setState({ showModalCalendar: false })}
          >
            <ModalHeader closeButton>
              <h5>Ordutegia</h5>
            </ModalHeader>
            <ModalBody className="justify-content-center">
              {selectedAnuncio !== null ? this.renderHorarioModal() : null}
            </ModalBody>
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
