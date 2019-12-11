import React from "react";
import { Collapse } from "react-collapse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCircle } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { t } from "../util/funciones";

const mapStateToProps = state => {
  return {
    idPerfil: state.user._id
  };
};

class AcuerdosForm extends React.Component {
  componentDidMount() {
    axios
      .get("http://" + ipMaquina + ":3001/acuerdo", {
        params: {
          idCliente: this.props.idPerfil
        }
      })
      .then(resultado => {
        {
          /* En estas lineas inicializo un array donde guardara el estado de los collapse que van a se los acuerdos. Por cada acuerdo guardara un false al inicio */
        }
        let countAcuerdos = resultado.data.length;
        let auxAcuerdosCollapseState = [];
        for (let i = 0; i < countAcuerdos; i++) {
          auxAcuerdosCollapseState.push(false);
        }

        this.setState({
          jsonAcuerdos: resultado.data,
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
      jsonAcuerdos: {},
      acuerdosCollapseState: []
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
      <div className="p-5">
        {typeof this.state.jsonAcuerdos.map != "undefined"
          ? this.state.jsonAcuerdos.map((acuerdo, indice) => {              
              return (
                <div className="w-100 card">
                  <div className="card-header">
                    <div className="row">
                      <div className="col-6 text-center">{acuerdo.tituloAcuerdo}</div>
                      <div className="col-4 text-center">
                        {acuerdo.estadoAcuerdo == 0 ? (
                          <div className="row">
                            <div className="col-10">
                              {t("acuerdosForm.estadoPendiente")}
                            </div>
                            <div className="col-2">
                              <FontAwesomeIcon
                                className="text-secondary"
                                icon={faCircle}
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="col-2 text-center">
                        <FontAwesomeIcon
                          style={{ cursor: "pointer" }}
                          size="2x"
                          icon={faCaretDown}
                          className=""
                          onClick={() =>
                            this.handleToogleCollapseAcuerdo(indice)
                          }
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
          : null}
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(AcuerdosForm);
