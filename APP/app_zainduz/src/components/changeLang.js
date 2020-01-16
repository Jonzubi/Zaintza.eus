import React from "react";
import i18n from "i18next";
import ipMaquina from "../util/ipMaquinaAPI";

class ChangeLang extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        nowLang: i18n.language
    }
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

  handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);

    this.setState({
        nowLang: lang
    });
  }

  render() {
      const { nowLang } = this.state;
    return (
      <div className="dropdown">
        <button
          className="btn btn-light dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {this.getLangTraducido(nowLang)}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {this.getAllLang().map(lang => {
            return (
              <a className="dropdown-item btn" onClick={() => this.handleChangeLanguage(lang)}>
                {this.getLangTraducido(lang)}
              </a>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ChangeLang;
