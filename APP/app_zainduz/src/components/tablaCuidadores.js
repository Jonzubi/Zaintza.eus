import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheck,
  faTimes,
  faUser,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import loadGif from "../util/gifs/loadGif.gif";
import Axios from "axios";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalBody from "react-bootstrap/ModalBody";
import ModalTitle from "react-bootstrap/ModalTitle";
import ModalFooter from "react-bootstrap/ModalFooter";
import Button from "react-bootstrap/Button";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import "./styles/tablaCuidadores.css";

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
        cogoToast.error(<h5>Servidor no disponible!</h5>);
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      buscado: false,
      jsonCuidadores: {},
      showModal: false,
      selectedCuidador: {}
    };
    this.handleShowModalChange = this.handleShowModalChange.bind(this);
  }

  handleShowModalChange(state) {
    this.setState({
      showModal: state
    });
  }

  handleViewCuidador(cuidador) {
    this.setState({
      showModal: true,
      selectedCuidador: cuidador
    });
  }

  render() {
    const vSelectedCuidador = this.state.selectedCuidador;
    const fechaNacCuidador = new Date(vSelectedCuidador.fechaNacimiento);
    const telefonoFijoCuidador = typeof vSelectedCuidador.telefono == "undefined" ? "Definitu gabe" : typeof vSelectedCuidador.telefono.fijo == "undefined" ? "Definitu gabe" : vSelectedCuidador.telefono.fijo.numero || "Definitu gabe";
    const telefonoMovilCuidador = typeof vSelectedCuidador.telefono == "undefined" ? "Definitu gabe" : typeof vSelectedCuidador.telefono.movil == "undefined" ? "Definitu gabe" : vSelectedCuidador.telefono.movil.numero || "Definitu gabe";
    console.log(vSelectedCuidador);

    return (
      <div className="w-100 h-100">
        <table className="table">
          <tr className="row">
            {typeof this.state.jsonCuidadores.map != "undefined" &&
            this.state.buscado ? (
              this.state.jsonCuidadores.map((cuidador, indice) => {
                return (
                  <td className="col-3 border-top-0">
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
                        <p className="card-text">{cuidador.descripcion}</p>
                      </div>
                      <div className="card-body">
                        <div className="row text-muted card-title">
                          <div className="col text-center">Niños</div>
                          <div className="col text-center">3º edad</div>
                          <div className="col text-center">N.E</div>
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
                          Ver
                          <FontAwesomeIcon className="ml-1" icon={faEye} />
                        </a>
                      </div>
                    </div>
                  </td>
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
                No hay registros o ha habido un error
              </small>
            )}
          </tr>
        </table>

        <Modal
          className="w-100 h-100 m-0 p-0"
          show={this.state.showModal}
          onHide={() => this.handleShowModalChange(false)}
        >
          <ModalHeader closeButton></ModalHeader>
          <ModalBody className="container-fluid">
            <h5>Datu pertsonalak</h5>
            <hr />
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
                style={{ minHeight:"300px",maxHeight: "300px", height: "auto" }}
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
                      <span className="col-3 text-center my-auto">Izena:</span>
                      <span className="col-9 text-center my-auto">{vSelectedCuidador.nombre}</span>
                    </div>
                    
                    <div className="row ml-0 h-25 border-bottom">
                      <span className="col-3 text-center my-auto">Abizenak:</span>
                      <span className="col-9 text-center my-auto">
                      {(vSelectedCuidador.apellido1 +
                        " " +
                        vSelectedCuidador.apellido2).length > 1 ? vSelectedCuidador.apellido1 +
                        " " +
                        vSelectedCuidador.apellido2 : <em>Definitu gabe</em>}</span>
                      
                    </div>
                   
                    <div className="row ml-0 h-25 border-bottom">
                    <span className="col-3 text-center my-auto">Jaiotza data:</span>
                    <span className="col-9 text-center my-auto">{fechaNacCuidador.getFullYear() + "/" + (fechaNacCuidador.getMonth() + 1) + "/" + fechaNacCuidador.getDate()}</span>
                       
                    </div>
                    <div className="row ml-0 h-25 border-bottom">
                      <span className="col-3 text-center my-auto">Sexua:</span>
                      <span className="col-9 text-center my-auto">{vSelectedCuidador.sexo == "M" ? "Gizonezkoa" : "Emakumezkoa"}</span>                     
                    </div>
                  </div>
                  <div className="col-3 h-100 border-right p-0 border-top">
                    <div className="row ml-0 mr-0 border-bottom" style={{height: "34%"}}>
                    <span className="col-3 text-center my-auto">Emaila:</span>
                    <span className="col-9 text-center my-auto">{vSelectedCuidador.email}</span>
                    </div>
                    <div className="row ml-0 mr-0 border-bottom" style={{height: "33%"}}>
                    <span className="col-3 text-center my-auto">Mugikorra:</span>
                    <span className="col-9 text-center my-auto">{telefonoMovilCuidador}</span>
                    </div>
                    <div className="row ml-0 mr-0 border-bottom" style={{height: "33%"}}>
                    <span className="col-3 text-center my-auto">Telefono finkoa:</span>
                      <span className="col-9 text-center my-auto">{telefonoFijoCuidador}</span>
                    </div>
                  </div>
                  <div className="col-4 h-100 p-0 border-bottom border-top border-right">
                    <div className="panel panel-default">
                      <div className="panel-header text-center mb-5">Deskripzioa</div>
                      <div className="panel-body p-2">{vSelectedCuidador.descripcion}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <h5>Zaintza baldintzak</h5>
            <hr />
            <div className="row h-100">
                <div className="col-6 h-100 panel panel-default">
                    <div className="panel-header text-center">Herriak</div>
                    <div className="panel-body list-group">
                      {typeof vSelectedCuidador.ubicaciones != "undefined" ? vSelectedCuidador.ubicaciones.map((ubicacion, index) => {
                      return <span className="list-group-item">{ubicacion}</span>
                      }) : null}
                    </div>
                </div>
                <div className="col-6 h-100">

                </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => this.handleShowModalChange(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => this.handleShowModalChange(false)}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default Tabla;
