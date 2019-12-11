import React from "react";
import {Collapse} from "react-collapse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCaretDown
} from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";

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
                  <div className="card-header">{acuerdo.tituloAcuerdo} <FontAwesomeIcon style={{cursor: "pointer"}} icon={faCaretDown} className="float-right" onClick={() => this.handleToogleCollapseAcuerdo(indice)} /></div>
                  <Collapse
                    className="card-body"
                    isOpened={this.state.acuerdosCollapseState[indice]}                   
                  >
                    <div className="p-5">{acuerdo.descripcionAcuerdo}</div>
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
