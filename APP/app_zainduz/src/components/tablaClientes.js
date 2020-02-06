import React from "react";
import { connect } from "react-redux";
import { trans } from "../util/funciones";
import { changeFormContent } from "../redux/actions/app";
import axios from 'axios';
import cogoToast from 'cogo-toast';
import ipMaquina from "../util/ipMaquinaAPI";

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
    this.state = {
      jsonAnuncios: {}
    };
  }

  componentDidMount(){
    axios
      .get('http://' + ipMaquina + ':3001/api/procedures/getAnunciosConPerfil')
      .then(res => {
        this.setState({
          jsonAnuncios: res.data
        });
      })
      .catch(err => {
        cogoToast.error(<h5>{trans("notificaciones.servidorNoDisponible")}</h5>);
      });
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
    const { jsonAnuncios } = this.state;
    console.log(jsonAnuncios);
    return this.botonAddAnuncio();
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TablaClientes);
