import React from "react";
import { connect } from "react-redux";
import { trans } from "../util/funciones";
import { changeFormContent } from "../redux/actions/app";

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
          className="d-flex justify-content-center btn btn-success"
          onClick= {() => changeFormContent('formAnuncio')}
      >{trans('tablaClientes.addAnuncio')}</div>
      );
    }

    return null;
  };

  render() {
    return this.botonAddAnuncio();
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TablaClientes);
