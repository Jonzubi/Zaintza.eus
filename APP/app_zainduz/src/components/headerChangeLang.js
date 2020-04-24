import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGlobe,
  } from "@fortawesome/free-solid-svg-icons";
import i18n from "i18next";
import { changeLang } from "../redux/actions/app";

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
    const { changeLang } = this.props;
    i18n.changeLanguage(lang);
    changeLang(lang);
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

const mapDispatchToProps = dispatch => ({
  changeLang: payload => dispatch(changeLang(payload))
});

export default connect(null, mapDispatchToProps)(HeaderChangeLang);
