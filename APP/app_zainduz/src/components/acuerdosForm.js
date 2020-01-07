import React from "react";
import { Collapse } from "react-collapse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCircle,
  faUserMd,
  faCity
} from "@fortawesome/free-solid-svg-icons";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { t } from "../util/funciones";

const mapStateToProps = state => {
  return {
    idPerfil: state.user._id,
    tipoUsuario: state.user.tipoUsuario
  };
};

class AcuerdosForm extends React.Component {
  componentDidMount() {
    //buscarUsuOrCuid =>> En esta variable guardo si el usuario iniciado es cliente o cuidador para asi si es cuidador
    //buscar cliente en el acuerdo y viceversa, ESTO ME DARA LA INFORMACION DE LA OTRA PARTE DEL ACUERDO
    let tipoUsuario = this.props.tipoUsuario == "Z" ? "idCuidador" : "idCliente";
    axios
      .get("http://" + ipMaquina + ":3001/acuerdo", {
        params: {
          [tipoUsuario]: this.props.idPerfil
        }
      })
      .then(resultado => {
        {
          /* En estas lineas inicializo un array donde guardara el estado de los collapse que van a se los acuerdos. Por cada acuerdo guardara un false al inicio */
        }
        let buscarUsuOrCuid =
          this.props.tipoUsuario == "Z" ? "idCliente" : "idCuidador";
        let countAcuerdos = resultado.data.length;
        let auxAcuerdosCollapseState = [];
        let jsonAcuerdos = [];
        for (let i = 0; i < countAcuerdos; i++) {
          axios
            .get(
              "http://" +
                ipMaquina +
                ":3001/" +
                (buscarUsuOrCuid == "idCliente" ? "cliente" : "cuidador") +
                "/" +
                resultado.data[i][buscarUsuOrCuid]
            )
            .then(otro => {
              resultado.data[i] = Object.assign({}, resultado.data[i], {
                laOtraPersona: otro.data
              });
              jsonAcuerdos.push(resultado.data[i]);
              if (i == countAcuerdos - 1) {
                this.setState({
                  jsonAcuerdos: jsonAcuerdos,
                  buscarUsuOrCuid: buscarUsuOrCuid
                });
              }
            })
            .catch(err => {
              console.log(err);
            });
          auxAcuerdosCollapseState.push(false);
        }

        this.setState({
          acuerdosCollapseState: auxAcuerdosCollapseState
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  constructor(props) {
    super(props);

    this.state = {
      jsonAcuerdos: [],
      acuerdosCollapseState: [],
      buscarUsuOrCuid: ""
    };

    this.handleToogleCollapseAcuerdo = this.handleToogleCollapseAcuerdo.bind(
      this
    );
  }

  handleToogleCollapseAcuerdo(index) {
    let aux = this.state.acuerdosCollapseState;
    aux[index] = !aux[index];

    this.setState({
      acuerdosCollapseState: aux
    });
  }

  render() {
    console.log(this.state);
    return (
      <div className="p-5 h-100">
        {this.state.jsonAcuerdos.length != 0 ? (
          this.state.jsonAcuerdos.map((acuerdo, indice) => {
            return (
              <div className="w-100 card">
                <div className="card-header">
                  <div className="row">
                    <div className="col-10 text-center my-auto row">
                      <div className="col-6">{acuerdo.tituloAcuerdo}</div>
                      <div className="col-3">
                        {acuerdo.laOtraPersona.nombre +
                          " " +
                          acuerdo.laOtraPersona.apellido1}
                      </div>
                      <div className="col-3">{acuerdo.pueblo}</div>
                    </div>
                    <div className="col-1 text-center my-auto">
                      {acuerdo.estadoAcuerdo == 0 ? (
                        <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip>
                              {t("acuerdosForm.estadoPendiente")}
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            className="text-secondary"
                            icon={faCircle}
                          />
                        </OverlayTrigger>
                      ) : null}
                    </div>
                    <div className="col-1 text-center my-auto">
                      <FontAwesomeIcon
                        style={{ cursor: "pointer" }}
                        size="2x"
                        icon={faCaretDown}
                        className=""
                        onClick={() => this.handleToogleCollapseAcuerdo(indice)}
                      />
                    </div>
                  </div>
                </div>
                <Collapse
                  className="card-body"
                  isOpened={this.state.acuerdosCollapseState[indice]}
                >
                  <div className="p-2">{acuerdo.descripcionAcuerdo}</div>
                </Collapse>
              </div>
            );
          })
        ) : (
          <div className="d-flex justify-content-center">
            <small className="text-danger my-auto">
              {t("acuerdosForm.noData")}
            </small>
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(AcuerdosForm);
