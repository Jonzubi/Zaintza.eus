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

const mapDispatchToProps = dispatch => {
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
    const { tipoUsuario, changeFormContent } = this.props;

    if (tipoUsuario === "Cliente") {
      return (
        <div 
          className="w-100 float-bottom btn btn-success"
          onClick= {() => changeFormContent('formAnuncio')}
        >Añadir anuncio</div>
      );
    }

    return null;
  };

  render() {
    return this.botonAddAnuncio();
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TablaClientes);
