import React from "react";
import { Calendar } from "react-big-calendar";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario
  };
};

class CalendarioForm extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <h1>Calendario</h1>;
  }
}

export default connect(mapStateToProps, null)(CalendarioForm);
