import React from "react";
import MenuPerfil from "./components/menuPerfil";
import Cabecera from "./components/header";
import SlideTab from "./components/slideTab";
import RegisterForm from "./components/registerFormCuidador";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { formContent: state.app.formContent };
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenMenuPerfil: false,
      formContent: "tabla"
    };
  }

  //Abre o cierra el menu segun el estado actual

  getContent() {
    switch (this.props.formContent) {
      case "tabla":
        return <SlideTab />;
      case "registrar":
        return <RegisterForm />;
    }
  }

  render() {
    const AppContent = this.getContent.bind(this);

    return (
      <div>
        <MenuPerfil />
        <div id="outer-container" className="w-100">
          <Cabecera />
          <AppContent />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
