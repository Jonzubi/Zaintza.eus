import React from "react";
import Collapse from "react-bootstrap/Collapse";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import Button from "react-bootstrap/Button";

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
                  <div className="card-header">{acuerdo.tituloAcuerdo} <button className="float-right" value="Ikusi" onClick={() => this.handleToogleCollapseAcuerdo(indice)} /></div>
                  <Collapse
                    className="card-body"
                    in={this.state.acuerdosCollapseState[indice]}                   
                  >
                    <div>{acuerdo.descripcionAcuerdo}</div>
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
