import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGlobe,
  } from "@fortawesome/free-solid-svg-icons";
import i18n from "i18next";

class HeaderChangeLang extends React.Component {
  constructor(props){
      super(props);
      this.state = {
        hoverLang: ""
      }
  }

  handleLangHover = (lang) => {
    this.setState({
      hoverLang: lang,
    });
  };

  handleLangChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  render() {
    const { hoverLang } = this.state;
    return (
      <div>
        <FontAwesomeIcon className="text-white mr-2" icon={faGlobe} />
        <span
          style={{
            cursor: "pointer",
            textDecoration: hoverLang === "eus" ? "underline" : "",
          }}
          onMouseEnter={() => this.handleLangHover("eus")}
          onMouseLeave={() => this.handleLangHover("")}
          onClick={() => this.handleLangChange("eus")}
          className="text-white mr-2"
        >
          EUS
        </span>
        <span className="text-white mr-2">|</span>
        <span
          style={{
            cursor: "pointer",
            textDecoration: hoverLang === "es" ? "underline" : "",
          }}
          onMouseEnter={() => this.handleLangHover("es")}
          onMouseLeave={() => this.handleLangHover("")}
          onClick={() => this.handleLangChange("es")}
          className="text-white"
        >
          ES
        </span>
      </div>
    );
  }
}

export default HeaderChangeLang;
