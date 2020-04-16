import React from "react";
import Headroom from "react-headroom";
import Avatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { changeFormContent } from "../redux/actions/app";
import "./styles/header.css";
import ipMaquina from "../util/ipMaquinaAPI";
import i18n from "i18next";

const MapDispachToProps = dispatch => {
  return {
    toogleMenuPerfil: payload => dispatch(toogleMenuPerfil(payload)),
    changeFormContent: form => dispatch(changeFormContent(form))
  };
};

const MapStateToProps = state => {
  return {    
    direcFoto: state.user.direcFoto,
    nombre: state.user.nombre,
    apellido1: state.user.apellido1 
  };
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogIn: false,
      hoverLang: ""
    };
  }

  getAvatar() {
    return (
      this.props.direcFoto == "" ?
      <FontAwesomeIcon
        size="3x"
        style={{ cursor: "pointer", color: "white" }}
        onClick={() => this.props.toogleMenuPerfil(true)}
        icon={faUserCircle}
      />
      :
      <Avatar name={this.props.nombre + " " + this.props.apellido1} src={"http://" + ipMaquina + ":3001/api/image/" + this.props.direcFoto}
              size={50}
              round={true}
              onClick={() => this.props.toogleMenuPerfil(true)}
              style={{ cursor: "pointer", color: "white" }} 
      />
    );
  }

  handleLangHover = (lang) => {
    this.setState({
      hoverLang: lang
    });
  }

  handleLangChange = (lang) => {
    i18n.changeLanguage(lang);
  }

  render() {
    const IconAvatar = this.getAvatar.bind(this);
    const { hoverLang } = this.state;
    return (
      <div
        style={{ background: "#343a40" }}
        id="headRoom"
        className="d-flex flex-row align-items-center p-1 justify-content-between fixed-top"
      >
        <a
          href="#"
          onClick={() => {
            this.props.changeFormContent("tabla");
          }}
          style={{ textDecoration: "none" }}
        >
          <h1 className="text-light">Zaintza</h1>
        </a>
        <div className="d-flex flex-row align-items-center">
          <div className="mr-5">
            <FontAwesomeIcon className="text-white mr-2" icon={faGlobe} />
            <span
              style={{
                cursor: "pointer",
                textDecoration: hoverLang === "eus" ? "underline" : ""
              }}
              onMouseEnter={() => this.handleLangHover("eus")}
              onMouseLeave={() => this.handleLangHover("")}
              onClick={() => this.handleLangChange("eus")}
              className="text-white mr-2">EUS</span>
            <span
              className="text-white mr-2">|</span>
            <span
              style={{
                cursor: "pointer",
                textDecoration: hoverLang === "es" ? "underline" : ""
              }}
              onMouseEnter={() => this.handleLangHover("es")}
              onMouseLeave={() => this.handleLangHover("")}
              onClick={() => this.handleLangChange("es")}
              className="text-white">ES</span>
          </div>
          <IconAvatar />
        </div>
      </div>
    );
  }
}

export default connect(MapStateToProps, MapDispachToProps)(Header);
