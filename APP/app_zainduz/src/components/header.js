import React from "react";
import Headroom from "react-headroom";
import Avatar from "react-avatar";
import "./styles/header.css";

class Header extends React.Component {
  render() {
    return (      
      <Headroom style={{background:"#343a40"}} id="headRoom" className="text-center w-100">
          <h1 className="w-100 d-inline display-1 text-light">Zainduz</h1>
          <Avatar
            style={{cursor:"pointer"}}
            onClick={() => this.props.myToogleMenu()}
            className="float-right mt-1 align-middle"
            size={100}
            round="50px"
            src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
          />
        </Headroom>
    );
  }
}

export default Header;
