import React from "react";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import {connect} from "react-redux";
import {changeFormContent} from "../redux/actions/app";
import {toogleMenuPerfil} from "../redux/actions/menuPerfil";
import {saveUserSession} from "../redux/actions/user";
import {toogleModal} from "../redux/actions/modalRegistrarse";

const mapDispatchToProps = dispatch => {
  return {
  changeFormContent: (form) => dispatch(changeFormContent(form)),
  toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload)),
  saveUserSession : (user) => dispatch(saveUserSession(user)),  
  toogleModal: (payload) => dispatch(toogleModal(payload))
  }
}
    

class LogInForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txtEmail: "",
      txtContrasena: "",
      objUsuario:{}
    };
  }

  handleLogIn(){
      const vEmail = this.state.txtEmail;
      const vContrasena = this.state.txtContrasena;
      var objFiltros = {
        email : vEmail,
        contrasena: vContrasena
      }

      axios.get("http://" + ipMaquina + ":3001/cuidador", {
        params : {
          filtros : JSON.stringify(objFiltros)
        }
      })
      .then(doc => {
        if(doc.data != "Vacio"){
          this.props.saveUserSession(doc.data[0]);
          this.props.toogleMenuPerfil(false);
        cogoToast.success(
          <h5>Sesion iniciada correctamente!</h5>
        );
        }else{
          cogoToast.error(
            <h5>Nombre de usuario o contraseña son incorrectos...</h5>
          );
        }
      }).catch(err => {
        cogoToast.error(
          <h5>Hay un error en la conexion...</h5>
        );
      });
  }

  handleInputChange(e) {
    var stateId = e.target.id;
    this.setState({
      [stateId]: e.target.value
    });
  }

  render() {
    return (
      <form className="mt-5">
        <div>
          <label htmlFor="txtEmail">Email</label>
          <input
            onChange={this.handleInputChange.bind(this)}
            type="email"
            className="form-control"
            id="txtEmail"
            aria-describedby="emailHelp"
            placeholder="Insertar email..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="txtContrasena">Contraseña</label>
          <input
            onChange={this.handleInputChange.bind(this)}
            type="password"
            className="form-control"
            id="txtContrasena"
            placeholder="Insertar contraseña..."
          />
        </div>
        <div className="form-group form-check">
          <input type="checkbox" className="form-check-input" id="chkRecordarme" />
          <label className="form-check-label" htmlFor="chkRecordarme">
            Recordarme
          </label>
        </div>
        <div className="btn-group mt-3">
          <button
            onClick={this.handleLogIn.bind(this)}
            name="btnLogIn"
            type="button"
            className="btn btn-primary"
          >
            Iniciar sesion
          </button>
          <button
            onClick={() => {this.props.toogleModal(true);this.props.toogleMenuPerfil(false)}}
            name="btnRegistrar"
            type="button"
            className="btn btn-success"
          >
            Registrarse
          </button>
        </div>
      </form>
    );
  }
}

export default connect(null, mapDispatchToProps)(LogInForm);
