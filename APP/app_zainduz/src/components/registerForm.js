import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMale, faFemale, faPlus } from "@fortawesome/free-solid-svg-icons";
import AddDiasDisponible from "../util/iconos/addDiasDisponible.svg";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import Avatar, { Avatar as AvatarUpload } from "react-avatar-edit";
import cogoToast from "cogo-toast";
import { ReactDatez as Calendario } from "react-datez";
import Switch from "react-switch";
import TimeInput from "react-time-input";
import "react-datez/dist/css/react-datez.css";
import loadGif from "../util/gifs/loadGif.gif";

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
      txtMovil: "",
      txtTelefono: "",
      diasDisponible: [],
      txtDescripcion: "",
      isPublic: true,
      avatarSrc: "",
      avatarPreview: "",
      hoverSexoM: false,
      hoverSexoF: false,
      isLoading: false
    };

    this.onCrop = this.onCrop.bind(this);
    this.onClose = this.onClose.bind(this);
    this.handleSexChange = this.handleSexChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRegistrarse = this.handleRegistrarse.bind(this);
    this.handleCalendarChange = this.handleCalendarChange.bind(this);
    this.handleIsPublicChange = this.handleIsPublicChange.bind(this);
    this.addDiasDisponible = this.addDiasDisponible.bind(this);
  }

  onClose() {
    this.setState({ avatarPreview: null });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  handleCalendarChange(valor) {
    this.setState({
      txtFechaNacimiento: valor
    });
  }

  handleIsPublicChange(valor) {
    this.setState({
      isPublic: valor
    });
  }

  addDiasDisponible() {
    let auxDiasDisponible = this.state.diasDisponible;
    auxDiasDisponible.push({
      dia: "",
      horaInicio: "00:00",
      horaFin: "00:00"
    });
    console.log(auxDiasDisponible);
    this.setState({
      diasDisponible: auxDiasDisponible
    });
  }

  handleInputChange(e) {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    var stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    if (stateId == "txtMovil" || stateId == "txtTelefono") {
      if (e.target.value.toString() > 9) {
        e.target.value = e.target.value.slice(0, 9);
      }
    }
    this.setState({
      [stateId]: e.target.value
    });
  }

  handleSexChange(sex) {
    this.setState({
      txtSexo: sex
    });
  }

  handleSexHover(sex) {
    this.setState({ [sex]: true });
  }

  handleSexLeave(sex) {
    this.setState({ [sex]: false });
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
      descripcion: this.state.txtDescripcion,
      telefono: {
        movil: {
          etiqueta: "Movil",
          numero: this.state.txtMovil
        },
        fijo: {
          etiqueta: "Fijo",
          numero: this.state.txtTelefono
        }
      }
    };

    this.setState({ isLoading: true });

    axios
      .post("http://" + ipMaquina + ":3001/cuidador", formData)
      .then(resultado => {
        this.setState({
          txtNombre: "",
          txtApellido1: "",
          txtApellido2: "",
          txtEmail: "",
          txtSexo: "",
          txtFechaNacimiento: "",
          txtContrasena: "",
          txtMovil: "",
          txtTelefono: "",
          txtDescripcion: "",
          avatarSrc: "",
          avatarPreview: "",
          hoverSexoM: false,
          hoverSexoF: false,
          isLoading: false
        });
        cogoToast.success(
          <div>
            <h5>Registro completado correctamente!</h5>
            <small>
              <b>Gracias por confiar en Zainduz</b>
            </small>
          </div>
        );
      })
      .catch(err => {});
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
                  value={this.state.txtNombre}
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
                    value={this.state.txtApellido1}
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
                    value={this.state.txtApellido2}
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <div className="form-group col-6">
              <label for="txtFechaNacimiento">Fecha de nacimiento</label>
              <br />
              <Calendario
                dateFormat="YYYY/MM/DD"
                inputClassName="form-control"
                inputStyle={{ width: "100%" }}
                className="w-100"
                allowPast={true}
                allowFuture={false}
                id="txtFechaNacimiento"
                handleChange={this.handleCalendarChange}
                value={this.state.txtFechaNacimiento}
              />
            </div>
            <div
              className="form-group col-3 text-center p-1"
              onClick={() => this.handleSexChange("M")}
              onMouseEnter={() => this.handleSexHover("hoverSexoM")}
              onMouseLeave={() => this.handleSexLeave("hoverSexoM")}
              id="txtSexM"
              style={{
                borderRadius: "8px",
                cursor: "pointer",
                background:
                  this.state.txtSexo == "M"
                    ? "#28a745"
                    : this.state.hoverSexoM
                    ? "#545b62"
                    : "",
                color:
                  this.state.txtSexo == "M" || this.state.hoverSexoM
                    ? "white"
                    : "black"
              }}
            >
              <FontAwesomeIcon className="fa-5x" icon={faMale} />
            </div>
            <div
              className="form-group col-3 text-center p-1"
              id="txtSexF"
              onClick={() => this.handleSexChange("F")}
              onMouseEnter={() => this.handleSexHover("hoverSexoF")}
              onMouseLeave={() => this.handleSexLeave("hoverSexoF")}
              style={{
                borderRadius: "8px",
                cursor: "pointer",
                background:
                  this.state.txtSexo == "F"
                    ? "#28a745"
                    : this.state.hoverSexoF
                    ? "#545b62"
                    : "",
                color:
                  this.state.txtSexo == "F" || this.state.hoverSexoF
                    ? "white"
                    : "black"
              }}
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
                value={this.state.txtEmail}
              />
              <label className="pt-2" for="exampleInputPassword1">
                Contraseña
              </label>
              <input
                onChange={this.handleInputChange}
                type="password"
                class="form-control"
                id="txtContrasena"
                placeholder="Introducir contraseña..."
                value={this.state.txtContrasena}
              />
            </div>
            <div class="form-group col">
              <label for="">Telefono Movil</label>
              <input
                onChange={this.handleInputChange}
                type="number"
                class="form-control"
                id="txtMovil"
                aria-describedby="emailHelp"
                placeholder="Introducir movil..."
                value={this.state.txtMovil}
              />
              <label className="pt-2" for="">
                Telefono Fijo
              </label>
              <input
                onChange={this.handleInputChange}
                type="number"
                class="form-control"
                id="txtTelefono"
                placeholder="Introducir telefono fijo..."
                value={this.state.txtTelefono}
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="form-group col">
              {/* Insertar dias disponibles aqui */}
              <label className="w-100 text-center lead">Dias Disponible:</label>
              <br />
              <div className="w-100 mt-2" id="diasDisponible">
                {/* Aqui iran los dias dinamicamente */}
                {this.state.diasDisponible.map((objDia, indice) => {
                 return( <div
                    className="col-6 text-center d-flex justify-content-center"
                    id={"diaDisponible" + indice}
                  >
                    <div className="w-100">
                      <select className="d-inline" id={"dias" + indice}>
                        <option>Elige un dia</option>
                        <option>Lunes</option>
                        <option>Martes</option>
                        <option>Miercoles</option>
                        <option>Jueves</option>
                        <option>Viernes</option>
                        <option>Sabado</option>
                        <option>Domingo</option>
                      </select><br/>
                      <TimeInput initTime="00:00" className="mt-1 text-center d-inline form-control" />
                      <TimeInput initTime="00:00" className="mt-1 text-center d-inline form-control" />
                    </div>
                    
                  </div>);
                })}
                <img
                  style={{ cursor: "pointer" }}
                  src={AddDiasDisponible}
                  onClick={this.addDiasDisponible}
                  width="70px"
                  height="70px"
                />
              </div>
            </div>
            <div className="form-group col">
              {/* Insertar ubicaciones disponibles aqui */}
            </div>
          </div>
          <div className="form-group row">
            <div className="form-group col">
              {/* Insertar publico disponibles aqui */}
            </div>
            <div className="form-group col">
              {/* Insertar precioPublico disponibles aqui */}
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
              value={this.state.txtDescripcion}
            ></textarea>
          </div>

          <div>
            <Switch
              onChange={this.handleIsPublicChange}
              checked={this.state.isPublic}
              id="isPublic"
            />
            <br />
            <small>Publicar automáticamente despues del registro</small>
          </div>

          <div id="loaderOrButton" className="w-100 mt-5 text-center">
            {this.state.isLoading ? (
              <img src={loadGif} height={50} width={50} />
            ) : (
              <button
                onClick={this.handleRegistrarse}
                type="button"
                className="w-100 btn btn-success "
              >
                Registrarse
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }
}

export default RegisterForm;
