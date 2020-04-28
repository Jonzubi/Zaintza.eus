import React from "react";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import { trans } from "../util/funciones";
import ClipLoader from "react-spinners/ClipLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt, faSave, faUsers, faEuroSign } from "@fortawesome/free-solid-svg-icons";
import Avatar from "react-avatar";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import ImageUploader from "react-images-upload";
import i18next from "i18next";
import "../components/styles/modalRegistrarse.css"

class MisAnuncios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonAnuncios: [],
      isLoading: true,
      selectedAnuncio: {},
      showModalEditAnuncio: false,
      showModalDeleteAnuncio: false,
      imgAnuncio: null,
      publicoAnuncio: null,
      precioAnuncio: null
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
  }

  refrescarDatos = () => {
    this.setState({
      isLoading: true
    }, () => {
      this.getMisAnuncios();
    })
  }

  handleEditAnuncio = (anuncio) => {
    this.setState({
      selectedAnuncio: anuncio,
      showModalEditAnuncio: true,
    });
  };

  handleDeleteAnuncio = (anuncio) => {};

  onChangeAnuncioImg = (picture) => {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgAnuncio: picture
    });
  }

  handlePublicoChange = (evento) => {
    const publico = evento.target.value;
    this.setState({
      publicoAnuncio: publico
    });
  }

  handlePrecioChange = (evento) => {
    const precio = evento.target.value;
    this.setState({
      precioAnuncio: precio
    });
  }

  render() {
    const {
      isLoading,
      jsonAnuncios,
      showModalDeleteAnuncio,
      showModalEditAnuncio,
      selectedAnuncio,
      publicoAnuncio,
      precioAnuncio
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
              onClick={() => this.setState({
                showModalDeleteAnuncio: false
              })}
            >
              {trans("misAnunciosForm.no")}
            </button>
          </ModalFooter>
        </Modal>
        <Modal
          show={showModalEditAnuncio}
          style={{
            maxWidth: "500px"
          }}
          onHide={() => this.setState({ showModalEditAnuncio: false })}
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
                this.state.imgAnuncio != null ? "text-light font-weight-bold" : ""
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
                width: 300
              }}
              className="d-flex flex-row align-items-center justify-content-between"
            >
              <FontAwesomeIcon className="" icon={faUsers} />
              <select
                value={publicoAnuncio || selectedAnuncio.publico}
                onChange={this.handlePublicoChange}
              >
                <option value="ninos">{i18next.t('tablaAnuncios.ninos')}</option>
                <option value="terceraEdad">{i18next.t('tablaAnuncios.terceraEdad')}</option>
                <option value="necesidadEspecial">{i18next.t('tablaAnuncios.necesidadEspecial')}</option>
              </select>
            </div>
            <div
              style={{
                width: 300
              }}
              className="d-flex flex-row align-items-center justify-content-between"
            >
              <FontAwesomeIcon className="" icon={faEuroSign} />
              <input
                value={precioAnuncio || selectedAnuncio.precio}
                onChange={this.handlePrecioChange}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              className="w-100 btn btn-success"
              onClick={() => console.log(selectedAnuncio)}
            >
              {trans('misAnunciosForm.guardarCambios')}
              <FontAwesomeIcon icon={faSave} className="ml-2" />
            </button>
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
  nowLang: state.app.nowLang
});

export default connect(mapStateToProps)(MisAnuncios);
