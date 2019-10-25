import React from "react";
import Headroom from "react-headroom";
import Avatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import "./styles/header.css";

class Header extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isLogIn : false
    }
  }

  getAvatar(){
    if(!this.state.isLogIn)
      return <FontAwesomeIcon 
              size="7x"
              style={{cursor: "pointer", color:"white"}}
              onClick={() => this.props.myToogleMenu()}
              className="float-right mt-1 align-middle"
              icon={faUserCircle} 
      
      />;
    else
      return <Avatar
            style={{cursor:"pointer"}}
            onClick={() => this.props.myToogleMenu()}
            className="float-right align-middle"
            size={100}
            round="50px"
            src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
      />;
  }


  render() {
    const IconAvatar = this.getAvatar.bind(this);
    return (      
      <Headroom style={{background:"#343a40"}} id="headRoom" className="text-center w-100">
          <h1 className="w-100 d-inline display-1 text-light">Zainduz</h1>
          <IconAvatar />
      </Headroom>
    );
  }
}

export default Header;
