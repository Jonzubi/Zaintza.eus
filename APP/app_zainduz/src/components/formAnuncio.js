import React from "react";
import { connect } from 'react-redux';
import cogoToast from "cogo-toast";
import { trans, toBase64 } from "../util/funciones";
import ImageUploader from "react-images-upload";
import i18next from "i18next";
import TimeInput from "./customTimeInput";
import PuebloAutosuggest from "./pueblosAutosuggest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMale,
  faFemale,
  faPlusCircle,
  faMinusCircle,
  faPlusSquare,
  faClock,
  faHome,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import municipios from "../util/municipos";
import ipMaquina from "../util/ipMaquinaAPI";
import imgNecesidadEspecial from "../util/images/genteConNecesidadesEspeciales.png";
import imgTerceraEdad from "../util/images/terceraEdad.png";
import imgNino from "../util/images/nino.png";
import Axios from "axios";
import { changeFormContent } from "../redux/actions/app";
import ClipLoader from "react-spinners/ClipLoader";

const mapStateToProps = state => {
  return {
    _id: state.user._id,
    email: state.user.email,
    contrasena: state.user.contrasena
  }
}

const mapDispatchToProps = dispatch => {
  return{
    changeFormContent: (form) => dispatch(changeFormContent(form))
  }
}

class FormAnuncio extends React.Component {
  constructor(props) {
    super(props);

    this.requiredStates = [
      "txtTitulo",
      "txtDescripcion",
      "ubicaciones",
      "publicoCuidado",
      "diasDisponible"
    ]

    this.requiredStatesTraduc = {
      txtTitulo: "formAnuncio.titulo",
      txtDescripcion: "formAnuncio.descripcion",
      ubicaciones: "formAnuncio.puebloSeleccionado",
      publicoCuidado: "formAnuncio.publicoCuidado",
      diasDisponible: "formAnuncio.diasDisponible"
    }

    this.state = {
      imgAnuncio: null,
      txtTitulo: "",
      txtDescripcion: "",
      auxAddPueblo: "",
      suggestionsPueblos: [],
      diasDisponible: [{
        dia: 0,
        horaInicio: "00:00",
        horaFin: "00:00"
      }],
      publicoCuidado: "",
      precioCuidado: "", 
      hoverNino: false,
      hoverTerceraEdad: false,
      hoverNecesidadEspecial: false,
      ubicaciones: [],
      error: false,
      isLoading: false
    };

    this.onClose = this.onClose.bind(this);
    this.onCrop = this.onCrop.bind(this);
    this.onChangeContactImg = this.onChangeContactImg.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAuxAddPuebloChange = this.handleAuxAddPuebloChange.bind(this);
    this.getSuggestions = this.getSuggestions.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(
      this
    );
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(
      this
    );
    this.handleAddPueblo = this.handleAddPueblo.bind(this);
    this.handleRemovePueblo = this.handleRemovePueblo.bind(this);
    this.addDiasDisponible = this.addDiasDisponible.bind(this);
    this.removeDiasDisponible = this.removeDiasDisponible.bind(this);
    this.handleDiasDisponibleChange = this.handleDiasDisponibleChange.bind(
      this
    );
    this.handlePublicoChange = this.handlePublicoChange.bind(this);
    this.handlePublicoHover = this.handlePublicoHover.bind(this);
    this.handlePublicoLeave = this.handlePublicoLeave.bind(this);
    this.handlePrecioChange = this.handlePrecioChange.bind(this);
    this.handleSubirAnuncio = this.handleSubirAnuncio.bind(this);
  }

