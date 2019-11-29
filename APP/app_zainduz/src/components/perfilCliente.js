import React from "react";
import Avatar from "react-avatar-edit";
import {connect} from "react-redux";
import {changeFormContent} from "../redux/actions/app";
import ipMaquina from "../util/ipMaquinaAPI";

const mapStateToProps = state => {
    console.log(state);
    //Aqui van los especialitos de los undefined
    const movil = typeof state.user.telefono.movil == "undefined" ? undefined : state.user.telefono.movil.numero;
    const telefFijo = typeof state.user.telefono.fijo == "undefined" ? undefined : state.user.telefono.fijo.numero;
    return {
        nombre: state.user.nombre,
        apellido1: state.user.apellido1,
        apellido2: state.user.apellido2,
        email: state.user.email,
        direcFoto: state.user.direcFoto,
        movil: movil,
        telefFijo: telefFijo
    }
}

const mapDispatchToProps = dispatch => {
    return {
         changeFormContent: (form) => dispatch(changeFormContent(form))
    }
}

class PerfilCliente extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      avatarPreview: "",
      txtNombre: "",
      txtApellido1: "",
      txtApellido2: "",
      txtEmail: "",
      txtContrasena: "",
      isLoading: false,
      error: {
        txtNombre: false,
        txtEmail: false,
        txtContrasena: false,
        txtMovil: false
      }
    };
  }

  render() {
    return (
      <div className="border border-dark rounded p-5">
        <div className="form-group d-flex justify-content-center position-relative">
          <img
            height={200}
            width={200}
            src={"http://" + ipMaquina + ":3001/image/" + this.props.direcFoto}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PerfilCliente);
