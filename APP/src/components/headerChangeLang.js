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
    const { nowLang } = this.props;
    return (
      <div>
        <FontAwesomeIcon className="mr-2" icon={faGlobe} />
        <span
          style={{
            cursor: "pointer",
            textDecoration: hoverLang === "eus" ? "underline" : "",
          }}
          onMouseEnter={() => this.handleLangHover("eus")}
          onMouseLeave={() => this.handleLangHover("")}
          onClick={() => this.handleLangChange("eus")}
          className={nowLang === "eus" ? "text-success mr-2 font-weight-bold" : "mr-2"}
        >
          EUS
        </span>
        <span className="mr-2">|</span>
        <span
          style={{
            cursor: "pointer",
            textDecoration: hoverLang === "es" ? "underline" : "",
          }}
          onMouseEnter={() => this.handleLangHover("es")}
          onMouseLeave={() => this.handleLangHover("")}
          onClick={() => this.handleLangChange("es")}
          className={nowLang === "es" ? "text-success font-weight-bold" : ""}
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

const mapStateToProps = state => ({
  nowLang: state.app.nowLang
})

export default connect(mapStateToProps, mapDispatchToProps)(HeaderChangeLang);
