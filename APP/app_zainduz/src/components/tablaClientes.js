import React from "react";
import { connect } from "react-redux";
import { changeFormContent } from "../redux/actions/app";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

const mapStateToProps = state => {
  return {
    tipoUsuario: state.user.tipoUsuario
  };
};

const mapDispatcToProps = dispatch => {
  return {
    changeFormContent: form => dispatch(changeFormContent(form))
  };
};

class TablaClientes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  botonAddAnuncio = () => {
    const { tipoUsuario } = this.props;

    if (tipoUsuario === "Cliente") {
      return (
        <div className="w-100 float-bottom btn btn-success">Añadir anuncio</div>
      );
    }

    return null;
  };

  render() {
    return this.botonAddAnuncio();
  }
}

export default connect(mapStateToProps, mapDispatcToProps)(TablaClientes);
