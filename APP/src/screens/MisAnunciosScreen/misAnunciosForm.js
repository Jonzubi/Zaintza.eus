import React from "react";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import { trans, toBase64, arrayOfFalses } from "../../util/funciones";
import ClipLoader from "react-spinners/ClipLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrashAlt,
  faSave,
  faUsers,
  faEuroSign,
  faHome,
  faMinusCircle,
  faClock,
  faPlusCircle,
  faFileSignature,
  faEllipsisV,
  faChartBar,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import Avatar from "react-avatar";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import ImageUploader from "../../components/contactImageUploader";
import i18next from "i18next";
import PuebloAutosuggest from "../../components/pueblosAutosuggest";
import TimeInput from "../../components/customTimeInput";
import "./modalRegistrarse.css";
import "./misAnunciosForm.css";
import ModalHeader from "react-bootstrap/ModalHeader";

class MisAnuncios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonAnuncios: [],
      isLoading: true,
      isLoadingStatsModal: false,
      isUploading: false,
      selectedAnuncio: {},
      showModalStats: false,
      showModalEditAnuncio: false,
      showModalDeleteAnuncio: false,
      imgAnuncio: null,
      publicoAnuncio: null,
      precioAnuncio: null,
      ubicaciones: [],
      horario: [],
      descripcionAnuncio: "",
      tituloAnuncio: "",
      isOpenThreeDotLayer: [],
      visitasConLogin: 0,
      visitasSinLogin: 0,
      error: {
        tituloAnuncio: false,
        descripcionAnuncio: false,
        publicoAnuncio: false,
        precioAnuncio: false,
        ubicaciones: false,
        horario: false
      }
    };
  }

  componentDidMount() {
    this.getMisAnuncios();
  }

  getMisAnuncios = () => {
    const { idPerfil, email, contrasena } = this.props;
    axios
      .post(`https://${ipMaquina}:3001/api/procedures/getMisAnuncios`, {
        idCliente: idPerfil,
        email,
        contrasena,
      })
      .then((res) => {
        this.setState({
          jsonAnuncios: res.data,
          isLoading: false,
          isOpenThreeDotLayer: arrayOfFalses(res.data.length),
        });
      })
      .catch(() => {
        cogoToast.error(
          <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
        );
        this.setState({
          isLoading: false,
        });
      });
  };

  refrescarDatos = () => {
    this.setState(
      {
        isLoading: true,
      },
      () => {
        this.getMisAnuncios();
      }
    );
  };

  handleEditAnuncio = (anuncio) => {
    this.setState({
      selectedAnuncio: anuncio,
      showModalEditAnuncio: true,
      ubicaciones: anuncio.pueblo.slice(),
      horario: JSON.parse(JSON.stringify(anuncio.horario)),
      publicoAnuncio: anuncio.publico,
      precioAnuncio: anuncio.precio,
      descripcionAnuncio: anuncio.descripcion,
      tituloAnuncio: anuncio.titulo,
    });
  };

  handleDeleteAnuncio = () => {
    const { selectedAnuncio } = this.state;
    const { email, contrasena } = this.props;
    axios
      .post(
        `https://${ipMaquina}:3001/api/procedures/deleteAnuncio/${selectedAnuncio._id}`,
        {
          email,
          contrasena,
        }
      )
      .then((res) => {
        if (res.status === 200) {
          cogoToast.success(
            <h5>{trans("misAnunciosForm.anuncioEliminado")}</h5>
          );
          this.setState({
            showModalDeleteAnuncio: false,
          });
          this.refrescarDatos();
        } else {
          cogoToast.error(<h5>{trans("misAnunciosForm.error")}</h5>);
          this.setState({
            showModalDeleteAnuncio: false,
          });
        }
      })
      .catch(() => {
        cogoToast.error(<h5>{trans("misAnunciosForm.error")}</h5>);
        this.setState({
          showModalDeleteAnuncio: false,
        });
      });
  };

  onChangeAnuncioImg = (picture) => {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgAnuncio: picture,
    });
  };

  handlePublicoChange = (evento) => {
    const publico = evento.target.value;
    this.setState({
      publicoAnuncio: publico,
    });
  };

  handlePrecioChange = (evento) => {
    const precio = evento.target.value;
    this.setState({
      precioAnuncio: precio,
    });
  };

  handleAddPueblo = (c, { suggestion }) => {
    const { ubicaciones } = this.state;
    for (var clave in ubicaciones) {
      if (this.state.ubicaciones[clave] == suggestion) {
        cogoToast.error(
          <h5>
            {suggestion} {trans("registerFormCuidadores.errorPuebloRepetido")}
          </h5>
        );
        return;
      }
    }
    let auxUbicaciones = ubicaciones.slice();
    auxUbicaciones.push(suggestion);

    this.setState({
      ubicaciones: auxUbicaciones,
    });
  };

  handleRemovePueblo = (index) => {
    const { ubicaciones } = this.state;
    let auxUbicaciones = ubicaciones.slice();
    auxUbicaciones = auxUbicaciones.filter(
      (pueblo) => pueblo !== ubicaciones[index]
    );

    this.setState({
      ubicaciones: auxUbicaciones,
    });
  };

  addDiasDisponible = () => {
    const { horario } = this.state;
    let auxDiasDisponible = horario.slice();
    auxDiasDisponible.push({
      dia: 0,
      horaInicio: "00:00",
      horaFin: "00:00",
    });

    this.setState({
      horario: auxDiasDisponible,
    });
  };

  removeDiasDisponible = () => {
    const { horario } = this.state;
    let auxHorario = horario.slice();
    auxHorario.pop();
    this.setState({
      horario: auxHorario,
    });
  };

  handleDiasDisponibleChange = (e, indice) => {
    const { horario } = this.state;
    if (typeof indice == "undefined") {
      //Significa que lo que se ha cambiado es el combo de los dias
      var origen = e.target;
      var indice = parseInt(origen.id.substr(origen.id.length - 1));
      var valor = origen.value;

      let auxHorario = horario.slice();
      auxHorario[indice]["dia"] = valor;

      this.setState({
        horario: auxHorario,
      });
    } else {
      //Significa que ha cambiado la hora, no se sabe si inicio o fin, eso esta en "indice"
      let atributo = indice.substr(0, indice.length - 1);
      indice = indice.substr(indice.length - 1);
      let auxHorario = horario.slice();
      auxHorario[indice][atributo] = e;

      this.setState({
        horario: auxHorario,
      });
    }
  };

  handleTituloChange = (event) => {
    this.setState({
      tituloAnuncio: event.target.value,
    });
  };

  handleDescripcionChange = (event) => {
    this.setState({
      descripcionAnuncio: event.target.value,
    });
  };

  handleValidarEnviar = () => {
    this.setState(
      {
        isUploading: true,
      },
      () => {
        if (this.handleValidarAnuncio()) {
          this.handleActualizarAnuncio();
        } else {
          this.setState({
            isUploading: false,
          });
        }
      }
    );
  };

  handleValidarAnuncio = () => {
    const {
      tituloAnuncio,
      descripcionAnuncio,
      precioAnuncio,
      ubicaciones,
      horario,
      error
    } = this.state;
    console.log(this.state);
    console.log(error.tituloAnuncio);
    if (tituloAnuncio === "") {
      cogoToast.error(<h5>{trans("misAnunciosForm.tituloNoVacio")}</h5>);
      let auxError = error;
      auxError.tituloAnuncio = true;
      this.setState({
        error: auxError
      });
      return false;
    } else if (error.tituloAnuncio) {
      let auxError = error;
      auxError.tituloAnuncio = false;
      this.setState({
        error: auxError
      }); 
    }
    if (descripcionAnuncio === "") {
      cogoToast.error(<h5>{trans("misAnunciosForm.descripcionNoVacio")}</h5>);
      let auxError = error;
      auxError.descripcionAnuncio = true;
      this.setState({
        error: auxError
      });
      return false;
    } else if (error.descripcionAnuncio) {
      let auxError = error;
      auxError.descripcionAnuncio = false;
      this.setState({
        error: auxError
      }); 
    }
    if (precioAnuncio === "") {
      cogoToast.error(<h5>{trans("misAnunciosForm.precioNoVacio")}</h5>);
      let auxError = error;
      auxError.precioAnuncio = true;
      this.setState({
        error: auxError
      });
      return false;
    } else if (error.precioAnuncio) {
      let auxError = error;
      auxError.precioAnuncio = false;
      this.setState({
        error: auxError
      }); 
    }
    if (ubicaciones.length === 0) {
      cogoToast.error(<h5>{trans("misAnunciosForm.ubicacionesNoVacio")}</h5>);
      let auxError = error;
      auxError.ubicaciones = true;
      this.setState({
        error: auxError
      });
      return false;
    } else if (error.ubicaciones) {
      let auxError = error;
      auxError.ubicaciones = false;
      this.setState({
        error: auxError
      }); 
    }
    if (horario.length === 0) {
      cogoToast.error(<h5>{trans("misAnunciosForm.horarioNoVacio")}</h5>);
      let auxError = error;
      auxError.horario = true;
      this.setState({
        error: auxError
      });
      return false;
    } else if (error.horario) {
      let auxError = error;
      auxError.horario = false;
      this.setState({
        error: auxError
      }); 
    }

    let horarioIsValid = true;
    horario.map((dia) => {
      if (!dia.dia) {
        horarioIsValid = false;
        return;
      }
      let { horaInicio, horaFin } = dia;
      horaInicio = horaInicio.split(':'); // Separamos horas y minutos para compararlos 
      horaFin = horaFin.split(':'); // y decir que hora fin no sea antes que hora inicio

      if (parseInt(horaInicio[0]) > parseInt(horaFin[0])){
        // La hora de horainicio es mayor por lo que error
        cogoToast.error(
          <h5>{trans("registerFormCuidadores.errorDiaHoraIncorrecto")}</h5>
        );
        horarioIsValid = false;
        return;
      } else if(parseInt(horaInicio[0]) === parseInt(horaFin[0])){
        if (parseInt(horaInicio[1]) >= parseInt(horaFin[1])) {
          // Los minutos de horainicio son mayores, siendo la hora igual por lo que error
          cogoToast.error(
            <h5>{trans("registerFormCuidadores.errorDiaHoraIncorrecto")}</h5>
          );
          horarioIsValid = false;
          return;
        }
      }
    });
    if (!horarioIsValid) {
      cogoToast.error(<h5>{trans("registerFormCuidadores.errorDiaHoraIncorrecto")}</h5>);
      let auxError = error;
      auxError.horario = true;
      this.setState({
        error: auxError
      });
      return false;
    } else if (error.horario) {
      let auxError = error;
      auxError.horario = false;
      this.setState({
        error: auxError
      }); 
    }

    return true;
  };

  handleActualizarAnuncio = async () => {
    const {
      tituloAnuncio,
      descripcionAnuncio,
      horario,
      ubicaciones,
      publicoAnuncio,
      precioAnuncio,
      imgAnuncio,
      selectedAnuncio,
    } = this.state;
    const { email, contrasena } = this.props;

    let imgAnuncioB64;
    if (imgAnuncio !== null) {
      imgAnuncioB64 = await toBase64(imgAnuncio[0]);
    }

    const formData = {
      titulo: tituloAnuncio,
      descripcion: descripcionAnuncio,
      horario,
      pueblo: ubicaciones,
      publico: publicoAnuncio,
      precio: precioAnuncio,
      imgAnuncio: imgAnuncio !== null ? imgAnuncioB64 : null,
      email,
      contrasena,
    };

    axios
      .patch(
        `https://${ipMaquina}:3001/api/procedures/patchAnuncio/${selectedAnuncio._id}`,
        formData
      )
      .then((res) => {
        if (res.status === 200) {
          cogoToast.success(
            <h5>{trans("misAnunciosForm.anuncioActualizado")}</h5>
          );
          this.setState({
            isUploading: false,
          });
          this.refrescarDatos();
          this.handleCerrarModalVaciarEditData();
        } else {
          this.setState({
            isUploading: false,
          });
          cogoToast.error(<h5>{trans("misAnunciosForm.error")}</h5>);
        }
      })
      .catch(() => {
        this.setState({
          isUploading: false,
        });
        cogoToast.error(<h5>{trans("misAnunciosForm.error")}</h5>);
      });
  };

  handleCerrarModalVaciarEditData = () => {
    this.setState({
      showModalEditAnuncio: false,
      tituloAnuncio: "",
      descripcionAnuncio: "",
      precioAnuncio: "",
      ubicaciones: [],
      horario: [],
      imgAnuncio: null,
    });
  };

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

  handleShowStats = async (anuncio) => {
    const { email, contrasena } = this.props;
    this.setState(
      {
        showModalStats: true,
        isLoadingStatsModal: true,
      },
      () => {
        const formData = {
          email,
          contrasena,
        };
        axios
          .post(
            `https://${ipMaquina}:3001/api/procedures/getAnuncioVisitas/${anuncio._id}`,
            formData
          )
          .then((res) => {
            this.setState({
              visitasConLogin: res.data.visitasConLogin,
              visitasSinLogin: res.data.visitasSinLogin,
              isLoadingStatsModal: false,
            });
          })
          .catch(() => {
            cogoToast.error(<h5>{trans("notificaciones.errorConexion")}</h5>);
            this.setState({
              isLoadingStatsModal: false,
            });
          });
      }
    );
  };

  closeOpenedOptionsDiv = () => {
    const { isOpenThreeDotLayer } = this.state;

    if (isOpenThreeDotLayer.includes(true)) {
      this.setState({
        isOpenThreeDotLayer: arrayOfFalses(isOpenThreeDotLayer.length),
      });
    }
  };

  render() {
    const {
      isLoading,
      jsonAnuncios,
      showModalDeleteAnuncio,
      showModalEditAnuncio,
      selectedAnuncio,
      publicoAnuncio,
      precioAnuncio,
      ubicaciones,
      horario,
      tituloAnuncio,
      descripcionAnuncio,
      isUploading,
      isOpenThreeDotLayer,
      visitasConLogin,
      visitasSinLogin,
      showModalStats,
      isLoadingStatsModal,
      error
    } = this.state;
    return (
      <div
        onClick={() => this.closeOpenedOptionsDiv()}
        style={{
          height: "calc(100vh - 80px)",
        }}
        className={isLoading ? "p-0" : "p-lg-5 p-2"}
      >
        {isLoading ? (
          <div
            style={{
              height: "calc(100vh - 80px)",
            }}
            className="d-flex align-items-center justify-content-center"
          >
            <ClipLoader color="#28a745" />
          </div>
        ) : jsonAnuncios.length === 0 ? (
          <div
            style={{
              height: "calc(100vh - 80px)",
            }}
            className="d-flex align-items-center justify-content-center"
          >
            <small className="text-danger">
              {trans("misAnunciosForm.noData")}
            </small>
          </div>
        ) : (
          jsonAnuncios.map((anuncio, index) => (
            <div
              style={{
                boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
              }}
              className="p-1 d-flex flex-row align-items-center justify-content-between"
            >
              <Avatar
                size={50}
                name={anuncio.titulo}
                src={
                  "https://" + ipMaquina + ":3001/api/image/" + anuncio.direcFoto
                }
              />
              <span
                style={{
                  width: 200,
                }}
                className="font-weight-bold"
              >
                {anuncio.titulo.length > 20
                  ? anuncio.titulo.substring(0, 20) + " ..."
                  : anuncio.titulo}
              </span>
              <span
                style={{
                  width: 400,
                }}
                className="d-lg-inline d-none"
              >
                {anuncio.descripcion.length > 50
                  ? anuncio.descripcion.substring(0, 50) + " ..."
                  : anuncio.descripcion}
              </span>
              <div className="d-md-inline d-none">
                <FontAwesomeIcon
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => this.handleShowStats(anuncio)}
                  icon={faChartBar}
                  className="text-primary mr-md-5 mr-2"
                />
                <FontAwesomeIcon
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => this.handleEditAnuncio(anuncio)}
                  icon={faPen}
                  className="text-success mr-md-5 mr-2"
                />
                <FontAwesomeIcon
                  style={{
                    cursor: "pointer",
                  }}
                  icon={faTrashAlt}
                  className="text-danger"
                  onClick={() =>
                    this.setState({
                      showModalDeleteAnuncio: true,
                      selectedAnuncio: anuncio,
                    })
                  }
                />
              </div>
              <div className="d-md-none d-inline">
                <FontAwesomeIcon
                  style={{
                    cursor: "pointer",
                  }}
                  icon={faEllipsisV}
                  onClick={() => this.handleClickOptions(index)}
                />
                <div
                  style={{
                    position: "absolute",
                    width: 200,
                    right: 10,
                    backgroundColor: "white",
                    boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                  }}
                  className={
                    isOpenThreeDotLayer[index]
                      ? "d-flex flex-column rounded border"
                      : "d-none"
                  }
                >
                  <div
                    style={{
                      cursor: "pointer",
                    }}
                    className="threeDotsMenu p-1 d-flex flex-row align-items-center justify-content-between"
                    onClick={() => {
                      this.handleShowStats(anuncio);
                      this.handleClickOptions(index);
                    }}
                  >
                    <span className="mr-5">
                      {trans("misAnunciosForm.verStats")}
                    </span>
                    <FontAwesomeIcon
                      className="text-primary"
                      icon={faChartBar}
                    />
                  </div>
                  <div
                    style={{
                      cursor: "pointer",
                    }}
                    className="threeDotsMenu p-1 d-flex flex-row align-items-center justify-content-between"
                    onClick={() => {
                      this.handleEditAnuncio(anuncio);
                      this.handleClickOptions(index);
                    }}
                  >
                    <span className="mr-5">
                      {trans("misAnunciosForm.editar")}
                    </span>
                    <FontAwesomeIcon className="text-success" icon={faPen} />
                  </div>
                  <div
                    style={{
                      cursor: "pointer",
                    }}
                    className="threeDotsMenu p-1 d-flex flex-row align-items-center justify-content-between"
                    onClick={() => {
                      this.setState({
                        showModalDeleteAnuncio: true,
                        selectedAnuncio: anuncio,
                      });
                      this.handleClickOptions(index);
                    }}
                  >
                    <span className="mr-5">
                      {trans("misAnunciosForm.eliminar")}
                    </span>
                    <FontAwesomeIcon
                      className="text-danger"
                      icon={faTrashAlt}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <Modal
          className="modalRegistrarse"
          show={showModalDeleteAnuncio}
          onHide={() => this.setState({ showModalDeleteAnuncio: false })}
        >
          <ModalBody className="d-flex flex-row align-items-center justify-content-center">
            {trans("misAnunciosForm.askDeleteForm")}
          </ModalBody>
          <ModalFooter className="d-flex flex-row align-items-center justify-content-between">
            <button
              className="btn btn-success"
              onClick={() => this.handleDeleteAnuncio()}
            >
              {trans("misAnunciosForm.si")}
            </button>
            <button
              className="btn btn-danger"
              onClick={() =>
                this.setState({
                  showModalDeleteAnuncio: false,
                })
              }
            >
              {trans("misAnunciosForm.no")}
            </button>
          </ModalFooter>
        </Modal>
        <Modal
          show={showModalStats}
          onHide={() => this.setState({ showModalStats: false })}
          style={{
            maxWidth: 500,
          }}
        >
          <ModalHeader closeButton>
            <h5>{trans("misAnunciosForm.verStats")}</h5>
          </ModalHeader>
          <ModalBody
            className={
              !isLoadingStatsModal
                ? "d-flex flex-column align-items-center"
                : "d-flex flex-column align-items-center justify-content-center"
            }
          >
            {isLoadingStatsModal ? (
              <ClipLoader color="#28a745" />
            ) : (
              <div>
                <div
                  style={{
                    width: 300,
                  }}
                  className="d-flex flex-row align-items-center justify-content-between"
                >
                  <span>{trans("misAnunciosForm.visitasConLogin")}</span>
                  <div>
                    <span className="font-weight-bold">
                      {visitasConLogin.length}
                    </span>
                    <FontAwesomeIcon icon={faEye} className="ml-1" />
                  </div>
                </div>
                <div
                  style={{
                    width: 300,
                  }}
                  className="d-flex flex-row align-items-center justify-content-between"
                >
                  <span>{trans("misAnunciosForm.visitasSinLogin")}</span>
                  <div>
                    <span className="font-weight-bold">
                      {visitasSinLogin.length}
                    </span>
                    <FontAwesomeIcon icon={faEye} className="ml-1" />
                  </div>
                </div>
                <div
                  style={{
                    width: 300,
                  }}
                  className="mt-2 d-flex flex-row align-item-center justify-content-between"
                >
                  <span className="font-weight-bold">
                    {trans("misAnunciosForm.totalVisitas")}
                  </span>
                  <div>
                    <span className="font-weight-bold">
                      {parseInt(visitasSinLogin.length) +
                        parseInt(visitasConLogin.length)}
                    </span>
                    <FontAwesomeIcon icon={faEye} className="ml-1" />
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>
        <Modal
          show={showModalEditAnuncio}
          style={{
            maxWidth: "500px",
          }}
          onHide={() => this.handleCerrarModalVaciarEditData()}
        >
          <ModalHeader closeButton>
            <h5>{trans("misAnunciosForm.anuncio")}</h5>
          </ModalHeader>
          <ModalBody className="d-flex flex-column justify-content-between align-items-center">
            <ImageUploader
              onImageChoose={this.onChangeAnuncioImg}
            />
            <div
              style={{
                width: 300,
              }}
              className={error.tituloAnuncio ? "mt-2 d-flex flex-column border border-danger" : "mt-2 d-flex flex-column"}
            >
              <div className="d-flex flex-row align-items-center justify-content-center">
                <FontAwesomeIcon icon={faFileSignature} className="mr-1" />
                <span className="font-weight-bold">
                  {trans("misAnunciosForm.titulo")}
                </span>
              </div>
              <input value={tituloAnuncio} onChange={this.handleTituloChange} />
            </div>
            <div
              style={{
                width: 300,
              }}
              className={error.descripcionAnuncio ? "mt-2 d-flex flex-column border border-danger" : "mt-2 d-flex flex-column"}
            >
              <div className="d-flex flex-row align-items-center justify-content-center">
                <FontAwesomeIcon icon={faFileSignature} className="mr-1" />
                <span className="font-weight-bold">
                  {trans("misAnunciosForm.descripcion")}
                </span>
              </div>
              <textarea
                rows={5}
                value={descripcionAnuncio}
                onChange={this.handleDescripcionChange}
              />
            </div>
            <div>
              <div
                style={{
                  width: 300,
                }}
                className={error.publicoAnuncio ? "mt-2 d-flex flex-row align-items-center justify-content-between border border-danger" : "mt-2 d-flex flex-row align-items-center justify-content-between"}
              >
                <FontAwesomeIcon className="" icon={faUsers} />
                <select
                  value={publicoAnuncio}
                  onChange={this.handlePublicoChange}
                >
                  <option value="ninos">
                    {i18next.t("tablaAnuncios.ninos")}
                  </option>
                  <option value="terceraEdad">
                    {i18next.t("tablaAnuncios.terceraEdad")}
                  </option>
                  <option value="necesidadEspecial">
                    {i18next.t("tablaAnuncios.necesidadEspecial")}
                  </option>
                </select>
              </div>
              <div
                style={{
                  width: 300,
                }}
                className={error.precioAnuncio ? "mt-2 d-flex flex-row align-items-center justify-content-between border border-danger" : "mt-2 d-flex flex-row align-items-center justify-content-between"}
              >
                <FontAwesomeIcon className="" icon={faEuroSign} />
                <input
                  type="number"
                  value={precioAnuncio}
                  onChange={this.handlePrecioChange}
                />
              </div>
            </div>
            <div
              style={{
                width: 300,
              }}
              className={error.ubicaciones ? "mt-3 d-flex flex-column border border-danger" : "mt-3 d-flex flex-column"}
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faHome} className="mr-1" />
                <span className="font-weight-bold text-center">
                  {trans("tablaCuidadores.pueblos")}
                </span>
              </div>
              <PuebloAutosuggest onSuggestionSelected={this.handleAddPueblo} />
              <span className="d-flex flex-column">
                {typeof ubicaciones != "undefined"
                  ? ubicaciones.map((ubicacion, index) => {
                      return (
                        <div className="d-flex flex-row align-items-center justify-content-between">
                          <span className="mt-2">{ubicacion}</span>
                          <FontAwesomeIcon
                            className="text-danger mt-2"
                            icon={faMinusCircle}
                            onClick={() => this.handleRemovePueblo(index)}
                            style={{
                              cursor: "pointer",
                            }}
                          />
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
              className={error.horario ? "mt-3 d-flex flex-column border border-danger" : "mt-3 d-flex flex-column"}
            >
              <span className="d-flex flex-row justify-content-between align-items-center">
                <FontAwesomeIcon
                  style={{ cursor: "pointer" }}
                  onClick={this.removeDiasDisponible}
                  className="text-danger"
                  icon={faMinusCircle}
                />
                <div>
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  <span className="lead">{trans("tablaAnuncios.horario")}</span>
                  (<span className="text-danger font-weight-bold">*</span>)
                </div>
                <FontAwesomeIcon
                  style={{ cursor: "pointer" }}
                  onClick={this.addDiasDisponible}
                  className="text-success"
                  icon={faPlusCircle}
                />
              </span>
              {horario.map((dia, indice) => {
                return (
                  <div className="mt-1 d-flex flex-row align-items-center justify-content-between">
                    <select
                      value={dia.dia}
                      onChange={this.handleDiasDisponibleChange}
                      className="d-inline"
                      id={"dia" + indice}
                    >
                      <option>{i18next.t("dropDownDias.eligeDia")}</option>
                      <option value="1">
                        {i18next.t("dropDownDias.lunes")}
                      </option>
                      <option value="2">
                        {i18next.t("dropDownDias.martes")}
                      </option>
                      <option value="3">
                        {i18next.t("dropDownDias.miercoles")}
                      </option>
                      <option value="4">
                        {i18next.t("dropDownDias.jueves")}
                      </option>
                      <option value="5">
                        {i18next.t("dropDownDias.viernes")}
                      </option>
                      <option value="6">
                        {i18next.t("dropDownDias.sabado")}
                      </option>
                      <option value="7">
                        {i18next.t("dropDownDias.domingo")}
                      </option>
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
                        initTime={horario[indice].horaInicio}
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
                        initTime={horario[indice].horaFin}
                        style={{
                          width: 50,
                        }}
                        className="text-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter className="d-flex flex-row align-items-center justify-content-center">
            {isUploading ? (
              <ClipLoader color="#28a745" />
            ) : (
              <button
                className="w-100 btn btn-success"
                onClick={() => this.handleValidarEnviar()}
              >
                {trans("misAnunciosForm.guardarCambios")}
                <FontAwesomeIcon icon={faSave} className="ml-2" />
              </button>
            )}
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  idPerfil: state.user._id,
  email: state.user.email,
  contrasena: state.user.contrasena,
  nowLang: state.app.nowLang,
});

export default connect(mapStateToProps)(MisAnuncios);
