import React from "react";
import MenuPerfil from "./components/menuPerfil";
import Cabecera from "./components/header";
import SlideTab from "./components/slideTab";
import RegisterForm from "./components/registerForm";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenMenuPerfil: false,
      formContent : "tabla"
    };
  }
  handleStateChange(state) {
    this.setState({ isOpenMenuPerfil: state.isOpen });
  }

  //Abre o cierra el menu segun el estado actual
  toggleMenu() {
    this.setState(state => ({ isOpenMenuPerfil: !state.isOpenMenuPerfil }));
  }

  changeFormContent(form){
    this.setState({
      formContent : form
    });
  }

  getContent(){
    switch (this.state.formContent){
      case "tabla":
        return <SlideTab />;
      case "registrar":
        return <RegisterForm myChangeFormContent = {this.changeFormContent.bind(this)} />;
    }
  }

  render() {
    const AppContent = this.getContent.bind(this);

    return (
      <div id="outer-container" className="w-100">
        <MenuPerfil myChangeFormContent = {this.changeFormContent.bind(this)} myToogleMenu = {this.toggleMenu.bind(this)} myIsOpenMenuPerfil={this.state.isOpenMenuPerfil} myHandleStateChange={this.handleStateChange.bind(this)} />
        <Cabecera myChangeFormContent = {this.changeFormContent.bind(this)} myToogleMenu= {this.toggleMenu.bind(this)} />
        <AppContent />
      </div>
    );
  }
}

export default App;
