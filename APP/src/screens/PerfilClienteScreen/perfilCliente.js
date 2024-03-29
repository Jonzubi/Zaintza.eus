import React from "react";
import Avatar from "react-avatar-edit";
import { connect } from "react-redux";
import { changeFormContent } from "../../redux/actions/app";
import { saveUserSession } from "../../redux/actions/user";
import { toBase64, trans } from "../../util/funciones";
import ipMaquina from "../../util/ipMaquinaAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave, faUser, faMobileAlt, faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import Axios from "../../util/axiosInstance";
import cogoToast from "cogo-toast";
import ClipLoader from "react-spinners/ClipLoader";
import i18next from "i18next";
import ContactImageUploader from "../../components/contactImageUploader";
import protocol from '../../util/protocol';

const mapStateToProps = state => {
  //Aqui van los especialitos de los undefined
  return {
    _id: state.user._id,
    nombre: state.user.nombre,
    apellido1: state.user.apellido1,
    apellido2: state.user.apellido2,
    direcFoto: state.user.direcFoto,
    movil: state.user.telefonoMovil,
    telefFijo: state.user.telefonoFijo,
    email: state.user.email,
    contrasena: state.user.contrasena,
    idUsuario: state.user._idUsuario,
    nowLang: state.app.nowLang
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeFormContent: form => dispatch(changeFormContent(form)),
    saveUserSession: user => dispatch(saveUserSession(user))
  };
};

