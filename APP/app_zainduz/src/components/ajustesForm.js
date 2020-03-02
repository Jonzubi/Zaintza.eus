import React from "react";
import cogoToast from "cogo-toast";
import { connect } from "react-redux";
import Axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { saveUserSession } from "../redux/actions/user";
import { trans } from "../util/funciones";
import i18n from "i18next";

class AjustesForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      txtActualPassword: "",
      txtNewPassword: "",
      txtRepeatNewPassword: "",
      formChosen: "perfil",
      langChosen: i18n.language
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeFormChosen = this.handleChangeFormChosen.bind(this);
    this.handleSaveLanguage = this.handleSaveLanguage.bind(this);
  }

  handleSaveLanguage = () => {
    const { langChosen } = this.state;
    const { idUsuario } = this.props;

    Axios.post(
      "http://" + ipMaquina + ":3001/api/procedures/patchPredLang/" + idUsuario,
      {
        idLangPred: langChosen
      }
    )
      .then(() => {
        cogoToast.success(<h5>{trans("ajustesForm.idiomaCambiado")}</h5>);
      })
      .catch(() => {
        cogoToast.error(<h5>{trans("perfilCliente.errorGeneral")}</h5>);
      });
  };

  getAllLang = () => {
    return Object.keys(i18n.services.resourceStore.data);
  };

  handleChangeLanguage = lang => {
    this.setState({
      langChosen: lang
    });
  };

  getLangTraducido = code => {
    switch (code) {
      case "eus":
        return "Euskara(EUS)";
      case "es":
        return "Español(ES)";
      default:
        return "ERROR";
    }
  };

  handleChangePassword() {
    const {
      txtNewPassword,
      txtRepeatNewPassword,
      txtActualPassword
    } = this.state;
    const { contrasena, idUsuario, saveUserSession } = this.props;

    if (contrasena !== txtActualPassword) {
      cogoToast.error(<h5>La contraseña actual no coincide</h5>);
      return;
    }

    if (txtNewPassword !== txtRepeatNewPassword) {
      cogoToast.error(<h5>Las nuevas contraseñas no coinciden</h5>);
      return;
    }

    const formData = {
      contrasena: txtNewPassword
    };

    Axios.patch(
      "http://" + ipMaquina + ":3001/api/usuario/" + idUsuario,
      formData
    )
      .then(() => {
        saveUserSession(formData);
        cogoToast.success(<h5>{trans("perfilCliente.datosActualizados")}</h5>);
        this.setState({
          txtActualPassword: "",
          txtNewPassword: "",
          txtRepeatNewPassword: ""
        });
      })
      .catch(() => {
        cogoToast.error(<h5>{trans("perfilCliente.errorGeneral")}</h5>);
      });
  }

  handleInputChange(e) {
    const stateId = e.target.id;
    this.setState({
      [stateId]: e.target.value
    });
  }

  handleChangeFormChosen(form) {
    this.setState({
      formChosen: form
    });
  }
  render() {
    const {
      txtActualPassword,
      txtNewPassword,
      txtRepeatNewPassword,
      formChosen,
      langChosen
    } = this.state;
    const { idLangPred } = this.props;
    console.log(idLangPred);
    return (
      <div className="p-5">
        <div className="row">
          <div className="col-3">
            <h5 className="d-flex align-items-stretch justify-content-center mb-5">
              {trans("ajustesForm.ajustes")}
            </h5>
            <div
              className={
                formChosen !== "perfil"
                  ? "btn d-flex align-items-stretch"
                  : "btn btn-success d-flex align-items-stretch"
              }
              onClick={() => this.handleChangeFormChosen("perfil")}
            >
              {trans("ajustesForm.perfil")}
            </div>
            <br />
            <div
              className={
                formChosen !== "app"
                  ? "btn d-flex align-items-stretch"
                  : "btn btn-success d-flex align-items-stretch"
              }
              onClick={() => this.handleChangeFormChosen("app")}
            >
              {trans("ajustesForm.app")}
            </div>
          </div>
          <div
            className={formChosen === "perfil" ? "col-9 flex-column" : "d-none"}
          >
            <h1>{trans("ajustesForm.perfil")}</h1>
            <hr />
            <h5>{trans("ajustesForm.contrasena")}</h5>
            <hr />
            <div className="">
              <div className="row">
                <span className="col-3">
                  {trans("ajustesForm.actualContrasena")}
                </span>
                <input
                  placeholder="Contraseña actual"
                  id="txtActualPassword"
                  type="password"
                  className="col-9"
                  onChange={this.handleInputChange}
                  value={txtActualPassword}
                />
              </div>
              <br />
              <br />
              <div className="row">
                <span className="col-3">
                  {trans("ajustesForm.nuevaContrasena")}
                </span>
                <input
                  placeholder="Nueva contraseña"
                  id="txtNewPassword"
                  type="password"
                  className="col-9"
                  onChange={this.handleInputChange}
                  value={txtNewPassword}
                />
              </div>
              <br />
              <br />
              <div className="row">
                <span className="col-3">
                  {trans("ajustesForm.repetirNuevaContrasena")}
                </span>
                <input
                  placeholder="Repetir nueva contraseña"
                  id="txtRepeatNewPassword"
                  type="password"
                  className="col-9"
                  onChange={this.handleInputChange}
                  value={txtRepeatNewPassword}
                />
              </div>
              <br />
              <div className="d-flex justify-content-end">
                <div
                  className="btn btn-success"
                  onClick={() => this.handleChangePassword()}
                >
                  {trans("ajustesForm.cambiarContrasena")}
                </div>
              </div>
              <hr />
            </div>
          </div>
          <div
            className={formChosen === "app" ? "col-9 flex-column" : "d-none"}
          >
            <h1>{trans("ajustesForm.app")}</h1>
            <hr />
            <h5>{trans("ajustesForm.idioma")}</h5>
            <hr />
            <span>{trans("ajustesForm.idiomaPredeterminado")}</span>
            <div className="dropdown d-flex mt-2">
              <button
                className="btn btn-light dropdown-toggle w-100"
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {this.getLangTraducido(langChosen)}
              </button>
              <div
                className="dropdown-menu w-100 text-center"
                aria-labelledby="dropdownMenuButton"
              >
                {this.getAllLang().map(lang => {
                  return (
                    <a
                      className="dropdown-item btn w-100"
                      onClick={() => this.handleChangeLanguage(lang)}
                    >
                      {this.getLangTraducido(lang)}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="d-flex justify-content-end mt-5">
              <div
                className="btn btn-success"
                onClick={() => this.handleSaveLanguage()}
              >
                {trans("ajustesForm.definirIdioma")}
              </div>
            </div>
            <hr />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  contrasena: state.user.contrasena,
  idUsuario: state.user._idUsuario,
  idLangPred: state.user.idLangPred
});

const mapDispatchToProps = dispatch => ({
  saveUserSession: payload => dispatch(saveUserSession(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(AjustesForm);
