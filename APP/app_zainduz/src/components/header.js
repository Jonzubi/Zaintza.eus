import React from "react";
import Headroom from "react-headroom";
import Avatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import {connect} from "react-redux";
import {toogleMenuPerfil} from "../redux/actions/menuPerfil";
import "./styles/header.css";


const mapDispachToProps = dispatch => {
  return {toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload))}
}

class Header extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isLogIn : false
    }
  }

  handleAvatarClick(){

  }

  getAvatar(){    
      return <FontAwesomeIcon 
              size="7x"
              style={{cursor: "pointer", color:"white"}}
              onClick={() => this.props.toogleMenuPerfil(true)}
              className="float-right mt-1 align-middle"
              icon={faUserCircle}
      
      />;
  }


  render() {
    const IconAvatar = this.getAvatar.bind(this);
    return (      
      <Headroom style={{background:"#343a40"}} id="headRoom" className="text-center w-100">
          <a href="#" onClick={() => {this.props.myChangeFormContent("tabla")}} style={{textDecoration : "none"}}><h1 className="w-100 d-inline display-1 text-light">Zainduz</h1></a>
          <IconAvatar />
      </Headroom>
    );
  }
}

export default connect(null,mapDispachToProps)(Header);
