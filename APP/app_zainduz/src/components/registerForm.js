import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMale,
  faFemale,
  faPlusCircle,
  faMinusCircle,
  faPlusSquare
} from "@fortawesome/free-solid-svg-icons";
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
import imgNino from "../util/images/nino.png";
import imgNecesidadEspecial from "../util/images/genteConNecesidadesEspeciales.png";
import imgTerceraEdad from "../util/images/terceraEdad.png";
import {getRandomString} from "../util/funciones";

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
      publicoDisponible: {
        nino: false,
        terceraEdad: false,
        necesidadEspecial: false
      },
      precioPorPublico: {
        nino: "",
        terceraEdad: "",
        necesidadEspecial: ""
      },
      ubicaciones: [],
      txtDescripcion: "",
      isPublic: true,
      avatarSrc: "",
      avatarPreview: "",
      hoverSexoM: false,
      hoverSexoF: false,
      isLoading: false,
      auxAddPueblo: "",
      hoverNino: false,
      hoverTerceraEdad: false,
      hoverNecesidadEspecial: false
    };

    this.onCrop = this.onCrop.bind(this);
    this.onClose = this.onClose.bind(this);
    this.handleSexChange = this.handleSexChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRegistrarse = this.handleRegistrarse.bind(this);
    this.handleCalendarChange = this.handleCalendarChange.bind(this);
    this.handleIsPublicChange = this.handleIsPublicChange.bind(this);
    this.addDiasDisponible = this.addDiasDisponible.bind(this);
    this.removeDiasDisponible = this.removeDiasDisponible.bind(this);
    this.handleDiasDisponibleChange = this.handleDiasDisponibleChange.bind(
      this
    );
    this.handleAuxAddPuebloChange = this.handleAuxAddPuebloChange.bind(this);
    this.handleAddPueblo = this.handleAddPueblo.bind(this);
    this.handleRemovePueblo = this.handleRemovePueblo.bind(this);
    this.handlePublicoHover = this.handlePublicoHover.bind(this);
    this.handlePublicoLeave = this.handlePublicoLeave.bind(this);
    this.handlePublicoChange = this.handlePublicoChange.bind(this);
    this.handlePrecioChange = this.handlePrecioChange.bind(this);
  }

  onClose() {
    this.setState({ avatarPreview: null });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    console.log(elem.target.files[0].size);
    if (elem.target.files[0].size > 71680) {
      cogoToast.error(<h5>La imagen es demasiado grande!</h5>);
      elem.target.value = "";
    }
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

  handleAuxAddPuebloChange(e) {
    this.setState({
      auxAddPueblo: e.target.value
    });
  }

  handleAddPueblo() {
    let pueblo = this.state.auxAddPueblo;
    if (pueblo == "") return;
    for (var clave in this.state.ubicaciones) {
      if (this.state.ubicaciones[clave] == pueblo) {
        cogoToast.error(<h5>Ese pueblo ya esta insertado!</h5>);
        return;
      }
    }
    this.state.ubicaciones.push(pueblo);
    this.setState({
      ubicaciones: this.state.ubicaciones,
      auxAddPueblo: ""
    });
  }

  handleRemovePueblo() {
    this.setState({
      ubicaciones:
        typeof this.state.ubicaciones.pop() != "undefined"
          ? this.state.ubicaciones
          : []
    });
  }

  addDiasDisponible() {
    let auxDiasDisponible = this.state.diasDisponible;
    auxDiasDisponible.push({
      dia: 0,
      horaInicio: "00:00",
      horaFin: "00:00"
    });

    this.setState({
      diasDisponible: auxDiasDisponible
    });
  }

  handleDiasDisponibleChange(e, indice) {
    if (typeof indice == "undefined") {
      //Significa que lo que se ha cambiado es el combo de los dias
      var origen = e.target;
      var indice = parseInt(origen.id.substr(origen.id.length - 1));
      var valor = origen.value;

      let auxDiasDisponible = this.state.diasDisponible;
      auxDiasDisponible[indice]["dia"] = valor;

      this.setState({
        diasDisponible: auxDiasDisponible
      });
    } else {
      //Significa que ha cambiado la hora, no se sabe si inicio o fin, eso esta en "indice"
      let atributo = indice.substr(0, indice.length - 1);
      indice = indice.substr(indice.length - 1);

      let auxDiasDisponible = this.state.diasDisponible;
      auxDiasDisponible[indice][atributo] = e;

      this.setState({
        diasDisponible: auxDiasDisponible
      });
    }

    console.log(this.state.diasDisponible);
  }

  removeDiasDisponible() {
    this.setState({
      diasDisponible:
        typeof this.state.diasDisponible.pop() != "undefined"
          ? this.state.diasDisponible
          : []
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

  handlePublicoHover(publico) {
    this.setState({
      [publico]: true
    });
  }

  handlePublicoLeave(publico) {
    this.setState({
      [publico]: false
    });
  }

  handlePublicoChange(publico) {
    let auxPublicoDisponible = this.state.publicoDisponible;
    auxPublicoDisponible[publico] = !auxPublicoDisponible[publico];
    this.setState({
      publicoDisponible: auxPublicoDisponible
    });
  }

  handlePrecioChange(atributo, valor) {
    let auxPrecioPublico = this.state.precioPorPublico;
    auxPrecioPublico[atributo] = valor;
    this.setState({
      precioPorPublico: auxPrecioPublico
    });
  }

  handleRegistrarse() {
    /*TODO primero validar todo
    
    */
    //TODO llamar a la api para insertar
    this.setState({ isLoading: true });

    var codAvatar = getRandomString(20);
    axios
      .post("http://" + ipMaquina + ":3001/avatar/" + codAvatar, {
        avatarB64: this.state.avatarPreview
      })
      .then(done => {
        var formData = {
          nombre: this.state.txtNombre,
          apellido1: this.state.txtApellido1,
          apellido2: this.state.txtApellido2,
          sexo: this.state.txtSexo,
          direcFoto: codAvatar,
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
          },
          isPublic: this.state.isPublic,
          diasDisponible: this.state.diasDisponible,
          fechaNacimiento: this.state.txtFechaNacimiento,
          ubicaciones: this.state.ubicaciones,
          publicoDisponible: this.state.publicoDisponible,
          precioPorPublico: this.state.precioPorPublico
        };

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
              diasDisponible: [],
              publicoDisponible: {
                nino: false,
                terceraEdad: false,
                necesidadEspecial: false
              },
              precioPorPublico: {
                nino: "",
                terceraEdad: "",
                necesidadEspecial: ""
              },
              ubicaciones: [],
              txtDescripcion: "",
              isPublic: true,
              avatarSrc: "",
              avatarPreview: "",
              hoverSexoM: false,
              hoverSexoF: false,
              isLoading: false,
              auxAddPueblo: "",
              hoverNino: false,
              hoverTerceraEdad: false,
              hoverNecesidadEspecial: false
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
          .catch(err => {
            this.setState({
              isLoading: false
            });
            cogoToast.error(<h5>Algo ha ido mal!</h5>);
          });
      })
      .catch(err => {
        this.setState({
          isLoading: false
        });
        cogoToast.error(<h5>Algo ha ido mal!</h5>);
      });
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
                onBeforeFileLoad={this.onBeforeFileLoad}
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
              <label className="w-100 text-center lead">Dias disponible:</label>
              <br />
              <div className="w-100 mt-2" id="diasDisponible">
                {/* Aqui iran los dias dinamicamente */}
                {this.state.diasDisponible.map((objDia, indice) => {
                  return (
                    <div
                      className="col-6 mx-auto text-center"
                      id={"diaDisponible" + indice}
                    >
                      <div className="form-control mt-4 w-100">
                        <select
                          value={this.state.diasDisponible[indice].dia}
                          onChange={this.handleDiasDisponibleChange}
                          className="d-inline"
                          id={"dia" + indice}
                        >
                          <option>Elige un dia</option>
                          <option value="1">Lunes</option>
                          <option value="2">Martes</option>
                          <option value="3">Miercoles</option>
                          <option value="4">Jueves</option>
                          <option value="5">Viernes</option>
                          <option value="6">Sabado</option>
                          <option value="7">Domingo</option>
                        </select>
                        <br />
                        <br />
                        <b>Hora de inicio :</b>
                        <TimeInput
                          onTimeChange={valor => {
                            this.handleDiasDisponibleChange(
                              valor,
                              "horaInicio" + indice
                            );
                          }}
                          id={"horaInicio" + indice}
                          initTime={
                            this.state.diasDisponible[indice].horaInicio !=
                            "00:00"
                              ? this.state.diasDisponible[indice].horaInicio
                              : "00:00"
                          }
                          className="mt-1 text-center d-inline form-control"
                        />
                        <br />
                        <b>Hora de fin :</b>
                        <TimeInput
                          onTimeChange={valor => {
                            this.handleDiasDisponibleChange(
                              valor,
                              "horaFin" + indice
                            );
                          }}
                          id={"horaFin" + indice}
                          initTime={
                            this.state.diasDisponible[indice].horaFin != "00:00"
                              ? this.state.diasDisponible[indice].horaFin
                              : "00:00"
                          }
                          className="mt-1 text-center d-inline form-control"
                        />
                        <br />
                        <br />
                      </div>
                    </div>
                  );
                })}
                <div id="botonesDiasDisponible" className="w-100 mt-2">
                  {this.state.diasDisponible.length > 0 ? (
                    <a
                      onClick={this.removeDiasDisponible}
                      className="btn btn-danger float-left text-light"
                    >
                      Eliminar dia <FontAwesomeIcon icon={faMinusCircle} />
                    </a>
                  ) : (
                    ""
                  )}
                  <a
                    onClick={this.addDiasDisponible}
                    className="btn btn-success float-right text-light"
                  >
                    Añadir <FontAwesomeIcon icon={faPlusCircle} />
                  </a>
                </div>
              </div>
            </div>
            <div className="form-group col">
              {/* Insertar ubicaciones disponibles aqui */}
              <label className="w-100 text-center lead">
                Pueblos disponible:
              </label>
              <div class="form-group mt-2">
                <input
                  onChange={this.handleAuxAddPuebloChange}
                  class="form-control d-inline w-75"
                  id="txtAddPueblos"
                  placeholder="Introduce el pueblo..."
                  value={this.state.auxAddPueblo}
                />
                <a
                  onClick={this.handleAddPueblo}
                  className="btn btn-success float-right text-light"
                >
                  Añadir <FontAwesomeIcon icon={faPlusCircle} />
                </a>
                {this.state.ubicaciones.length > 0 ? (
                  <h5 className="mt-2 lead">Pueblos Seleccionados:</h5>
                ) : (
                  ""
                )}

                <ul className="list-group">
                  {this.state.ubicaciones.map(pueblo => {
                    return <li className="list-group-item">{pueblo}</li>;
                  })}
                </ul>
                {this.state.ubicaciones.length > 0 ? (
                  <a
                    onClick={this.handleRemovePueblo}
                    className="mt-4 btn btn-danger float-right text-light"
                  >
                    Eliminar pueblo <FontAwesomeIcon icon={faMinusCircle} />
                  </a>
                ) : (
                  ""
                )}
              </div>
              <br />
            </div>
          </div>
          <div className="form-group row">
            <div className="form-group col">
              {/* Insertar publico disponibles aqui */}
              <label className="w-100 text-center lead">
                Público disponible:
              </label>
              <div className="row md-2">
                <div
                  onClick={() => {
                    this.handlePublicoChange("nino");
                  }}
                  onMouseEnter={() => {
                    this.handlePublicoHover("hoverNino");
                  }}
                  onMouseLeave={() => {
                    this.handlePublicoLeave("hoverNino");
                  }}
                  className="col-4 text-center p-1"
                  style={{
                    background: this.state.publicoDisponible.nino
                      ? "#28a745"
                      : this.state.hoverNino
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgNino} className="w-100 h-100" />
                  <small className="font-weight-bold">Niños</small>
                </div>
                <div
                  onClick={() => {
                    this.handlePublicoChange("terceraEdad");
                  }}
                  onMouseEnter={() => {
                    this.handlePublicoHover("hoverTerceraEdad");
                  }}
                  onMouseLeave={() => {
                    this.handlePublicoLeave("hoverTerceraEdad");
                  }}
                  className="col-4 text-center p-1"
                  style={{
                    background: this.state.publicoDisponible.terceraEdad
                      ? "#28a745"
                      : this.state.hoverTerceraEdad
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgTerceraEdad} className="w-100 h-100" />
                  <small className="font-weight-bold">Tercera edad</small>
                </div>
                <div
                  onClick={() => {
                    this.handlePublicoChange("necesidadEspecial");
                  }}
                  onMouseEnter={() => {
                    this.handlePublicoHover("hoverNecesidadEspecial");
                  }}
                  onMouseLeave={() => {
                    this.handlePublicoLeave("hoverNecesidadEspecial");
                  }}
                  className="col-4 text-center p-1"
                  style={{
                    background: this.state.publicoDisponible.necesidadEspecial
                      ? "#28a745"
                      : this.state.hoverNecesidadEspecial
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgNecesidadEspecial} className="w-100 h-100" />
                  <small className="font-weight-bold">
                    Necesidades especiales
                  </small>
                </div>
              </div>
            </div>
            <div className="form-group col">
              {/* Insertar precioPublico disponibles aqui */}
              <label className="w-100 text-center lead">
                Precio para cada publico:
              </label>
              <div className="list-group md-2">
                {this.state.publicoDisponible.nino ? (
                  <div className="list-group-item form-group text-center p-1">
                    <small>
                      <b>Niños</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange("nino", event.target.value);
                      }}
                      className="form-control"
                      type="number"
                      placeholder="Introducir precio €/h"
                    />
                  </div>
                ) : (
                  <div className="list-group-item form-group text-center p-1">
                    <small>
                      <b>Niños</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange("nino", event.target.value);
                      }}
                      className="form-control"
                      disabled
                      type="number"
                      placeholder="Introducir precio €/h"
                    />
                  </div>
                )}

                {this.state.publicoDisponible.terceraEdad ? (
                  <div className="list-group-item form-group text-center p-1">
                    <small>
                      <b>Tercera Edad</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange(
                          "terceraEdad",
                          event.target.value
                        );
                      }}
                      className="form-control"
                      type="number"
                      placeholder="Introducir precio €/h"
                    />
                  </div>
                ) : (
                  <div className="list-group-item form-group text-center p-1">
                    <small>
                      <b>Tercera Edad</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange(
                          "terceraEdad",
                          event.target.value
                        );
                      }}
                      disabled
                      className="form-control"
                      type="number"
                      placeholder="Introducir precio €/h"
                    />
                  </div>
                )}

                {this.state.publicoDisponible.necesidadEspecial ? (
                  <div className="list-group-item form-group text-center p-1">
                    <small>
                      <b>Necesidades especiales</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange(
                          "necesidadEspecial",
                          event.target.value
                        );
                      }}
                      className="form-control"
                      type="number"
                      placeholder="Introducir precio €/h"
                    />
                  </div>
                ) : (
                  <div className="list-group-item form-group text-center p-1">
                    <small>
                      <b>Necesidades especiales</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange(
                          "necesidadEspecial",
                          event.target.value
                        );
                      }}
                      disabled
                      className="form-control"
                      type="number"
                      placeholder="Introducir precio €/h"
                    />
                  </div>
                )}
              </div>
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
