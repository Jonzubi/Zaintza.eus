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
    direcFoto: state.user.direcFoto    
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
    console.log(this.props);
    return (
      this.props.direcFoto == "" ?
      <FontAwesomeIcon
        size="7x"
        style={{ cursor: "pointer", color: "white" }}
        onClick={() => this.props.toogleMenuPerfil(true)}
        className="float-right mt-1 align-middle"
        icon={faUserCircle}
      />
      :
      <Avatar name={this.props.nombre + " " + this.props.apellido1} src={"http://" + ipMaquina + ":3001/image/" + this.props.direcFoto} 
              className="float-right mt-1 align-middle"
              round={true}
              onClick={() => this.props.toogleMenuPerfil(true)}
              style={{ cursor: "pointer", color: "white" }} 
      />
    );
  }

  render() {
    const IconAvatar = this.getAvatar.bind(this);
    return (
      <Headroom
        style={{ background: "#343a40" }}
        id="headRoom"
        className="text-center w-100"
      >
        <a
          href="#"
          onClick={() => {
            this.props.changeFormContent("tabla");
          }}
          style={{ textDecoration: "none" }}
        >
          <h1 className="w-100 d-inline display-1 text-light">Euskal zaintza</h1>
        </a>
        <IconAvatar />
      </Headroom>
    );
  }
}

export default connect(MapStateToProps, MapDispachToProps)(Header);
