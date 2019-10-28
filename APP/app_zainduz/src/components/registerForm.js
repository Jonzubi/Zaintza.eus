import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMale, faFemale } from "@fortawesome/free-solid-svg-icons";

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  handleInputChange(){
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
  }

  handleRegistrarse() {
    /*TODO primero validar todo

    */
    //TODO llamar a la api para insertar
  }

  render() {
    return (
      <div
        className="border border-dark rounded p-5"
        style={{ margin: "10rem", marginTop:"5rem" }}
      >
        <form>
          <div class="form-group">
            <label for="exampleInputEmail1">Nombre</label>
            <input
              type="text"
              class="form-control"
              id="txtNombre"
              aria-describedby="txtNombreHelp"
              placeholder="Introducir nombre..."
            />
          </div>
          <div class="form-group row">
            <div className="form-group col">
              <label for="exampleInputEmail1">Apellido 1</label>
              <input
                type="text"
                class="form-control"
                id="txtApellido1"
                aria-describedby="txtNombreHelp"
                placeholder="Introducir apellido 1..."
              />
            </div>
            <div className="form-group col">
              <label for="exampleInputEmail1">Apellido 2</label>
              <input
                type="text"
                class="form-control"
                id="txtApellido2"
                aria-describedby="txtNombreHelp"
                placeholder="Introducir apellido 2..."
              />
            </div>
          </div>
          {/****************************************
          Meter fecha nacimiento aqui en un futuro        
         *****************************************/}

          <div class="form-group row">
            <div className="form-group col-6 text-center">
              <FontAwesomeIcon
                style={{ cursor: "pointer" }}
                className="fa-5x"
                icon={faMale}
              />
            </div>
            <div className="form-group col-6 text-center">
              <FontAwesomeIcon
                style={{ cursor: "pointer" }}
                className="fa-5x"
                icon={faFemale}
              />
            </div>
          </div>

          <div className="form-group row">
            <div class="form-group col">
              <label for="exampleInputEmail1">Email</label>
              <input
                type="email"
                class="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="Introducir email..."
              />
            </div>
            <div class="form-group col">
              <label for="exampleInputPassword1">Contraseña</label>
              <input
                type="password"
                class="form-control"
                id="exampleInputPassword1"
                placeholder="Introducir contraseña..."
              />
            </div>
          </div>

          <div class="form-group">
            <label for="comment">Descripcion</label>
            <textarea class="form-control" rows="5" id="comment" placeholder="Tu descripcion..."></textarea>
          </div>
          <button
            onClick={this.handleRegistrarse}
            type="button"
            className="w-100 mt-5 btn btn-success text-center"
          >
            Registrarse
          </button>
        </form>
      </div>
    );
  }
}

export default RegisterForm;
