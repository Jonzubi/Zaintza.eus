import React from "react";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";

class LogInForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txtEmail: "",
      txtContrasena: ""
    };
  }

  handleLogIn(){
      const vEmail = this.state.txtEmail;
      const vContrasena = this.state.txtContrasena;

      console.log("Email:" + vEmail);
      console.log("Contrasena:" + vContrasena);

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
        if(typeof doc != "undefined"){
          console.table(doc);
        }else{
          console.log("No hay registros con esos datos");
        }
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
          <label for="exampleInputEmail1">Email</label>
          <input
            onChange={this.handleInputChange.bind(this)}
            type="email"
            class="form-control"
            id="txtEmail"
            aria-describedby="emailHelp"
            placeholder="Insertar email..."
          />
        </div>
        <div class="form-group">
          <label for="exampleInputPassword1">Contraseña</label>
          <input
            onChange={this.handleInputChange.bind(this)}
            type="password"
            class="form-control"
            id="txtContrasena"
            placeholder="Insertar contraseña..."
          />
        </div>
        <div class="form-group form-check">
          <input type="checkbox" class="form-check-input" id="exampleCheck1" />
          <label class="form-check-label" for="exampleCheck1">
            Recordarme
          </label>
        </div>
        <div className="btn-group mt-3">
          <button
            onClick={this.handleLogIn.bind(this)}
            name="btnLogIn"
            type="button"
            class="btn btn-primary"
          >
            Iniciar sesion
          </button>
          <button
            onClick={this.props.myHandleRegistrar}
            name="btnRegistrar"
            type="button"
            class="btn btn-success"
          >
            Registrarse
          </button>
        </div>
      </form>
    );
  }
}

export default LogInForm;
