import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faBell,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { changeFormContent } from "../redux/actions/app";
import HeaderChangeLang from "./headerChangeLang";
import "./styles/header.css";
import ipMaquina from "../util/ipMaquinaAPI";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { trans } from "../util/funciones";
import logo from '../util/images/Logo.png';
import protocol from '../util/protocol';
import { Avatar } from '@material-ui/core';

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
    tipoUsuario: state.user.tipoUsuario,
  };
};

class Header extends Component {
  getAvatar() {
    return this.props.direcFoto == "" ? (
      <FontAwesomeIcon
        size="3x"
        style={{ cursor: "pointer"}}
        onClick={() => this.props.toogleMenuPerfil(true)}
        icon={faUserCircle}
      />
    ) : (
      <Avatar
        name={this.props.nombre + " " + this.props.apellido1}
        src={`${this.getAvatarSrc()}`}
        onClick={() => this.props.toogleMenuPerfil(true)}
        style={{ cursor: "pointer"}}
      />
    );
  }

  getAvatarSrc = () => {
    if (this.props.direcFoto.includes("https://"))
      return this.props.direcFoto;
    
    return `${protocol}://${ipMaquina}:3001/api/image/${this.props.direcFoto}?isAvatar=true`;
  }

  handleBellClick = () => {
    const { changeFormContent } = this.props;
    changeFormContent("notificaciones");
  };

  render() {
    const IconAvatar = this.getAvatar.bind(this);
    const {
      countNotifies,
      direcFoto,
      tipoUsuario,
      changeFormContent,
    } = this.props;
    return (
      <div
        style={{
          boxShadow: '0 .125rem .25rem rgba(0,0,0,.075)',
          paddingLeft: 15,
          paddingRight: 15
        }}
        id="headRoom"
        className="d-flex flex-row align-items-center justify-content-between fixed-top bg-white"
      >
        <a
          href="#"
          onClick={() => {
            this.props.changeFormContent("tabla");
          }}
          className="d-flex flex-column"
          style={{ textDecoration: "none" }}
        >
          <img src={logo} alt="logo"  width={164} height={80} />
        </a>
        <div className="d-flex flex-row align-items-center">
          {tipoUsuario === "Cliente" ? (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip>
                  {trans("header.subirAnuncio")}
                </Tooltip>
              }
            >
              <FontAwesomeIcon
                style={{
                  cursor: 'pointer'
                }}
                className="mr-5 d-none d-sm-inline "
                icon={faUpload}
                onClick={() => changeFormContent("formAnuncio")}
              />
            </OverlayTrigger>
            
          ) : null}
          {direcFoto ? (
            <div
              onClick={() => this.handleBellClick()}
              style={{
                cursor: "pointer",
              }}
              className="mr-5 d-none d-sm-inline"
            >
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip>
                    {trans('header.notificaciones')}
                  </Tooltip>
                }
              >
                <div>
                  <FontAwesomeIcon icon={faBell} className="" />
                  {countNotifies > 0 ? (
                    <span className="badge badge-primary rounded-circle ml-1">
                      {countNotifies}
                    </span>
                  ) : null}
                </div>
                
              </OverlayTrigger>
              
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
