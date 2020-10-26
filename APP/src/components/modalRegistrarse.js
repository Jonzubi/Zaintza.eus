import React from "react";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalTitle from "react-bootstrap/ModalTitle";
import ModalBody from "react-bootstrap/ModalBody";
import ModalFooter from "react-bootstrap/ModalFooter";
import Button from "react-bootstrap/Button";
import { Slide } from "@material-ui/core";
import { connect, useDispatch, useSelector } from "react-redux";
import { toogleModal } from "../redux/actions/modalRegistrarse";
import { changeFormContent } from "../redux/actions/app";
import "./styles/modalRegistrarse.css";

const ModalRegistrarse = () => {
  const dispatch = useDispatch();
  const showModal = useSelector(state => state.modalRegistrarse.showModal);
  return (
    <Modal className="modalRegistrarse" show={showModal} onHide={() => dispatch(toogleModal(false))}>
      <ModalHeader closeButton>
        <ModalTitle>Izen ematea</ModalTitle>
      </ModalHeader>
      <ModalBody className="d-flex flex-row align-items-center justify-content-center">Nola nahiko zenuke izena eman, guraso gisa ala zaintzaile gisa?</ModalBody>
      <ModalFooter className="d-flex flex-row align-items-center justify-content-between">
        <Button className="" variant="success" onClick={() => { dispatch(toogleModal(false)); dispatch(changeFormContent("registrarCuidador")); }}>
          Zaintzaile gisa
          </Button>
        <Button className="" variant="success" onClick={() => { dispatch(toogleModal(false)); dispatch(changeFormContent("registrarCliente")); }}>
          Guraso gisa
          </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalRegistrarse;
