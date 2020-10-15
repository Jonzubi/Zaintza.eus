import React from "react";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalTitle from "react-bootstrap/ModalTitle";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import Button from "react-bootstrap/Button";
import { connect } from "react-redux";
import {toogleModal} from "../redux/actions/modalRegistrarse";
import {changeFormContent} from "../redux/actions/app";
import "./styles/modalRegistrarse.css";

const mapStateToProps = state => {
  return {
    showModal: state.modalRegistrarse.showModal
  };
};

const mapDispatchToProps = dispatch => {
    return {
        toogleModal: (payload) => dispatch(toogleModal(payload)),
        changeFormContent: (payload) => dispatch(changeFormContent(payload))
    };
}

class ModalRegistrarse extends React.Component {
  render() {
    return (
      <Modal className="modalRegistrarse" show={this.props.showModal} onHide={() => this.props.toogleModal(false)}>
        <ModalHeader closeButton>
          <ModalTitle>Izen ematea</ModalTitle>
        </ModalHeader>
        <ModalBody className="d-flex flex-row align-items-center justify-content-center">Nola nahiko zenuke izena eman, guraso gisa ala zaintzaile gisa?</ModalBody>
        <ModalFooter className="d-flex flex-row align-items-center justify-content-between">
          <Button className="" variant="success" onClick={() => {this.props.toogleModal(false);this.props.changeFormContent("registrarCuidador")}}>
            Zaintzaile gisa
          </Button>
          <Button className="" variant="success" onClick={() => {this.props.toogleModal(false);this.props.changeFormContent("registrarCliente");}}>
            Guraso gisa
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalRegistrarse);
