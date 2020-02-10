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
  faUser
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import "./styles/tablaAnuncios.css";
import ModalBody from "react-bootstrap/ModalBody";
import i18next from "i18next";

const mapStateToProps = state => {
  return {
    tipoUsuario: state.user.tipoUsuario
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeFormContent: form => dispatch(changeFormContent(form))
  };
};

class TablaAnuncios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonAnuncios: [],
      selectedAnuncio: null,
      showModalTelefono: false,
      showModalCalendar: false
    };

    this.renderHorarioModal = this.renderHorarioModal.bind(this);
  }

  componentDidMount() {
    axios
      .get("http://" + ipMaquina + ":3001/api/procedures/getAnunciosConPerfil")
      .then(res => {
        this.setState({
          jsonAnuncios: res.data
        });
      })
      .catch(err => {
        cogoToast.error(
          <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
        );
      });
  }

  renderHorarioModal() {
    const { selectedAnuncio } = this.state;
    let resultado = [];
    if (selectedAnuncio.horario.length === 0){
    return (<span className="text-center font-weight-bold">{trans('tablaAnuncios.noDefinido')}</span>);
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

  render() {
    console.log("rendeeerAnuncios");
    const {
      jsonAnuncios,
      showModalTelefono,
      showModalCalendar,
      selectedAnuncio
    } = this.state;
    return (
      <div className="p-5">
        {this.botonAddAnuncio()}

        {jsonAnuncios.map((anuncio, indice) => {
          return (
            <div key={`contAnuncio${indice}`} className="row card-header mt-2 mb-2">
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
                <div key={`local${indice}`} className="align-center text-center">
                  <FontAwesomeIcon key={`localizacion${indice}`} className="text-success" icon={faHome} />{" "}
                  <span key={`nombreLocalizacion${indice}`} className="font-weight-bold">{anuncio.pueblo}</span>
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
                  >
                    {i18next.t('tablaAnuncios.enviarPropuesta')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TablaAnuncios);