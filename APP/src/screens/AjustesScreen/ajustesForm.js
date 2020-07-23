import React from "react";
import cogoToast from "cogo-toast";
import { connect } from "react-redux";
import Axios from "axios";
import ipMaquina from "../../util/ipMaquinaAPI";
import { saveUserSession } from "../../redux/actions/user";
import { trans } from "../../util/funciones";
import i18n from "i18next";
import i18next from "i18next";

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
    const { idUsuario, email, contrasena } = this.props;

    Axios.post(
      "http://" + ipMaquina + ":3001/api/procedures/patchPredLang/" + idUsuario,
      {
        idLangPred: langChosen,
        email,
        contrasena
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
    const { contrasena, idUsuario, saveUserSession, email } = this.props;

    if (contrasena !== txtActualPassword) {
      cogoToast.error(<h5>La contraseña actual no coincide</h5>);
      return;
    }

    if (txtNewPassword !== txtRepeatNewPassword) {
      cogoToast.error(<h5>Las nuevas contraseñas no coinciden</h5>);
      return;
    }

    Axios.patch(
      "http://" + ipMaquina + ":3001/api/procedures/patchPassword/" + idUsuario, {
        email,
        contrasena: txtActualPassword,
        newPassword: txtNewPassword
      }
    )
      .then(() => {
        saveUserSession({
          contrasena: txtNewPassword
        });
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
    return (
      <div className="p-lg-5 mt-lg-0 mt-2">
        <div className="row-lg flex-lg-row d-flex flex-column">
          <div className="col-lg-3 mb-lg-0 mb-5">
            <h5 className="d-flex align-items-stretch justify-content-center mb-5">
              {trans("ajustesForm.ajustes")}
            </h5>
            <div
              style={{
                boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)"
              }}
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
              style={{
                boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)"
              }}
              className={
                formChosen !== "app"
                  ? "btn d-flex align-items-stretch shadow-sm"
                  : "btn btn-success d-flex align-items-stretch"
              }
              onClick={() => this.handleChangeFormChosen("app")}
            >
              {trans("ajustesForm.app")}
            </div>
          </div>
          <div
            className={formChosen === "perfil" ? "col-lg-9 flex-column" : "d-none"}
          >
            <h3>{trans("ajustesForm.perfil")}</h3>
            <hr />
            <h5>{trans("ajustesForm.contrasena")}</h5>
            <hr />
            <div className="d-flex flex-column">
              <div className="d-flex flex-column">
                <span className="mb-2">
                  {trans("ajustesForm.actualContrasena")}
                </span>
                <input
                  placeholder={i18next.t("ajustesForm.holderContrasenaActual")}
                  id="txtActualPassword"
                  type="password"
                  className=""
                  onChange={this.handleInputChange}
                  value={txtActualPassword}
                />
              </div>
              <br />
              <br />
              <div className="d-flex flex-column">
                <span className="mb-2">
                  {trans("ajustesForm.nuevaContrasena")}
                </span>
                <input
                  placeholder={i18next.t("ajustesForm.holderNuevaContrasena")}
                  id="txtNewPassword"
                  type="password"
                  className=""
                  onChange={this.handleInputChange}
                  value={txtNewPassword}
                />
              </div>
              <br />
              <br />
              <div className="d-flex flex-column">
                <span className="mb-2">
                  {trans("ajustesForm.repetirNuevaContrasena")}
                </span>
                <input
                  placeholder={i18next.t('ajustesForm.holderRepetirContrasena')}
                  id="txtRepeatNewPassword"
                  type="password"
                  className=""
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
            className={formChosen === "app" ? "col-lg-9 flex-column" : "d-none"}
          >
            <h3>{trans("ajustesForm.app")}</h3>
            <hr />
            <h5>{trans("ajustesForm.idioma")}</h5>
            <hr />
            <span>{trans("ajustesForm.idiomaPredeterminado")}</span>
            <div className="dropdown d-flex mt-3">
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
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  contrasena: state.user.contrasena,
  idUsuario: state.user._idUsuario,
  idLangPred: state.user.idLangPred,
  email: state.user.email,
  contrasena: state.user.contrasena,
  nowLang: state.app.nowLang
});

const mapDispatchToProps = dispatch => ({
  saveUserSession: payload => dispatch(saveUserSession(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(AjustesForm);
