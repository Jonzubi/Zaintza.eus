import React from "react";
import { Slide, Dialog, DialogTitle } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { toogleModal } from "../redux/actions/modalRegistrarse";
import { trans } from '../util/funciones';
import "./styles/modalRegistrarse.css";
import { faHandHoldingHeart, faHandshake } from "@fortawesome/free-solid-svg-icons";
import ChooseEntity from "./ChooseEntity";
import ClipLoader from "react-spinners/ClipLoader";
import TerminosDeUso from "./TerminosDeUso";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ModalElegirEntidad = () => {
  const [entidad, setEntidad] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorEntidad, setErrorEntidad] = React.useState(false);
  const [terminosAceptados, setTerminosAceptados] = React.useState(false);
  const dispatch = useDispatch();
  const showModal = useSelector(state => state.modalRegistrarse.showModalEntidad);

  const handleRegister = () => {

  };

  return (
    <Dialog
      open={showModal}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => dispatch(toogleModal(false))}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{trans('registerFormUsuario.queEres')}</DialogTitle>
      <div className="mt-4 w-100 d-flex flex-row justify-content-around">
        <ChooseEntity
          entidad={entidad}
          onSelectEntidad={() => setEntidad('Cuidador')}
          nombreEntidad={"registerFormUsuario.soyCuidador"}
          icono={faHandHoldingHeart}
          selectedOn={"Cuidador"}
          error={errorEntidad}
        />
        <ChooseEntity
          entidad={entidad}
          onSelectEntidad={() => setEntidad('Cliente')}
          nombreEntidad={"registerFormUsuario.soyCliente"}
          icono={faHandshake}
          selectedOn={"Cliente"}
          error={errorEntidad}
        />
        <TerminosDeUso
          terminosAceptados={terminosAceptados}
          setTerminosAceptados={() => setTerminosAceptados(!terminosAceptados)}
        />
        {!isLoading ?
          <button
            disabled={!terminosAceptados}
            onClick={handleRegister}
            name="btnRegistrar"
            type="button"
            className="btn btn-success flex-fill mt-4"
          >
            {trans("loginForm.registrarse")}
          </button>
          : <div className="text-center mt-4"><ClipLoader color="#28a745" />
          </div>}
      </div>

    </Dialog>
  );
}

export default ModalElegirEntidad;
