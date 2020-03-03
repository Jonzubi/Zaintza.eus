import React from "react";
import i18n from "i18next";
import { connect } from "react-redux";
import ipMaquina from "../util/ipMaquinaAPI";

class ChangeLang extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowLang: props.idLangPred || i18n.language
    };
  }

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

  getAllLang = () => {
    return Object.keys(i18n.services.resourceStore.data);
  };

  handleChangeLanguage = lang => {
    i18n.changeLanguage(lang);

    this.setState({
      nowLang: lang
    });
  };

  render() {
    const { nowLang } = this.state;
    return (
      <div className="dropdown w-100 d-flex mt-5">
        <button
          className="btn btn-light dropdown-toggle w-100"
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
    );
  }
}

const mapStateToProps = state => ({
  idLangPred: state.user.idLangPred
});

export default connect(mapStateToProps, null)(ChangeLang);