  onClose() {
    this.setState({ avatarPreview: "" });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(<h5>{trans("registerFormClientes.errorImgGrande")}</h5>);
      elem.target.value = "";
    }
  }

  onChangeContactImg(picture) {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgAnuncio: picture
    });
  }

  handleInputChange(e) {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    var stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    this.setState({
      [stateId]: e.target.value
    });
  }

  handleAuxAddPuebloChange(e, { newValue }) {
    this.setState({
      auxAddPueblo: newValue
    });
  }

  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  getSuggestions(value) {
    const escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue === "") {
      return [];
    }

    const regex = new RegExp("^" + escapedValue, "i");

    return municipios.filter(pueblo => regex.test(pueblo));
  }

  getSuggestionValue(suggestion) {
    return suggestion;
  }

  renderSuggestion(suggestion) {
    return <span>{suggestion}</span>;
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestionsPueblos: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestionsPueblos: []
    });
  };

  handleAddPueblo(c, { suggestion }) {
    this.setState({
      auxAddPueblo: suggestion
    }, () => {
      let pueblo = this.state.auxAddPueblo;
      if (pueblo == "") return;
      
      if (!municipios.includes(pueblo)) {
        cogoToast.error(
          <h5>
            {pueblo} {trans("registerFormCuidadores.errorPuebloNoExiste")}
          </h5>
        );
        return;
      }
    
      for (var clave in this.state.ubicaciones) {
        if (this.state.ubicaciones[clave] == pueblo) {
          cogoToast.error(
            <h5>
              {pueblo} {trans("registerFormCuidadores.errorPuebloRepetido")}
            </h5>
          );
          return;
        }
      }
      let auxUbicaciones = this.state.ubicaciones
      auxUbicaciones.push(pueblo);
      this.setState({
        ubicaciones: auxUbicaciones,
        auxAddPueblo: ""
      });
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

  removeDiasDisponible() {
    this.setState({
      diasDisponible:
        typeof this.state.diasDisponible.pop() != "undefined"
          ? this.state.diasDisponible
          : []
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
    this.setState({
      publicoCuidado: publico
    });
  }

  handlePrecioChange(valor) {
    this.setState({
      precioCuidado: valor
    });
  }

  async handleSubirAnuncio(){
    const { imgAnuncio, txtTitulo, precioCuidado, txtDescripcion, diasDisponible, publicoCuidado, ubicaciones } = this.state;
    const { _id, changeFormContent, email, contrasena } = this.props;
    for(let clave in this.requiredStates) {
      //Hago primero la comprobacion de null ya que .length no existe en un null y peta.
      if(this.state[this.requiredStates[clave]] === null){
        cogoToast.error(
          <h5>
            {trans("registerFormCuidadores.errorRellenaTodo")} (
            {trans(this.requiredStatesTraduc[this.requiredStates[clave]])})
          </h5>
        );
        this.setState({
          error: true
        });
        return;
      }
      if(this.state[this.requiredStates[clave]].length === 0){
        cogoToast.error(
          <h5>
            {trans("registerFormCuidadores.errorRellenaTodo")} (
            {trans(this.requiredStatesTraduc[this.requiredStates[clave]])})
          </h5>
        );
        this.setState({
          error: true
        });
        return;
      }
      //Hago una comporbacion diferente para los dias, para que haya elegido un dia en el combo
      if (this.requiredStates[clave] == "diasDisponible") {
        let error = false;
        const diasSinElegir = diasDisponible.filter(confDia => {
          return confDia.dia == 0 || isNaN(confDia.dia);          
        });
        if (diasSinElegir.length > 0) {
          cogoToast.error(
            <h5>{trans("registerFormCuidadores.errorDiaNoElegido")}</h5>
          );
          this.setState({
            error: true
          });
          return;
        }
      }
    }

    this.setState({
      isLoading: true
    }, async () => {
      let imgAnuncioB64;
      if(imgAnuncio !== null){
        imgAnuncioB64 = await toBase64(imgAnuncio[0]);
      }

      if (imgAnuncioB64 instanceof Error) {
        cogoToast.error(<h5>{trans("registerFormCuidadores.errorImagen")}</h5>);
        return;
      }

      //Aqui ira la llamada a la procedure para subir el anuncio
      let formData = {
        idCliente: _id,
        imgAnuncio: imgAnuncioB64,
        titulo: txtTitulo,
        descripcion: txtDescripcion,
        horario: diasDisponible,
        pueblo: ubicaciones,
        publico: publicoCuidado,
        precio: precioCuidado,
        email,
        contrasena
      }

      

      await Axios.post('http://' + ipMaquina + ':3001/api/procedures/postAnuncio', formData)
        .catch(err => {
        cogoToast.error(<h5>{trans('tablaCuidadores.errorGeneral')}</h5>)
        });

      cogoToast.success(
      <h5>{trans('formAnuncio.anuncioSubido')}</h5>
      );

      changeFormContent('tabla');
    });

    
  }

  render() {
    const { error, diasDisponible } = this.state;
    return (
      <div className="p-5">
        <div className="form-group d-flex justify-content-center position-relative">
          <ImageUploader
            fileContainerStyle={
              this.state.imgAnuncio != null ? { background: "#28a745" } : {}
            }
            buttonClassName={
              this.state.imgAnuncio != null ? "bg-light text-dark" : ""
            }
            errorClass="bg-danger text-light"
            fileSizeError="handiegia da"
            fileTypeError="ez du formatu zuzena"
            singleImage={true}
            label={
              this.state.imgAnuncio != null
                ? "Gehienez: 5MB | " +
                  this.state.imgAnuncio[0].name +
                  " (" +
                  (this.state.imgAnuncio[0].size / 1024 / 1024).toFixed(2) +
                  " MB)"
                : "Gehienez: 5MB | Gomendaturiko dimentsioa (288x300)"
            }
            labelClass={
              this.state.imgAnuncio != null ? "text-light font-weight-bold" : ""
            }
            withIcon={true}
            buttonText={
              this.state.imgAnuncio != null
                ? i18next.t("formAnuncio.eligeOtraFoto")
                : i18next.t("formAnuncio.eligeUnaFoto")
            }
            onChange={this.onChangeContactImg}
            imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
            maxFileSize={5242880}
          />
        </div>
        <div className="form-group row">
          <div className="col-12">
            <label htmlFor="txtTitulo">{trans("formAnuncio.titulo")}</label> (
            <span className="text-danger font-weight-bold">*</span>)
            <input
              onChange={this.handleInputChange}
              type="text"
              className={
                this.state.error
                  ? "border border-danger form-control"
                  : "form-control"
              }
              id="txtTitulo"
              aria-describedby="txtNombreHelp"
              placeholder="Izenburua..."
              value={this.state.txtTitulo}
            />
          </div>
        </div>
        <div class="form-group">
          <label htmlFor="txtDescripcion">
            {trans("formAnuncio.descripcion")}
          </label>{" "}
          (<span className="text-danger font-weight-bold">*</span>)
          <textarea
            onChange={this.handleInputChange}
            class={
              this.state.error
                ? "border border-danger form-control"
                : "form-control"
            }
            rows="5"
            id="txtDescripcion"
            placeholder="Tu descripcion..."
            value={this.state.txtDescripcion}
          ></textarea>
        </div>
        <div className="form-group row">
        <div className="form-group col-lg-6 col-12 d-flex flex-column justify-content-between">
                  {/* Insertar dias disponibles aqui */}
                  <span className="d-flex flex-row justify-content-between align-items-center">
                    <FontAwesomeIcon
                      style={{ cursor: "pointer" }}
                      onClick={this.removeDiasDisponible}
                      className="text-danger"
                      icon={faMinusCircle}
                    />
                    <div>
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      <span className="lead">
                        {trans("registerFormCuidadores.diasDisponible")}
                      </span>
                      (<span className="text-danger font-weight-bold">*</span>)
                    </div>
                    <FontAwesomeIcon
                      style={{ cursor: "pointer" }}
                      onClick={this.addDiasDisponible}
                      className="text-success"
                      icon={faPlusCircle}
                    />                    
                  </span>                  
                  <br />
                  <div className="w-100 mt-2" id="diasDisponible">
                    {/* Aqui iran los dias dinamicamente */}
                    {this.state.diasDisponible.map((dia, indice) => {
                      return (
                        <div className="mt-1 d-flex flex-row align-items-center justify-content-between">
                          <select
                            value={dia.dia}
                            onChange={this.handleDiasDisponibleChange}
                            className="d-inline"
                            id={"dia" + indice}
                          >
                            <option>Aukeratu eguna</option>
                            <option value="1">Astelehena</option>
                            <option value="2">Asteartea</option>
                            <option value="3">Asteazkena</option>
                            <option value="4">Osteguna</option>
                            <option value="5">Ostirala</option>
                            <option value="6">Larunbata</option>
                            <option value="7">Igandea</option>
                          </select>
                          <div className="d-flex flex-row align-items-center">
                            <TimeInput
                              onTimeChange={(valor) => {
                                this.handleDiasDisponibleChange(
                                  valor,
                                  "horaInicio" + indice
                                );
                              }}
                              id={"horaInicio" + indice}
                              initTime={
                                diasDisponible[indice].horaInicio
                              }
                              style={{
                                width: 50,
                              }}
                              className="text-center"
                            />
                            -
                            <TimeInput
                              onTimeChange={(valor) => {
                                this.handleDiasDisponibleChange(
                                  valor,
                                  "horaFin" + indice
                                );
                              }}
                              id={"horaFin" + indice}
                              initTime={diasDisponible[indice].horaFin}
                              style={{
                                width: 50,
                              }}
                              className="text-center"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
          <div className="form-group col-lg-6 col-12 d-flex flex-column">
            {/* Insertar ubicaciones disponibles aqui */}
            <div className="d-flex flex-row justify-content-center align-items-center">
              <FontAwesomeIcon icon={faHome} className="mr-1" />
              <span htmlFor="txtAddPueblos" className="lead">
              {trans("formAnuncio.puebloCuidado")}
              </span>{" "}
              (<span className="text-danger font-weight-bold">*</span>)
            </div>
            
            <div class="form-group mt-2">
              <PuebloAutosuggest
                onSuggestionSelected={this.handleAddPueblo}
              />
              {this.state.ubicaciones.length > 0 ? (
                <h5 className="mt-2 lead">
                  {trans("formAnuncio.puebloSeleccionado")}
                </h5>
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
                  {trans("formAnuncio.eliminarPueblo")}{" "}
                  <FontAwesomeIcon icon={faMinusCircle} />
                </a>
              ) : (
                ""
              )}
            </div>
            <br />
          </div>
        </div>
        <div className="form-group row">
            <div className={this.state.error ? "form-group d-flex flex-column col-lg-6 col-12 border border-danger" : "form-group d-flex flex-column col-lg-6 col-12"}>
              {/* Insertar publico disponibles aqui */}
              <div className="d-flex flex-row justify-content-center align-items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-1" />
                <span className="lead">{trans("formAnuncio.publicoCuidado")}</span>
                (<span className="text-danger font-weight-bold">*</span>)
              </div>
              <div className="row md-2">
                <div
                  onClick={() => {
                    this.handlePublicoChange("ninos");
                  }}
                  onMouseEnter={() => {
                    this.handlePublicoHover("hoverNino");
                  }}
                  onMouseLeave={() => {
                    this.handlePublicoLeave("hoverNino");
                  }}
                  className="col-4 text-center p-1"
                  style={{
                    background: this.state.publicoCuidado === 'ninos'
                      ? "#28a745"
                      : this.state.hoverNino
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgNino} className="w-100 h-100" />
                  <small className="font-weight-bold">
                    {trans("registerFormCuidadores.ninos")}
                  </small>
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
                    background: this.state.publicoCuidado === 'terceraEdad'
                      ? "#28a745"
                      : this.state.hoverTerceraEdad
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgTerceraEdad} className="w-100 h-100" />
                  <small className="font-weight-bold">
                    {trans("registerFormCuidadores.terceraEdad")}
                  </small>
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
                    background: this.state.publicoCuidado === 'necesidadEspecial'
                      ? "#28a745"
                      : this.state.hoverNecesidadEspecial
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgNecesidadEspecial} className="w-100 h-100" />
                  <small className="font-weight-bold">
                    {trans("registerFormCuidadores.necesidadEspecial")}
                  </small>
                </div>
              </div>
            </div>
            <div className="form-group col">
              {/* Insertar precioPublico disponibles aqui */}
              <label className="w-100 text-center lead">
                {trans("formAnuncio.precioCuidado")}:
              </label>
              <div className="list-group md-2">
                {this.state.publicoCuidado !== '' ? (
                  <div className="list-group-item form-group text-center p-1">
                    <small>
                      <b>{trans(`registerFormCuidadores.${this.state.publicoCuidado}`)}</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange(event.target.value);
                      }}
                      className="form-control"
                      type="number"
                      placeholder="Prezioa €/h"
                    />
                  </div>
                ) : (
                  <div className="list-group-item form-group text-center p-1">
                    <input
                      onChange={event => {
                        this.handlePrecioChange( event.target.value);
                      }}
                      className="form-control"
                      disabled
                      type="number"
                      placeholder="Prezioa €/h"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        <div id="loaderOrButton" className="w-100 mt-5 text-center">
            {this.state.isLoading ? (
              <ClipLoader
                color="#28a745"
              />
            ) : (
              <button
                onClick={() => this.handleSubirAnuncio()}
                type="button"
                className="w-100 btn btn-success "
              >
                {trans("registerFormCuidadores.registrarse")}
              </button>
            )}
          </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FormAnuncio);
