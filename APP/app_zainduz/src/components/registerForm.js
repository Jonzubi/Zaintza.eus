import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMale, faFemale } from "@fortawesome/free-solid-svg-icons";
//import Modal from "boron";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import Avatar, { Avatar as AvatarUpload } from "react-avatar-edit";
import {ReactDatez as Calendario} from "react-datez";
import 'react-datez/dist/css/react-datez.css';

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txtNombre: "",
      txtApellido1: "",
      txtApellido2: "",
      txtEmail: "",
      txtSexo: "",
      txtFechaNacimiento: "",
      txtContrasena: "",
      txtDescripcion: "",
      avatarSrc: "",
      avatarPreview: ""
    };

    this.onCrop = this.onCrop.bind(this);
    this.onClose = this.onClose.bind(this);
    this.handleSexChange = this.handleSexChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRegistrarse = this.handleRegistrarse.bind(this);
    this.handleCalendarChange = this.handleCalendarChange.bind(this);
  }

  onClose() {
    this.setState({ avatarPreview: null });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  handleCalendarChange(valor){
    this.setState({
      txtFechaNacimiento:valor
    });
  }

  handleInputChange(e) {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    var stateId = e.target.id;
    this.setState({
      [stateId]: e.target.value
    });
  }

  handleSexChange(sex) {
    this.setState({
      txtSexo: sex
    });
  }

  handleRegistrarse() {
    /*TODO primero validar todo

    */
    //TODO llamar a la api para insertar

    var formData = {
      nombre: this.state.txtNombre,
      apellido1: this.state.txtApellido1,
      apellido2: this.state.txtApellido2,
      sexo: this.state.txtSexo,
      email: this.state.txtEmail,
      contrasena: this.state.txtContrasena,
      descripcion: this.state.txtDescripcion
    };

    axios
      .post("http://" + ipMaquina + ":3001/cuidador", formData)
      .then(resultado => {
        return <h1>Insert hechooooooooooo</h1>;
      })
      .catch(err => {});
    console.log(this.state);
  }

  render() {
    return (
      <div
        className="border border-dark rounded p-5"
        style={{ margin: "10rem", marginTop: "5rem" }}
      >
        <form>
          <div className="form-group row">
            <div className="form-group col">
              {/* Meter un componente para subir imagen */}

              <Avatar
                label="Elige tu Avatar"
                height={200}
                width={200}
                onCrop={this.onCrop}
                onClose={this.onClose}
                src={this.state.avatarSrc}
              />
            </div>
            <div className="form-group col">
              <div class="form-group">
                <label for="exampleInputEmail1">Nombre</label>
                <input
                  onChange={this.handleInputChange}
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
                    onChange={this.handleInputChange}
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
                    onChange={this.handleInputChange}
                    type="text"
                    class="form-control"
                    id="txtApellido2"
                    aria-describedby="txtNombreHelp"
                    placeholder="Introducir apellido 2..."
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <div className="form-group col-6">
              <label for="txtFechaNacimiento">Fecha de nacimiento</label><br/>
              <Calendario inputStyle={{width:"100%"}} className="w-100" allowPast={true} allowFuture={false} id="txtFechaNacimiento" handleChange = {this.handleCalendarChange} value={this.state.txtFechaNacimiento} />
            </div>
            <div
              className="form-group col-3 text-center p-1"
              onClick={() => this.handleSexChange("M")}
              id="txtSexM"
              style={{borderRadius:"8px" , cursor: "pointer", background: this.state.txtSexo == "M" ? "#28a745" : "", color: this.state.txtSexo == "M" ? "white" : "black" }}
            >
              <FontAwesomeIcon className="fa-5x" icon={faMale} />
            </div>
            <div
              className="form-group col-3 text-center p-1"
              id="txtSexF"
              onClick={() => this.handleSexChange("F")}
              style={{borderRadius:"8px" ,cursor: "pointer", background: this.state.txtSexo == "F" ? "#28a745" : "", color: this.state.txtSexo == "F" ? "white" : "black" }}
            >
              <FontAwesomeIcon className="fa-5x" icon={faFemale} />
            </div>
          </div>

          <div className="form-group row">
            <div class="form-group col">
              <label for="exampleInputEmail1">Email</label>
              <input
                onChange={this.handleInputChange}
                type="email"
                class="form-control"
                id="txtEmail"
                aria-describedby="emailHelp"
                placeholder="Introducir email..."
              />
            </div>
            <div class="form-group col">
              <label for="exampleInputPassword1">Contraseña</label>
              <input
                onChange={this.handleInputChange}
                type="password"
                class="form-control"
                id="txtContrasena"
                placeholder="Introducir contraseña..."
              />
            </div>
          </div>

          <div class="form-group">
            <label for="comment">Descripcion</label>
            <textarea
              onChange={this.handleInputChange}
              class="form-control"
              rows="5"
              id="txtDescripcion"
              placeholder="Tu descripcion..."
            ></textarea>
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
