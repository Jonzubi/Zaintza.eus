import React from "react";
import i18n from "i18next";
import { connect } from "react-redux";
import ipMaquina from "../util/ipMaquinaAPI";
import { changeLang } from "../redux/actions/app";
import { colors } from "../util/colors";

class ChangeLang extends React.Component {
  componentDidUpdate(prevProps) {
    const { idLangPred, changeLang } = this.props;
    if (idLangPred !== prevProps.idLangPred && idLangPred !== "") {
      changeLang(idLangPred);
    }
  }

  getLangTraducido = (code) => {
    switch (code) {
      case "eus":
        return "Euskara(EUS)";
      case "es":
        return "Español(ES)";
      default:
        return "ERROR";
    }
  };

  getAllLang = () => {
    return Object.keys(i18n.services.resourceStore.data);
  };

  handleChangeLanguage = (lang) => {
    const { changeLang } = this.props;
    i18n.changeLanguage(lang);

    changeLang(lang);
  };

  render() {
    const { nowLang } = this.props;
    return (
      <div className="dropdown">
        <button
          className="btn dropdown-toggle w-100 text-white"
          style={{ backgroundColor: colors.green }}
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {this.getLangTraducido(nowLang)}
        </button>
        <div
          className="dropdown-menu w-100 text-center"
          aria-labelledby="dropdownMenuButton"
        >
          {this.getAllLang().map((lang) => {
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
    );
  }
}

const mapStateToProps = (state) => ({
  idLangPred: state.user.idLangPred,
  nowLang: state.app.nowLang,
});

const mapDispatchToProps = (dispatch) => ({
  changeLang: (payload) => dispatch(changeLang(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangeLang);
