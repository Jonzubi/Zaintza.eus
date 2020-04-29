import React from "react";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import { trans, toBase64 } from "../util/funciones";
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
} from "@fortawesome/free-solid-svg-icons";
import Avatar from "react-avatar";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import ImageUploader from "react-images-upload";
import i18next from "i18next";
import PuebloAutosuggest from "./pueblosAutosuggest";
import TimeInput from "./customTimeInput";
import "../components/styles/modalRegistrarse.css";

class MisAnuncios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonAnuncios: [],
      isLoading: true,
      isUploading: false,
      selectedAnuncio: {},
      showModalEditAnuncio: false,
      showModalDeleteAnuncio: false,
      imgAnuncio: null,
      publicoAnuncio: null,
      precioAnuncio: null,
      ubicaciones: [],
      horario: [],
      descripcionAnuncio: "",
      tituloAnuncio: "",
    };
  }

  componentDidMount() {
    this.getMisAnuncios();
  }

  getMisAnuncios = () => {
    const { idPerfil, email, contrasena } = this.props;
    axios
      .post(`http://${ipMaquina}:3001/api/procedures/getMisAnuncios`, {
        idCliente: idPerfil,
        email,
        contrasena,
      })
      .then((res) => {
        this.setState({
          jsonAnuncios: res.data,
          isLoading: false,
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
        `http://${ipMaquina}:3001/api/procedures/deleteAnuncio/${selectedAnuncio._id}`,
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
    } = this.state;

    if (tituloAnuncio === "") {
      cogoToast.error(<h5>{trans("misAnunciosForm.tituloNoVacio")}</h5>);
      return false;
    }
    if (descripcionAnuncio === "") {
      cogoToast.error(<h5>{trans("misAnunciosForm.descripcionNoVacio")}</h5>);
      return false;
    }
    if (precioAnuncio === "") {
      cogoToast.error(<h5>{trans("misAnunciosForm.precioNoVacio")}</h5>);
      return false;
    }
    if (ubicaciones.length === 0) {
      cogoToast.error(<h5>{trans("misAnunciosForm.ubicacionesNoVacio")}</h5>);
      return false;
    }
    if (horario.length === 0) {
      cogoToast.error(<h5>{trans("misAnunciosForm.horarioNoVacio")}</h5>);
      return false;
    }

    let horarioIsValid = true;
    horario.map((dia) => {
      if (!dia.dia) {
        horarioIsValid = false;
        return;
      }
    });
    if (!horarioIsValid) {
      cogoToast.error(<h5>{trans("misAnunciosForm.unHorarioNoElegido")}</h5>);
      return false;
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
        `http://${ipMaquina}:3001/api/procedures/patchAnuncio/${selectedAnuncio._id}`,
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
    } = this.state;
    return (
      <div className={isLoading ? "p-0" : "p-lg-5 p-2"}>
        {isLoading ? (
          <div
            style={{
              height: "calc(100vh - 80px)",
            }}
            className="d-flex align-items-center justify-content-center"
          >
            <ClipLoader color="#28a745" />
          </div>
        ) : (
          jsonAnuncios.map((anuncio) => (
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
                  "http://" + ipMaquina + ":3001/api/image/" + anuncio.direcFoto
                }
              />
              <span className="font-weight-bold">{anuncio.titulo}</span>
              <span className="d-lg-inline d-none">{anuncio.descripcion}</span>

              <FontAwesomeIcon
                style={{
                  cursor: "pointer",
                }}
                onClick={() => this.handleEditAnuncio(anuncio)}
                size={"2x"}
                icon={faPen}
                className="text-success"
              />
              <FontAwesomeIcon
                style={{
                  cursor: "pointer",
                }}
                size={"2x"}
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
          show={showModalEditAnuncio}
          style={{
            maxWidth: "500px",
          }}
          onHide={() => this.handleCerrarModalVaciarEditData()}
        >
          <ModalBody className="d-flex flex-column justify-content-between align-items-center">
            <ImageUploader
              fileContainerStyle={
                this.state.imgAnuncio != null ? { background: "#28a745" } : {}
              }
              buttonClassName={
                this.state.imgAnuncio != null ? "bg-light text-dark" : ""
              }
              errorClass="bg-danger text-light"
              fileSizeError="handiegia da"
              fileTypeError="ez du formatu zuzena"
              singleImage={true}
              label={
                this.state.imgAnuncio != null
                  ? "Gehienez: 5MB | " +
                    this.state.imgAnuncio[0].name +
                    " (" +
                    (this.state.imgAnuncio[0].size / 1024 / 1024).toFixed(2) +
                    " MB)"
                  : "Gehienez: 5MB | Gomendaturiko dimentsioa (288x300)"
              }
              labelClass={
                this.state.imgAnuncio != null
                  ? "text-light font-weight-bold"
                  : ""
              }
              withIcon={true}
              buttonText={
                this.state.imgAnuncio != null
                  ? i18next.t("formAnuncio.eligeOtraFoto")
                  : i18next.t("formAnuncio.eligeUnaFoto")
              }
              onChange={this.onChangeAnuncioImg}
              imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
              maxFileSize={5242880}
            />
            <div
              style={{
                width: 300,
              }}
              className="mt-2 d-flex flex-column"
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
              className="mt-2 d-flex flex-column"
            >
              <div className="d-flex flex-row align-items-center justify-content-center">
                <FontAwesomeIcon icon={faFileSignature} className="mr-1" />
                <span className="font-weight-bold">
                  {trans("misAnunciosForm.descripcion")}
                </span>
              </div>
              <textarea
                value={descripcionAnuncio}
                onChange={this.handleDescripcionChange}
              />
            </div>
            <div>
              <div
                style={{
                  width: 300,
                }}
                className="mt-2 d-flex flex-row align-items-center justify-content-between"
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
                className="mt-2 d-flex flex-row align-items-center justify-content-between"
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
              className="mt-3 d-flex flex-column"
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
              className="d-flex flex-column"
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
