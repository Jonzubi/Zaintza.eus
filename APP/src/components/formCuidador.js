import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cogoToast from "cogo-toast";
import { ReactDatez as Calendario } from "react-datez";
import Avatar from "react-avatar-edit";
import Switch from "react-switch";
import axios from 'axios';
import ClipLoader from "react-spinners/ClipLoader";
import {
  faMale,
  faFemale,
  faPlusCircle,
  faMinusCircle,
  faUser,
  faCalendarAlt,
  faAt,
  faKey,
  faMobileAlt,
  faPhoneSquareAlt,
  faClock,
  faHome,
  faEuroSign,
  faPenSquare,
  faVenusMars,
  faUsers,
  faUserCircle,
  faPortrait,
  faEdit,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import i18next from "i18next";
import { saveUserSession } from "../redux/actions/user";
import SocketContext from "../socketio/socket-context";
import ipMaquina from "../util/ipMaquinaAPI";
import { trans, isValidEmail } from "../util/funciones";
import ContactImageUploader from "../components/contactImageUploader";
import TimeInput from "../components/customTimeInput";
import municipios from "../util/municipos";
import PuebloAutosuggest from "../components/pueblosAutosuggest";
import imgNino from "../util/images/nino.png";
import imgNecesidadEspecial from "../util/images/genteConNecesidadesEspeciales.png";
import imgTerceraEdad from "../util/images/terceraEdad.png";
import { getRandomString, toBase64 } from "../util/funciones";
import { changeFormContent } from "../redux/actions/app";

class FormCuidador extends React.Component {
  constructor(props) {
    super(props);
    const { isProfileView } = this.props;

    this.requiredStates = [
      "txtNombre",
      "txtSexo",
      "txtFechaNacimiento",
      "txtMovil",
      "ubicaciones",
      "txtDescripcion",
    ];
    if (!isProfileView) {
      this.requiredStates.push("txtEmail", "txtContrasena");
    }
    //El array de abajo es para traducir el error
    this.requiredStatesTraduc = {
      txtNombre: "registerFormCuidadores.nombre",
      txtSexo: "registerFormCuidadores.sexo",
      txtFechaNacimiento: "registerFormCuidadores.fechaNac",
      txtMovil: "registerFormCuidadores.movil",
      ubicaciones: "registerFormCuidadores.pueblosDisponible",
      txtDescripcion: "registerFormCuidadores.descripcion",
      txtEmail: "registerFormCuidadores.email",
      txtContrasena: "registerFormCuidadores.contrasena",
    };

    const {
      nombre,
      apellido1,
      apellido2,
      sexo,
      fechaNacimiento,
      movil,
      telefFijo,
      descripcion,
      diasDisponible,
      direcFoto,
      direcFotoContacto,
      isPublic,
      ubicaciones,
      publicoDisponible,
      precioPorPublico,
      email,
      contrasena,
    } = props;

    const auxResetDiasDisponible = [
      {
        dia: 0,
        horaInicio: "00:00",
        horaFin: "00:00",
      },
    ];

    const auxResetPublicoDisponible = {
      nino: false,
      terceraEdad: false,
      necesidadEspecial: false,
    };

    const auxResetPrecioPorPublico = {
      nino: "",
      terceraEdad: "",
      necesidadEspecial: "",
    };

    this.state = {
      isEditing: false,
      isLoading: false,
      txtNombre: isProfileView ? nombre : "",
      txtApellido1: isProfileView ? apellido1 : "",
      txtApellido2: isProfileView ? apellido2 : "",
      txtSexo: isProfileView ? sexo : "",
      txtFechaNacimiento: isProfileView ? fechaNacimiento : "",
      txtMovil: isProfileView ? movil : "",
      txtTelefFijo: isProfileView ? telefFijo : "",
      txtDescripcion: isProfileView ? descripcion : "",
      txtEmail: isProfileView ? email : "",
      txtContrasena: isProfileView ? contrasena : "",
      diasDisponible: isProfileView
        ? diasDisponible || auxResetDiasDisponible
        : auxResetDiasDisponible,
      publicoDisponible: isProfileView
        ? publicoDisponible || auxResetPublicoDisponible
        : auxResetPublicoDisponible,
      precioPorPublico: isProfileView
        ? precioPorPublico || auxResetPrecioPorPublico
        : auxResetPrecioPorPublico,
      ubicaciones: isProfileView ? ubicaciones : [],
      isPublic: isProfileView ? isPublic : true,
      avatarSrc: "",
      avatarPreview: "",
      imgContact: null,
      hoverSexoM: false,
      hoverSexoF: false,
      isLoading: false,
      auxAddPueblo: "",
      hoverNino: false,
      hoverTerceraEdad: false,
      hoverNecesidadEspecial: false,
      suggestionsPueblos: [],
      error: {
        txtNombre: false,
        txtEmail: false,
        txtSexo: false,
        txtFechaNacimiento: false,
        txtContrasena: false,
        txtMovil: false,
        ubicaciones: false,
        txtDescripcion: false,
        imgContact: false,
        diasDisponible: false
      },
    };
  }

  handleTextInputChange = (e) => {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    const stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    if (stateId == "txtMovil" || stateId == "txtTelefFijo") {
      if (e.target.value.toString() > 9) {
        e.target.value = e.target.value.slice(0, 9);
      }
    }
    this.setState({
      [stateId]: e.target.value,
    });
  };

  onClose = () => {
    this.setState({ avatarPreview: "", avatarSrc: "" });
  };

  onCrop = (preview) => {
    this.setState({ avatarPreview: preview });
  };

  onBeforeFileLoad = (elem) => {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(
        <h5>{trans("registerFormCuidadores.errorImgGrande")}</h5>
      );
      elem.target.value = "";
    }
  };

  onChangeContactImg = (picture) => {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgContact: picture,
    });
  };

  handleCalendarChange = (valor) => {
    this.setState({
      txtFechaNacimiento: valor,
    });
  };

  handleSexChange = (sex) => {
    this.setState({
      txtSexo: sex,
    });
  };

  handleSexHover = (sex) => {
    this.setState({ [sex]: true });
  };

  handleSexLeave = (sex) => {
    this.setState({ [sex]: false });
  };

  handleEdit = () => {
    this.setState({
      isEditing: true,
    });
  };

  
  removeDiasDisponible = () => {
    const { isEditing } = this.state;
    const { isProfileView } = this.props;
    if (isProfileView && !isEditing)
    return;
    this.setState({
      diasDisponible:
      typeof this.state.diasDisponible.pop() != "undefined"
      ? this.state.diasDisponible
      : []
    });
  }
  
  addDiasDisponible = () => {
    const { isEditing } = this.state;
    const { isProfileView } = this.props;
    if (isProfileView && !isEditing){
      return;
    }
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
  
  handleAddPueblo = (c, { suggestion }) => {
    const { ubicaciones } = this.state;
    this.setState(
      {
        auxAddPueblo: suggestion
      },
      () => {
        const { auxAddPueblo } = this.state;
        let pueblo = auxAddPueblo;
        if (pueblo == "") return;
        
        if (!municipios.includes(pueblo)) {
          cogoToast.error(
            <h5>
              {pueblo} {trans("registerFormCuidadores.errorPuebloNoExiste")}
            </h5>
          );
          return;
        }
        
        for (var clave in ubicaciones) {
          if (ubicaciones[clave] == pueblo) {
            cogoToast.error(
              <h5>
                {pueblo} {trans("registerFormCuidadores.errorPuebloRepetido")}
              </h5>
            );
            return;
          }
        }
        ubicaciones.push(pueblo);
        this.setState({
          ubicaciones: ubicaciones,
          auxAddPueblo: ""
        });
      }
      );
    }
    
    handleRemovePueblo = () => {
      const { ubicaciones } = this.state;
      this.setState({
        ubicaciones:
        typeof ubicaciones.pop() != "undefined"
        ? ubicaciones
        : []
      });
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
    let auxPublicoDisponible = this.state.publicoDisponible;
    auxPublicoDisponible[publico] = !auxPublicoDisponible[publico];
    this.setState({
      publicoDisponible: auxPublicoDisponible
    });
  }
  
  handlePrecioChange = (atributo, valor) => {
    let auxPrecioPublico = this.state.precioPorPublico;
    auxPrecioPublico[atributo] = valor;
    this.setState({
      precioPorPublico: auxPrecioPublico
    });
  }
  
  handleIsPublicChange = (valor) => {
    this.setState({
      isPublic: valor
    });
  }
  
  handleGuardarCambios = async () => {
    // TODO handle guardar cambios
    for (var clave in this.state) {
      if (this.state[clave] === null) continue;
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
      // Comprobamos que haya metido al menos una categoria de cuidado
      if (clave === 'publicoDisponible') {
        const { publicoDisponible } = this.state;

        const publicoSeleccionado = Object.keys(publicoDisponible).find(publico => publicoDisponible[publico]);
        const { error } = this.state;
        if (!publicoSeleccionado) {          
          let auxError = { ...error };
          auxError.publicoDisponible = true;
          this.setState({
            error: auxError
          });
          cogoToast.error(
            <h5>
              {trans('registerFormCuidadores.errorPublicoNoSeleccionado')}
            </h5>
          );
          return;
        } else if (error.publicoDisponible === true) {
          error.publicoDisponible = false;
          this.setState({
            error: error
          });
        }
      }
      // Comprobacion para la imagen de contacto
      const { isProfileView } = this.props;
      const { imgContact } = this.state;

      if (clave === 'imgContact') {
          if (!isProfileView && imgContact === null) {
          const { error } = this.state;
          let auxError = { ...error };
          auxError.imgContact = true;
          this.setState({
            error: auxError
          });

          cogoToast.error(<h5>{trans("registerFormCuidadores.errorRellenaTodo")} (
            {trans('registerFormCuidadores.imgContact')})</h5>);      
          return;
          } else if (this.state.error.imgContact === true) {
            const { error } = this.state;
            error.imgContact = false;
            this.setState({
              error: error
            });
          }
      }
      
      // La comprobacion genérica para los demás
      if (this.requiredStates.includes(clave)) {
        let auxError = this.state.error;
        if (this.state[clave].length === 0) {
          cogoToast.error(
            <h5>
              {trans("registerFormCuidadores.errorRellenaTodo")} (
              {trans(this.requiredStatesTraduc[clave])})
            </h5>
          );
          auxError[clave] = true;
          this.setState({
            error: auxError
          });
          return;
        } else if (auxError[clave] === true) {
          // Esto es por si el usuario ha rellenado una informacion que le faltaba previamente y ahora ya no hay error
          auxError[clave] = false;
          this.setState({
            error: auxError
          });
        }
      }      
    }

    // Comprobamos que el email sea valido sintacticamente
    const { isProfileView } = this.props;
    const { isEditing, imgContact } = this.state;
    if (!isProfileView) {
      const { txtEmail } = this.state;
      let { error } = this.state;
      if(!isValidEmail(txtEmail)) {
        cogoToast.error(
          <h5>
            {trans('commonErrors.invalidEmail')}
          </h5>
        );      
        error.txtEmail = true;
        this.setState({
          error: error
        })
        return;
      } else if (error.txtEmail) {
        error.txtEmail = false;
        this.setState({
          error: error
        });
      }

      const checkIfEmailExists = await axios.get(
        `http://${ipMaquina}:3001/api/procedures/checkIfEmailExists/${txtEmail}`
      );

      if (checkIfEmailExists.data !== "Vacio") {
        cogoToast.error(<h5>{trans("registerFormCuidadores.emailExistente")}</h5>);
        error.txtEmail = true;
        this.setState({
          error: error
        })
        return;
      } else if (error.txtEmail) {
        error.txtEmail = false;
        this.setState({
          error: error
        });
      }
    }

    this.setState({ isLoading: true });

    /* Empezamos con la subida de datos */
    let imgContactB64 = "";

    if (!isProfileView || (isEditing && imgContact !== null)) {
      imgContactB64 = await toBase64(imgContact[0]);
    }

    if (imgContactB64 instanceof Error) {
      cogoToast.error(<h5>{trans("registerFormCuidadores.errorImagen")}</h5>);
      return;
    }

    const {
      txtNombre,
      txtApellido1,
      txtApellido2,
      txtSexo,
      avatarPreview,
      txtDescripcion,
      txtMovil,
      txtTelefFijo,
      isPublic,
      diasDisponible,
      txtFechaNacimiento,
      ubicaciones,
      publicoDisponible,
      precioPorPublico,
      txtEmail,
      txtContrasena
    } = this.state;

    const {
      email,
      contrasena,
      _idUsuario,
      changeFormContent
    } = this.props;

    if (!isProfileView) {
      const validationToken = getRandomString(30);

      const formData = {
        nombre: txtNombre,
        apellido1: txtApellido1,
        apellido2: txtApellido2,
        sexo: txtSexo,
        avatarPreview: avatarPreview,
        imgContactB64: imgContactB64,
        descripcion: txtDescripcion,
        telefonoMovil: txtMovil,
        telefonoFijo: txtTelefFijo,
        isPublic: isPublic,
        diasDisponible: diasDisponible,
        fechaNacimiento: txtFechaNacimiento,
        ubicaciones: ubicaciones,
        publicoDisponible: publicoDisponible,
        precioPorPublico: precioPorPublico,
        email: txtEmail,
        contrasena: txtContrasena,
        tipoUsuario: "Cuidador",
        validationToken
      };

      const insertedCuidador = await axios
        .post(
          "http://" + ipMaquina + ":3001/api/procedures/postNewCuidador",
          formData
        )
        .catch(err => {
          this.setState({
            isLoading: false
          });
          cogoToast.error(
            <h5>{trans("registerFormCuidadores.errorGeneral")}</h5>
          );
          return;
        });

        if (insertedCuidador === undefined) {
          //Si entra aqui el servidor a tenido un error
          //Por ahora ese error seria un duplicado de email
          return;
        }

      axios.post(`http://${ipMaquina}:3003/smtp/registerEmail`, {
        toEmail: txtEmail,
        nombre: txtNombre,
        apellido: txtApellido1,
        validationToken
      });

      cogoToast.success(
        <div>
          <h5>{trans("registerFormCuidadores.registroCompletado")}</h5>
          <small>
            <b>{trans("registerFormCuidadores.darGracias")}</b>
          </small>
        </div>
      );
    } else {
      let formData = {
        nombre: txtNombre,
        apellido1: txtApellido1,
        apellido2: txtApellido2,
        fechaNacimiento: txtFechaNacimiento,
        sexo: txtSexo,
        imgContactB64: imgContactB64,//Los cambios son // Ahora mandare las imagenes en B64 a la API para guardarlo en un paso
        avatarPreview: avatarPreview,//Estas dos lineas //
        descripcion: txtDescripcion,
        ubicaciones: ubicaciones,
        publicoDisponible: publicoDisponible,
        telefonoMovil: txtMovil,
        telefonoFijo: txtTelefFijo,
        isPublic: isPublic,
        precioPorPublico: precioPorPublico,
        diasDisponible: diasDisponible,
        email,
        contrasena,
        idUsuario: _idUsuario
      };
  
      axios.patch(
        "http://" + ipMaquina + ":3001/api/procedures/patchCuidador/" + this.props._id,
        formData
      )
        .then(res => {
          const { direcFoto, direcFotoContacto } = res.data;
          this.props.saveUserSession(Object.assign({}, formData, {direcFoto: direcFoto, direcFotoContacto: direcFotoContacto}));
          cogoToast.success(<h5>{trans("perfilCliente.datosActualizados")}</h5>);
        })
        .catch(err => {
          cogoToast.error(<h5>{trans("perfilCliente.errorGeneral")}</h5>);
        })
        .finally(() => {
          this.setState({
            isLoading: false
          });
        });
    }

    changeFormContent("tabla");
    
  };

  render() {
    const {
      avatarSrc,
      isEditing,
      error,
      txtNombre,
      txtApellido1,
      txtApellido2,
      txtFechaNacimiento,
      txtDescripcion,
      txtMovil,
      txtSexo,
      txtTelefFijo,
      hoverSexoM,
      hoverSexoF,
      txtEmail,
      txtContrasena,
      diasDisponible,
      ubicaciones,
      isLoading,
      publicoDisponible,
      hoverNecesidadEspecial,
      hoverNino,
      hoverTerceraEdad,
      precioPorPublico,
      isPublic
    } = this.state;
    const { direcFoto, isProfileView } = this.props;
    return (
      <SocketContext.Consumer>
        {(socket) => (
          <div className="p-5 d-flex flex-column">
            {/* Primera fila */}
            <div className="row">
              {/* La columna del avatar y la imagen de contacto */}
              <div className="col-lg-3 col-12 d-flex flex-column">
                <div className="d-flex justify-content-lg-start justify-content-center align-items-center mb-lg-0 mb-2">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
                  <span>{trans("registerFormCuidadores.avatar")}</span>
                </div>
                <div className="d-flex justify-content-center">
                  {isProfileView && !isEditing && direcFoto.length > 0 ? (
                    <img
                      height={200}
                      width={200}
                      src={
                        "http://" + ipMaquina + ":3001/api/image/" + direcFoto
                      }
                    />
                  ) : (
                    <Avatar
                      label={i18next.t("registerFormCuidadores.eligeAvatar")}
                      labelStyle={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        width: "100%",
                        height: "100%",
                      }}
                      height={200}
                      width={200}
                      onCrop={this.onCrop}
                      onClose={this.onClose}
                      onBeforeFileLoad={this.onBeforeFileLoad}
                      src={avatarSrc}
                    />
                  )}
                </div>
              </div>
              <div
                className={
                  error.imgContact
                    ? "col-lg-3 col-12 d-flex flex-column border border-danger rounded"
                    : "col-lg-3 col-12 d-flex flex-column"
                }
              >
                <div className="d-flex justify-content-lg-start justify-content-center align-items-center mb-lg-0 mb-2 mt-lg-0 mt-2">
                  <FontAwesomeIcon icon={faPortrait} className="mr-1" />
                  <span className="mr-1">{trans("registerFormCuidadores.fotoContacto")}</span>
                  {!isProfileView ?       
                    (<span className="text-danger font-weight-bold">*</span>)
                    : 
                    null
                  }
                </div>
                <div className="d-flex justify-content-center">
                  {isProfileView && !isEditing ? (
                    <div
                      style={{
                        //backgroundImage:"url(http://" + ipMaquina + ":3001/api/image/" + cuidador.direcFotoContacto + ")",
                        // height: "300px",
                        backgroundSize: "cover",
                        backgroundPosition: "top",
                        backgroundRepeat: "no-repeat",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        style={{ maxHeight: "250px", height: "auto" }}
                        src={
                          "http://" +
                          ipMaquina +
                          ":3001/api/image/" +
                          this.props.direcFotoContacto
                        }
                      />
                    </div>
                  ) : (
                    <ContactImageUploader
                      onImageChoose={this.onChangeContactImg}
                    />
                  )}
                </div>
              </div>
              {/* Fin columna avatar e imagen contacto */}

              {/* Inicio columna nombre y apellidos */}
              <div className="col-lg-6 col-12 d-flex flex-column justify-content-around">
                <div>
                  <FontAwesomeIcon icon={faUser} className="mr-1" />
                  <span htmlFor="txtNombre">
                    {trans("registerFormCuidadores.nombre")}
                  </span>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                  <input
                    onChange={this.handleTextInputChange}
                    type="text"
                    class={
                      error.txtNombre
                        ? "border border-danger form-control"
                        : "form-control"
                    }
                    id="txtNombre"
                    disabled={!isProfileView || isEditing ? null : "disabled"}
                    aria-describedby="txtNombreHelp"
                    placeholder={i18next.t(
                      "registerFormCuidadores.insertNombre"
                    )}
                    value={txtNombre}
                  />
                </div>

                <div className="row">
                  <div className="col-lg-6 col-12 mt-3">
                    <span htmlFor="txtApellido1">
                      {trans("registerFormCuidadores.apellido1")}
                    </span>
                    <input
                      onChange={this.handleTextInputChange}
                      type="text"
                      class="form-control"
                      id="txtApellido1"
                      disabled={!isProfileView || isEditing ? null : "disabled"}
                      aria-describedby="txtNombreHelp"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.apellido1"
                      )}...`}
                      value={txtApellido1}
                    />
                  </div>
                  <div className="col-lg-6 col-12 mt-3">
                    <span htmlFor="txtApellido2">
                      {trans("registerFormCuidadores.apellido2")}
                    </span>
                    <input
                      onChange={this.handleTextInputChange}
                      type="text"
                      class="form-control"
                      id="txtApellido2"
                      disabled={!isProfileView || isEditing ? null : "disabled"}
                      aria-describedby="txtNombreHelp"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.apellido2"
                      )}...`}
                      value={txtApellido2}
                    />
                  </div>
                </div>
                {/* Fin columna nombres y apellidos */}
              </div>
            </div>
            {/* Segunda fila */}
            <div className="row">
              <div className="col-lg-6 col-12 mt-3">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                <span htmlFor="txtFechaNacimiento">
                  {trans("registerFormCuidadores.fechaNac")}
                </span>{" "}
                (<span className="text-danger font-weight-bold">*</span>)
                <br />
                <Calendario
                  dateFormat="YYYY/MM/DD"
                  inputClassName="form-control"
                  inputStyle={{ width: "100%" }}
                  displayCalendars={!isProfileView || isEditing ? 1 : 0}
                  className={
                    error.txtFechaNacimiento
                      ? "border border-danger w-100"
                      : "w-100"
                  }
                  allowPast={true}
                  allowFuture={false}
                  id="txtFechaNacimiento"
                  handleChange={this.handleCalendarChange}
                  disableInputIcon={isProfileView && !isEditing}
                  value={txtFechaNacimiento}
                />
              </div>
              <div className="d-lg-none d-inline col-12 mt-3">
                <FontAwesomeIcon icon={faVenusMars} className="mr-1" />
                <span>{trans("registerFormCuidadores.sexo")}</span> (
                <span className="text-danger">*</span>)
              </div>
              <div
                className={
                  error.txtSexo
                    ? "col-lg-3 col-6 text-center p-1 border border-danger mt-3"
                    : "col-lg-3 col-6 text-center p-1 mt-3"
                }
                onClick={() =>
                  !isProfileView || isEditing ? this.handleSexChange("M") : null
                }
                onMouseEnter={() =>
                  !isProfileView || isEditing
                    ? this.handleSexHover("hoverSexoM")
                    : null
                }
                onMouseLeave={() =>
                  !isProfileView || isEditing
                    ? this.handleSexLeave("hoverSexoM")
                    : null
                }
                id="txtSexM"
                style={{
                  borderRadius: "8px",
                  cursor: !isProfileView || isEditing ? "pointer" : "no-drop",
                  boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                  background:
                    txtSexo == "M" ? "#28a745" : hoverSexoM ? "#545b62" : "",
                  color: txtSexo == "M" || hoverSexoM ? "white" : "black",
                }}
              >
                <FontAwesomeIcon className="fa-5x" icon={faMale} />
              </div>
              <div
                className={
                  error.txtSexo
                    ? "col-lg-3 col-6 text-center p-1 border border-danger mt-3"
                    : "col-lg-3 col-6 text-center p-1 mt-3"
                }
                id="txtSexF"
                onClick={() =>
                  !isProfileView || isEditing ? this.handleSexChange("F") : null
                }
                onMouseEnter={() =>
                  !isProfileView || isEditing
                    ? this.handleSexHover("hoverSexoF")
                    : null
                }
                onMouseLeave={() =>
                  !isProfileView || isEditing
                    ? this.handleSexLeave("hoverSexoF")
                    : null
                }
                style={{
                  borderRadius: "8px",
                  cursor: !isProfileView || isEditing ? "pointer" : "no-drop",
                  boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                  background:
                    txtSexo == "F" ? "#28a745" : hoverSexoF ? "#545b62" : "",
                  color: txtSexo == "F" || hoverSexoF ? "white" : "black",
                }}
              >
                <FontAwesomeIcon className="fa-5x" icon={faFemale} />
              </div>
            </div>
            {/* Tercera fila */}
            <div className="row">
              {!isProfileView ? (
                <>
                  <div className="col-lg-6 col-12 mt-3">
                    <FontAwesomeIcon icon={faAt} className="mr-1" />
                    <span htmlFor="txtEmail">
                      {trans("registerFormCuidadores.email")}
                    </span>{" "}
                    (<span className="text-danger font-weight-bold">*</span>)
                    <input
                      onChange={this.handleTextInputChange}
                      type="email"
                      class={
                        error.txtEmail
                          ? "border border-danger form-control"
                          : "form-control"
                      }
                      id="txtEmail"
                      aria-describedby="emailHelp"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.email"
                      )}...`}
                      value={txtEmail}
                    />
                  </div>
                  <div className="col-lg-6 col-12 mt-3">
                    <FontAwesomeIcon icon={faKey} className="mr-1 mt-3" />
                    <span className="pt-2" htmlFor="txtContrasena">
                      {trans("registerFormCuidadores.contrasena")}
                    </span>{" "}
                    (<span className="text-danger font-weight-bold">*</span>)
                    <input
                      onChange={this.handleTextInputChange}
                      type="password"
                      class={
                        error.txtContrasena
                          ? "border border-danger form-control"
                          : "form-control"
                      }
                      id="txtContrasena"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.contrasena"
                      )}...`}
                      value={txtContrasena}
                    />
                  </div>
                </>
              ) : null}
            </div>
            <div className="row">
              <div class="col-lg-6 col-12 mt-3">
                <FontAwesomeIcon icon={faMobileAlt} className="mr-1" />
                <span htmlFor="txtMovil">
                  {trans("registerFormCuidadores.movil")}
                </span>{" "}
                (<span className="text-danger font-weight-bold">*</span>)
                <input
                  onChange={this.handleTextInputChange}
                  type="number"
                  class={
                    error.txtMovil
                      ? "border border-danger form-control"
                      : "form-control"
                  }
                  disabled={!isProfileView || isEditing ? null : "disabled"}
                  id="txtMovil"
                  aria-describedby="emailHelp"
                  placeholder={`${i18next.t(
                    "registerFormCuidadores.movil"
                  )}...`}
                  value={txtMovil}
                />
              </div>
              <div className="col-lg-6 col-12 mt-3">
                <FontAwesomeIcon icon={faPhoneSquareAlt} className="mr-1 mt-3" />
                <span className="" htmlFor="txtTelefono">
                  {trans("registerFormCuidadores.telefFijo")}
                </span>
                <input
                  onChange={this.handleTextInputChange}
                  type="number"
                  class="form-control"
                  disabled={!isProfileView || isEditing ? null : "disabled"}
                  id="txtTelefFijo"
                  placeholder={`${i18next.t('registerFormCuidadores.telefFijo')}...`}
                  value={txtTelefFijo}
                />
              </div>
            </div>
            {/* Fin tercera fila */}
            {/* Inicio cuarta fila */}
            <div className="row">
              <div className="d-flex flex-column col-lg-6 col-12 mt-3">
                <span className="d-flex flex-row justify-content-between align-items-center">
                  <FontAwesomeIcon
                    style={{ cursor: "pointer" }}
                    onClick={this.removeDiasDisponible}
                    className={!isProfileView || (isEditing && diasDisponible.length > 0) ? "text-danger" : "text-secondary"}
                    icon={faMinusCircle}
                  />
                  <div>
                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                    <span className="lead">
                      {trans("registerFormCuidadores.diasDisponible")}:
                    </span>
                  </div>
                  <FontAwesomeIcon
                    style={{ cursor: "pointer" }}
                    onClick={this.addDiasDisponible}
                    className={!isProfileView || isEditing ? "text-success" : "text-secondary"}
                    icon={faPlusCircle}
                  />                    
                </span>
                <div className={ error.diasDisponible ? "w-100 mt-2 border border-danger" : "w-100 mt-2"} id="diasDisponible">
                  {/* Aqui iran los dias dinamicamente */}
                  {diasDisponible.map((dia, indice) => {
                    return (
                      <div className="mt-1 d-flex flex-row align-items-center justify-content-between">
                        <select
                          value={dia.dia}
                          onChange={this.handleDiasDisponibleChange}
                          disabled={isProfileView && !isEditing}
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
                            disabled={isProfileView && !isEditing}
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
                            disabled={isProfileView && !isEditing}
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
              <div className={error.ubicaciones ? "col border border-danger" : "col"}>
                <span className="d-flex flex-row justify-content-center align-items-center mt-3">
                  <FontAwesomeIcon icon={faHome} className="mr-1" />
                  <span
                    htmlFor="txtAddPueblos"
                    className="lead"
                  >
                    {trans("registerFormCuidadores.pueblosDisponible")}
                  </span>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                </span>
                <div class="mt-2">
                  <PuebloAutosuggest
                    onSuggestionSelected={this.handleAddPueblo}
                    disabled={isProfileView && !isEditing}
                  />
                  {ubicaciones.length > 0 ? (
                    <h5 className="mt-2 lead">
                      {trans("registerFormCuidadores.pueblosSeleccionados")}:
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
                      className={
                        !isProfileView || isEditing
                          ? "mt-4 btn btn-danger float-right text-light"
                          : "mt-4 btn btn-danger float-right text-light disabled"
                      }
                    >
                      {trans("registerFormCuidadores.eliminarPueblo")}{" "}
                      <FontAwesomeIcon icon={faMinusCircle} />
                    </a>
                  ) : (
                    ""
                  )}
                </div>
                <br />
              </div>
            </div>
            {/* Fin cuarta fila */}
            {/* Inicio quinta fila */}
            <div className="row">
              <div className={ error.publicoDisponible ? "col-lg-6 col-12 d-flex flex-column mt-3 border border-danger" : "col-lg-6 col-12 d-flex flex-column mt-3"}>
                <span className="d-flex flex-row justify-content-center align-items-center">
                  <FontAwesomeIcon icon={faUsers} className="mr-1" />
                  <span className="lead">
                    {trans("registerFormCuidadores.publicoDisponible")}:
                  </span>
                </span>
                <div className="row md-2">
                  <div
                    onClick={() =>
                      !isProfileView || isEditing ? this.handlePublicoChange("nino") : null
                    }
                    onMouseEnter={() =>
                      !isProfileView || isEditing
                        ? this.handlePublicoHover("hoverNino")
                        : null
                    }
                    onMouseLeave={() =>
                      !isProfileView || isEditing
                        ? this.handlePublicoLeave("hoverNino")
                        : null
                    }
                    className="col-4 text-center p-1"
                    style={{
                      background: publicoDisponible.nino
                        ? "#28a745"
                        : hoverNino
                        ? "#545b62"
                        : "",
                      cursor: !isProfileView || isEditing ? "pointer" : "no-drop"
                    }}
                  >
                    <img src={imgNino} className="w-100 h-100" />
                    <small className="font-weight-bold">
                      {trans("registerFormCuidadores.ninos")}
                    </small>
                  </div>
                  <div
                    onClick={() =>
                      !isProfileView || isEditing
                        ? this.handlePublicoChange("terceraEdad")
                        : null
                    }
                    onMouseEnter={() =>
                      !isProfileView || isEditing
                        ? this.handlePublicoHover("hoverTerceraEdad")
                        : null
                    }
                    onMouseLeave={() =>
                      !isProfileView || isEditing
                        ? this.handlePublicoLeave("hoverTerceraEdad")
                        : null
                    }
                    className="col-4 text-center p-1"
                    style={{
                      background: publicoDisponible.terceraEdad
                        ? "#28a745"
                        : hoverTerceraEdad
                        ? "#545b62"
                        : "",
                      cursor: !isProfileView || isEditing ? "pointer" : "no-drop"
                    }}
                  >
                    <img src={imgTerceraEdad} className="w-100 h-100" />
                    <small className="font-weight-bold">
                      {trans("registerFormCuidadores.terceraEdad")}
                    </small>
                  </div>
                  <div
                    onClick={() =>
                      !isProfileView || isEditing
                        ? this.handlePublicoChange("necesidadEspecial")
                        : null
                    }
                    onMouseEnter={() =>
                      !isProfileView || isEditing
                        ? this.handlePublicoHover("hoverNecesidadEspecial")
                        : null
                    }
                    onMouseLeave={() =>
                      !isProfileView || isEditing
                        ? this.handlePublicoLeave("hoverNecesidadEspecial")
                        : null
                    }
                    className="col-4 text-center p-1"
                    style={{
                      background: publicoDisponible.necesidadEspecial
                        ? "#28a745"
                        : hoverNecesidadEspecial
                        ? "#545b62"
                        : "",
                      cursor: !isProfileView || isEditing ? "pointer" : "no-drop"
                    }}
                  >
                    <img src={imgNecesidadEspecial} className="w-100 h-100" />
                    <small className="font-weight-bold">
                      {trans("registerFormCuidadores.necesidadEspecial")}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-12 mt-5">
                <span className="d-flex flex-row justify-content-center align-items-center">
                  <FontAwesomeIcon icon={faEuroSign} className="mr-1" />
                  <span className="lead">{trans("registerFormCuidadores.precioPorPublico")}:</span>
                </span>
                <div className="list-group md-2">
                  <div className="list-group-item text-center p-1">
                    <small>
                      <b>{trans("registerFormCuidadores.ninos")}</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange("nino", event.target.value);
                      }}
                      className="form-control"
                      disabled={
                        !isEditing && isProfileView
                          ? true
                          : !publicoDisponible.nino
                      }
                      value={precioPorPublico.nino}
                      type="number"
                      placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                    />
                  </div>
                  <div className="list-group-item text-center p-1">
                    <small>
                      <b>{trans("registerFormCuidadores.terceraEdad")}</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange("terceraEdad", event.target.value);
                      }}
                      disabled={
                        !isEditing && isProfileView
                          ? true
                          : !publicoDisponible.terceraEdad
                      }
                      value={precioPorPublico.terceraEdad}
                      className="form-control"
                      type="number"
                      placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                    />
                  </div>
                  <div className="list-group-item text-center p-1">
                    <small>
                      <b>{trans("registerFormCuidadores.necesidadEspecial")}</b>
                    </small>
                    <input
                      onChange={event => {
                        this.handlePrecioChange(
                          "necesidadEspecial",
                          event.target.value
                        );
                      }}
                      disabled={
                        !isEditing && isProfileView
                          ? true
                          : !publicoDisponible.necesidadEspecial
                      }
                      value={precioPorPublico.necesidadEspecial}
                      className="form-control"
                      type="number"
                      placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Fin quinta fila */}
            <div class="mt-3">
              <FontAwesomeIcon icon={faPenSquare} className="mr-1" />
              <span htmlFor="txtDescripcion">
                {trans("registerFormCuidadores.descripcion")}
              </span>{" "}
              (<span className="text-danger font-weight-bold">*</span>)
              <textarea
                onChange={this.handleTextInputChange}
                class={
                  error.txtDescripcion
                    ? "border border-danger form-control"
                    : "form-control"
                }
                disabled={!isEditing && isProfileView}
                rows="5"
                id="txtDescripcion"
                placeholder={`${i18next.t('registerFormCuidadores.descripcion')}...`}
                value={txtDescripcion}
              ></textarea>
            </div>
            <div className="mt-3">
              <Switch
                onChange={this.handleIsPublicChange}
                checked={isPublic}
                disabled={!isEditing && isProfileView}
                id="isPublic"
              />
              <br />
              <small>{trans("registerFormCuidadores.publicarAuto")}</small>
            </div>
            <div id="loaderOrButton" className="row mt-5">
              <div className="col-12">
                {isProfileView && !isEditing ? (
                  <button
                    onClick={() => this.handleEdit()}
                    type="button"
                    className="w-100 btn btn-info "
                  >
                    {trans("perfilCliente.editar")}
                    <FontAwesomeIcon className="ml-1" icon={faEdit} />
                  </button>
                ) : isLoading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <ClipLoader color="#28a745" />
                  </div>
                ) : (
                  <button
                    onClick={() => this.handleGuardarCambios()}
                    type="button"
                    className="w-100 btn btn-success"
                  >
                    {trans("perfilCliente.guardarCambios")}
                    <FontAwesomeIcon className="ml-1" icon={faSave} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </SocketContext.Consumer>
    );
  }
}

