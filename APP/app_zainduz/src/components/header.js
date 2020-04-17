import React from "react";
import Avatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { changeFormContent } from "../redux/actions/app";
import HeaderChangeLang from './headerChangeLang';
import "./styles/header.css";
import ipMaquina from "../util/ipMaquinaAPI";

const MapDispachToProps = (dispatch) => {
  return {
    toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload)),
    changeFormContent: (form) => dispatch(changeFormContent(form)),
  };
};

const MapStateToProps = (state) => {
  return {
    direcFoto: state.user.direcFoto,
    nombre: state.user.nombre,
    apellido1: state.user.apellido1,
    countNotifies: state.notification.countNotifies,
  };
};

class Header extends React.Component {
  getAvatar() {
    return this.props.direcFoto == "" ? (
      <FontAwesomeIcon
        size="3x"
        style={{ cursor: "pointer", color: "white" }}
        onClick={() => this.props.toogleMenuPerfil(true)}
        icon={faUserCircle}
      />
    ) : (
      <Avatar
        name={this.props.nombre + " " + this.props.apellido1}
        src={"http://" + ipMaquina + ":3001/api/image/" + this.props.direcFoto}
        size={50}
        round={true}
        onClick={() => this.props.toogleMenuPerfil(true)}
        style={{ cursor: "pointer", color: "white" }}
      />
    );
  }

  handleBellClick = () => {
    const { changeFormContent } = this.props;
    changeFormContent("notificaciones");
  };

  render() {
    const IconAvatar = this.getAvatar.bind(this);
    const { countNotifies, direcFoto } = this.props;
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
          {direcFoto ? (
            <div
              onClick={() => this.handleBellClick()}
              style={{
                cursor: "pointer",
              }}
              className="mr-5 d-none d-sm-inline"
            >
              <FontAwesomeIcon icon={faBell} className="text-white" />
              {countNotifies > 0 ? (
                <span className="badge badge-primary rounded-circle ml-1">
                  {countNotifies}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mr-5">
            <HeaderChangeLang />
          </div>
          <IconAvatar />
        </div>
      </div>
    );
  }
}

export default connect(MapStateToProps, MapDispachToProps)(Header);