class PerfilCliente extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imgAvatar: null,
      isEditing: false,
      isLoading: false,
      txtNombre: this.props.nombre,
      txtApellido1: this.props.apellido1,
      txtApellido2: this.props.apellido2,
      txtMovil: this.props.movil,
      txtFijo: this.props.telefFijo,
      isLoading: false,
      error: {
        txtNombre: false,
        txtMovil: false
      }
    };

    this.requiredState = ["txtNombre", "txtMovil"];
    this.requiredStatesTraduc = {
      txtNombre: "registerFormClientes.nombre",
      txtMovil: "registerFormClientes.movil"
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onCrop = this.onCrop.bind(this);
    this.onBeforeFileLoad = this.onBeforeFileLoad.bind(this);
  }

  handleEdit() {
    this.setState({
      isEditing: true
    });
  }

  async handleGuardarCambios() {
    const { email, contrasena, idUsuario } = this.props;
    const { txtNombre, txtApellido1, txtApellido2, txtFijo, txtMovil, imgAvatar } = this.state;
    for (var clave in this.state) {
      if (clave === 'imgAvatar') {
        continue;
      }
      if (
        (this.state[clave].length == 0 || !this.state[clave]) &&
        this.requiredState.includes(clave)
      ) {
        cogoToast.error(
          <h5>
            {trans("registerFormClientes.errorRellenaTodo")} (
            {trans(this.requiredStatesTraduc[clave])})
          </h5>
        );
        let auxError = this.state.error;
        auxError[clave] = true;
        this.setState({
          error: auxError
        });
        return;
      }
    }

    this.setState({
      isLoading: true
    });

    let imgAvatarB64 = "";

    if (imgAvatar !== null) {
      imgAvatarB64 = await toBase64(imgAvatar[0]);
    }

    let formData = {
      nombre: txtNombre,
      apellido1: txtApellido1,
      apellido2: txtApellido2,
      telefonoMovil: txtMovil,
      telefonoFijo: txtFijo,
      imgAvatarB64,
      email,
      contrasena,
      idUsuario
    };

    Axios
        .patch(`${protocol}://${ipMaquina}:3001/api/procedures/patchCliente/${this.props._id}`, formData)
        .then(
          resultado => {
            const { direcFoto } = resultado.data;
            this.props.saveUserSession(Object.assign({}, formData, {direcFoto: direcFoto}));
            cogoToast.success(
            <h5>{trans('perfilCliente.datosActualizados')}</h5>
            );            
          }
        )
        .catch(
          err => {
            cogoToast.error(
              <h5>{trans('perfilCliente.errorGeneral')}</h5>
              )
          }          
        )
        .finally(() => {
          this.setState({
            isLoading: false
          })
        });
  }

  handleInputChange(e) {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    var stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    if (stateId == "txtMovil" || stateId == "txtFijo") {
      if (e.target.value.toString() > 9) {
        e.target.value = e.target.value.slice(0, 9);
      }
    }
    this.setState({
      [stateId]: e.target.value
    });
  }

  onClose() {
    this.setState({ avatarPreview: "" });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(<h5>{trans("perfilCliente.errorImgGrande")}</h5>);
      elem.target.value = "";
    }
  }

  onChangeAvatarImg = (picture) => {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgAvatar: picture,
    });
  };

  getAvatarSrc = () => {
    if (this.props.direcFoto.includes("https://"))
      return this.props.direcFoto;
    
    return `${protocol}://${ipMaquina}:3001/api/image/${this.props.direcFoto}?isAvatar=true`;
  }

  render() {
    return (
      <div className="p-5 d-flex flex-column">
        <div className="d-flex flex-row align-items-center justify-content-center mb-2">
          {!this.state.isEditing ? (
            <img
              alt="Avatar perfil"
              height={200}
              width={200}
              src={this.getAvatarSrc()}
            />
          ) : (
            <ContactImageUploader
              onImageChoose={this.onChangeAvatarImg}
            />
          )}
        </div>
        <div className="row">
          <div className="col-12 mb-2">
            <div className="d-flex flex-row align-items-center">
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              <span htmlFor="txtNombre">{trans("perfilCliente.nombre")}</span> (
              <span className="text-danger font-weight-bold">*</span>)
            </div>
            
            <input
              onChange={this.handleInputChange}
              type="text"
              className={
                this.state.error.txtNombre
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtNombre"
              aria-describedby="txtNombreHelp"
              placeholder={i18next.t('perfilCliente.holderNombre')}
              value={this.state.txtNombre}
            />
          </div>
        </div>
        <div className="mt-lg-2 row">
          <div className="col-lg-6 col-12 mb-2">
            <label htmlFor="txtApellido1">{trans("perfilCliente.apellido1")}</label>
            <input
              onChange={this.handleInputChange}
              type="text"
              className="form-control"
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtApellido1"
              aria-describedby="txtNombreHelp"
              placeholder={i18next.t('perfilCliente.holderApellido1')}
              value={this.state.txtApellido1}
            />
          </div>
          <div className="col-lg-6 col-12 mb-2">
            <label htmlFor="txtApellido2">{trans("perfilCliente.apellido2")}</label>
            <input
              onChange={this.handleInputChange}
              type="text"
              className="form-control"
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtApellido2"
              aria-describedby="txtNombreHelp"
              placeholder={i18next.t('perfilCliente.holderApellido2')}
              value={this.state.txtApellido2}
            />
          </div>
        </div>
        <div className="mt-lg-2 row">
          <div className="col-lg-6 col-12 mb-2">
            <div className="d-flex flex-row align-items-center">
              <FontAwesomeIcon icon={faMobileAlt} className="mr-1" />
              <span htmlFor="txtMovil">{trans("perfilCliente.movil")}</span> (
              <span className="text-danger font-weight-bold">*</span>)
            </div>
            
            <input
              onChange={this.handleInputChange}
              type="number"
              className={
                this.state.error.txtNombre
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtMovil"
              placeholder={`${i18next.t('perfilCliente.movil')}...`}
              value={this.state.txtMovil}
            />
          </div>
          <div className="col-lg-6 col-12 mb-2">
            <div className="d-flex flex-row align-items-center">
              <FontAwesomeIcon icon={faPhoneAlt} className="mr-1" />
              <span htmlFor="txtFijo">{trans("perfilCliente.telefFijo")}</span>{" "}
            </div>
            <input
              onChange={this.handleInputChange}
              type="number"
              className={
                this.state.error.txtFijo
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtFijo"
              placeholder={`${i18next.t('perfilCliente.telefFijo')}...`}
              value={this.state.txtFijo}
            />
          </div>
        </div>
        <div id="loaderOrButton" className="row mt-5">
          <div className="col-12 mb-2">
            {!this.state.isEditing ? (
              <button
                onClick={() => this.handleEdit()}
                type="button"
                className="w-100 btn btn-info "
              >
                {trans("perfilCliente.editar")}
                <FontAwesomeIcon className="ml-1" icon={faEdit} />
              </button>
            ) : this.state.isLoading ? (
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
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PerfilCliente);