const mapStateToProps = (state) => ({
  _id: state.user._id,
  _idUsuario: state.user._idUsuario,
  nombre: state.user.nombre,
  apellido1: state.user.apellido1,
  apellido2: state.user.apellido2,
  sexo: state.user.sexo,
  fechaNacimiento: state.user.fechaNacimiento,
  direcFoto: state.user.direcFoto,
  direcFotoContacto: state.user.direcFotoContacto,
  movil: state.user.telefonoMovil,
  telefFijo: state.user.telefonoFijo,
  descripcion: state.user.descripcion,
  isPublic: state.user.isPublic,
  diasDisponible:
    typeof state.user.diasDisponible.slice != "undefined"
      ? state.user.diasDisponible.slice(0)
      : [],
  ubicaciones:
    typeof state.user.ubicaciones.slice != "undefined"
      ? state.user.ubicaciones.slice(0)
      : [],
  publicoDisponible: Object.assign({}, state.user.publicoDisponible),
  precioPorPublico: Object.assign({}, state.user.precioPorPublico),
  email: state.user.email,
  contrasena: state.user.contrasena,
});

const mapDispatchToProps = (dispatch) => ({
  saveUserSession: (user) => dispatch(saveUserSession(user)),
  changeFormContent: form => dispatch(changeFormContent(form)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormCuidador);
