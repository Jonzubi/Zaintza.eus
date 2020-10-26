import React from "react";
import { Slide, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { toogleModal } from "../redux/actions/modalRegistrarse";
import { changeFormContent } from "../redux/actions/app";
import { trans } from '../util/funciones';
import "./styles/modalRegistrarse.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ModalRegistrarse = () => {
  const dispatch = useDispatch();
  const showModal = useSelector(state => state.modalRegistrarse.showModal);
  return (
    <Dialog
      open={showModal}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => dispatch(toogleModal(false))}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{trans('modalRegistrarse.titulo')}</DialogTitle>
      <DialogContent>{trans('modalRegistrarse.content')}</DialogContent>
      <DialogActions>
        <Button className="" variant="success" onClick={() => { dispatch(toogleModal(false)); dispatch(changeFormContent("registrarCuidador")); }}>
          {trans('modalRegistrarse.comoCuidador')}
        </Button>
        <Button className="" variant="success" onClick={() => { dispatch(toogleModal(false)); dispatch(changeFormContent("registrarCliente")); }}>
          {trans('modalRegistrarse.comoCliente')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalRegistrarse;
