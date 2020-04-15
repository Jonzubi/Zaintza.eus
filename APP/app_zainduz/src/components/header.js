import React from "react";
import Headroom from "react-headroom";
import Avatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { changeFormContent } from "../redux/actions/app";
import "./styles/header.css";
import ipMaquina from "../util/ipMaquinaAPI";

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
      isLogIn: false
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

  render() {
    const IconAvatar = this.getAvatar.bind(this);
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
          <h1 className="w-100 d-inline text-light headerTitle">Zaintza</h1>
        </a>
        <IconAvatar />
      </div>
    );
  }
}

export default connect(MapStateToProps, MapDispachToProps)(Header);
