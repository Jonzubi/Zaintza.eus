import React from "react";
import { connect } from 'react-redux';
import cogoToast from "cogo-toast";
import { trans, toBase64 } from "../../util/funciones";
import ImageUploader from "../../components/contactImageUploader";
import i18next from "i18next";
import TimeInput from "../../components/customTimeInput";
import PuebloAutosuggest from "../../components/pueblosAutosuggest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMale,
  faFemale,
  faPlusCircle,
  faMinusCircle,
  faPlusSquare,
  faClock,
  faHome,
  faUsers,
  faEuroSign
} from "@fortawesome/free-solid-svg-icons";
import municipios from "../../util/municipos";
import ipMaquina from "../../util/ipMaquinaAPI";
import imgNecesidadEspecial from "../../util/images/genteConNecesidadesEspeciales.png";
import imgTerceraEdad from "../../util/images/terceraEdad.png";
import imgNino from "../../util/images/nino.png";
import Axios from "../../util/axiosInstance";
import { changeFormContent } from "../../redux/actions/app";
import ClipLoader from "react-spinners/ClipLoader";
import protocol from '../../util/protocol';

const mapStateToProps = state => {
  return {
    _id: state.user._id,
    email: state.user.email,
    contrasena: state.user.contrasena,
    nowLang: state.app.nowLang
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
      error: {
        txtTitulo: false,
        txtDescripcion: false,
        diasDisponible: false,
        ubicaciones: false,
        publicoCuidado: false,
      },
      isLoading: false
    };
  }

  onClose = () => {
    this.setState({ avatarPreview: "" });
  }

  onCrop = (preview) => {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad = (elem) => {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(<h5>{trans("registerFormClientes.errorImgGrande")}</h5>);
      elem.target.value = "";
    }
  }

  onChangeContactImg = (picture) => {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgAnuncio: picture
    });
  }

  handleInputChange = (e) => {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    var stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    this.setState({
      [stateId]: e.target.value
    });
  }

  handleAuxAddPuebloChange = (e, { newValue }) => {
    this.setState({
      auxAddPueblo: newValue
    });
  }

  escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  getSuggestions = (value) => {
    const escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue === "") {
      return [];
    }

    const regex = new RegExp("^" + escapedValue, "i");

    return municipios.filter(pueblo => regex.test(pueblo));
  }

  getSuggestionValue = (suggestion) => {
    return suggestion;
  }

  renderSuggestion = (suggestion) => {
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

  handleAddPueblo = (c, { suggestion }) => {
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

  handleRemovePueblo = () => {
    this.setState({
      ubicaciones:
        typeof this.state.ubicaciones.pop() != "undefined"
          ? this.state.ubicaciones
          : []
    });
  }

  addDiasDisponible = () => {
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

  removeDiasDisponible = () => {
    this.setState({
      diasDisponible:
        typeof this.state.diasDisponible.pop() != "undefined"
          ? this.state.diasDisponible
          : []
    });
  }

  handleDiasDisponibleChange = (e, indice) => {
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

  handlePublicoHover = (publico) => {
    this.setState({
      [publico]: true
    });
  }

  handlePublicoLeave = (publico) => {
    this.setState({
      [publico]: false
    });
  }

  handlePublicoChange = (publico) => {
    this.setState({
      publicoCuidado: publico
    });
  }

  handlePrecioChange = (valor) => {
    this.setState({
      precioCuidado: valor
    });
  }

  handleSubirAnuncio = async () => {
    const { imgAnuncio, txtTitulo, precioCuidado, txtDescripcion, diasDisponible, publicoCuidado, ubicaciones } = this.state;
    const { _id, changeFormContent, email, contrasena } = this.props;
    for(let clave of this.requiredStates) {
      //Hago primero la comprobacion de null ya que .length no existe en un null y peta.
      if(this.state[clave] === null){
        cogoToast.error(
          <h5>
            {trans("registerFormCuidadores.errorRellenaTodo")} (
            {trans(this.requiredStatesTraduc[clave])})
          </h5>
        );
        let { error } = this.state;
        error[clave] = true;
        this.setState({
          error: error
        });
        return;
      }
      if(this.state[clave].length === 0){
        cogoToast.error(
          <h5>
            {trans("registerFormCuidadores.errorRellenaTodo")} (
            {trans(this.requiredStatesTraduc[clave])})
          </h5>
        );
        let { error } = this.state;
        error[clave] = true;
        this.setState({
          error: error
        });
        return;
      } else if (this.state.error[clave] === true) {
        let { error } = this.state;
        error[clave] = false;
        this.setState({
          error
        });
      }
      //Hago una comporbacion diferente para los dias, para que haya elegido un dia en el combo
      if (clave == "diasDisponible") {
        let error = false;
        this.state[clave].map(confDia => {
          if (confDia.dia == 0 || isNaN(confDia.dia)) {
            cogoToast.error(
              <h5>{trans("registerFormCuidadores.errorDiaNoElegido")}</h5>
            );
            error = true;
            return;
          }
          let { horaInicio, horaFin } = confDia;
          horaInicio = horaInicio.split(':'); // Separamos horas y minutos para compararlos 
          horaFin = horaFin.split(':'); // y decir que hora fin no sea antes que hora inicio

          if (parseInt(horaInicio[0]) > parseInt(horaFin[0])){
            // La hora de horainicio es mayor por lo que error
            cogoToast.error(
              <h5>{trans("registerFormCuidadores.errorDiaHoraIncorrecto")}</h5>
            );
            error = true;
            return;
          } else if(parseInt(horaInicio[0]) === parseInt(horaFin[0])){
            if (parseInt(horaInicio[1]) >= parseInt(horaFin[1])) {
              // Los minutos de horainicio son mayores, siendo la hora igual por lo que error
              cogoToast.error(
                <h5>{trans("registerFormCuidadores.errorDiaHoraIncorrecto")}</h5>
              );
              error = true;
              return;
            }
          }
        });
        if (error) {
          const { error } = this.state;
          let auxError = { ...error };
          auxError.diasDisponible = true;
          this.setState({
            error: auxError
          });
          return;
        } else if (this.state.error.diasDisponible === true) {
          const { error } = this.state;
          error.diasDisponible = false;
          this.setState({
            error: error
          });
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

      

      await Axios.post(`${protocol}://${ipMaquina}:3001/api/procedures/postAnuncio`, formData)
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
    const {
      error, diasDisponible, txtTitulo, txtDescripcion,
      ubicaciones, isLoading, precioCuidado, publicoCuidado,
      hoverNino, hoverNecesidadEspecial, hoverTerceraEdad
    } = this.state;
    return (
      <div className="p-5">
        <div className="form-group d-flex justify-content-center position-relative">
          <ImageUploader
            onImageChoose={this.onChangeContactImg}
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
                error.txtTitulo
                  ? "border border-danger form-control"
                  : "form-control"
              }
              id="txtTitulo"
              aria-describedby="txtNombreHelp"
              placeholder={i18next.t('formAnuncio.holderTitulo')}
              value={txtTitulo}
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
              error.txtDescripcion
                ? "border border-danger form-control"
                : "form-control"
            }
            rows="5"
            id="txtDescripcion"
            placeholder={i18next.t('formAnuncio.holderDescripcion')}
            value={txtDescripcion}
          ></textarea>
        </div>
        <div className="form-group row">
        <div className="form-group col-lg-6 col-12 d-flex flex-column">
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
            <div className={error.diasDisponible ? "w-100 mt-2 border border-danger" : "w-100 mt-2"} id="diasDisponible">
              {/* Aqui iran los dias dinamicamente */}
              {diasDisponible.map((dia, indice) => {
                return (
                  <div className="mt-1 d-flex flex-row align-items-center justify-content-between">
                    <select
                      value={dia.dia}
                      onChange={this.handleDiasDisponibleChange}
                      className="d-inline"
                      id={"dia" + indice}
                    >
                      <option>{i18next.t('registerFormCuidadores.elegirDia')}</option>
                      <option value="1">{i18next.t('registerFormCuidadores.lunes')}</option>
                      <option value="2">{i18next.t('registerFormCuidadores.martes')}</option>
                      <option value="3">{i18next.t('registerFormCuidadores.miercoles')}</option>
                      <option value="4">{i18next.t('registerFormCuidadores.jueves')}</option>
                      <option value="5">{i18next.t('registerFormCuidadores.viernes')}</option>
                      <option value="6">{i18next.t('registerFormCuidadores.sabado')}</option>
                      <option value="7">{i18next.t('registerFormCuidadores.domingo')}</option>
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
          <div className={error.ubicaciones ? "form-group col-lg-6 col-12 d-flex flex-column border border-danger" : "form-group col-lg-6 col-12 d-flex flex-column"}>
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
              {ubicaciones.length > 0 ? (
                <h5 className="mt-2 lead">
                  {trans("formAnuncio.puebloSeleccionado")}
                </h5>
              ) : (
                ""
              )}

              <ul className="list-group">
                {ubicaciones.map(pueblo => {
                  return <li className="list-group-item">{pueblo}</li>;
                })}
              </ul>
              {ubicaciones.length > 0 ? (
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
            <div className={error.publicoCuidado ? "form-group d-flex flex-column col-lg-6 col-12 border border-danger" : "form-group d-flex flex-column col-lg-6 col-12"}>
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
                    background: publicoCuidado === 'ninos'
                      ? "#28a745"
                      : hoverNino
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgNino} className="w-100 h-100" alt="Haurra / Niño"/>
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
                    background: publicoCuidado === 'terceraEdad'
                      ? "#28a745"
                      : hoverTerceraEdad
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgTerceraEdad} className="w-100 h-100" alt="Adinekoa / Tercera edad"/>
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
                    background: publicoCuidado === 'necesidadEspecial'
                      ? "#28a745"
                      : hoverNecesidadEspecial
                      ? "#545b62"
                      : ""
                  }}
                >
                  <img src={imgNecesidadEspecial} className="w-100 h-100" alt="Behar bereziak / Necesidad especial"/>
                  <small className="font-weight-bold">
                    {trans("registerFormCuidadores.necesidadEspecial")}
                  </small>
                </div>
              </div>
            </div>
            <div className="form-group col">
              {/* Insertar precioPublico disponibles aqui */}
              <div className="d-flex flex-row align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faEuroSign} className="mr-1" />
                  <span className="lead">{trans("formAnuncio.precioCuidado")}</span>
              </div>
              <div className="list-group md-2">
                {publicoCuidado !== '' ? (
                  <div className="list-group-item form-group text-center p-1">
                    <small>
                      <b>{trans(`registerFormCuidadores.${publicoCuidado}`)}</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange(event.target.value);
                      }}
                      className="form-control"
                      type="number"
                      value={precioCuidado}
                      placeholder={i18next.t('formAnuncio.holderPrecio')}
                    />
                  </div>
                ) : (
                  <div className="list-group-item form-group text-center p-1">
                    <input
                      onChange={event => {
                        this.handlePrecioChange(event.target.value);
                      }}
                      className="form-control"
                      disabled
                      type="number"
                      value={precioCuidado}
                      placeholder={i18next.t('formAnuncio.holderPrecio')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        <div id="loaderOrButton" className="w-100 mt-5 text-center">
            {isLoading ? (
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
