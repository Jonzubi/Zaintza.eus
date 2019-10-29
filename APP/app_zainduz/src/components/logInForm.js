import React from "react";

class LogInForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txtEmail: "",
      txtContrasena: ""
    };
  }

  handleLogIn(){
      const email = this.state.txtEmail;
      const contrasena = this.state.txtContrasena;

      console.log("Email:" + email);
      console.log("Contrasena" + contrasena);
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
