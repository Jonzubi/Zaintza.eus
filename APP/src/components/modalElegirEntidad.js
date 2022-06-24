import React from "react";
import { Slide, Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { toogleModal, toogleModalEntidad } from "../redux/actions/modalRegistrarse";
import { trans } from '../util/funciones';
import "./styles/modalRegistrarse.css";
import { faHandHoldingHeart, faHandshake } from "@fortawesome/free-solid-svg-icons";
import ChooseEntity from "./ChooseEntity";
import ClipLoader from "react-spinners/ClipLoader";
import TerminosDeUso from "./TerminosDeUso";
import protocol from "../util/protocol";
import ipMaquinaAPI from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import axios from "../util/axiosInstance";
import { saveUserSession } from "../redux/actions/user";
import { changeLang } from "../redux/actions/app";
import i18next from "i18next";
import { SetMaxDistance } from "../redux/actions/coords";

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
  const email = useSelector(state => state.user.email);
  const direcFoto = useSelector(state => state.user.direcFoto);
  const tokenId = useSelector(state => state.user.tokenId);

  const handleRegister = async () => {
    setIsLoading(true);
    if (entidad === "") {
      setErrorEntidad(true);
      setIsLoading(false);
      return;
    }
    let errorInReq = false;
    await axios.post(`${protocol}://${ipMaquinaAPI}:3001/api/procedures/postNewUsuarioWithGoogle`, {
      email,
      entidad,
      direcFoto,
    }).catch(err => {
      errorInReq = true;
    });

    if (errorInReq) {
      cogoToast.error(<h5>{trans('commonErrors.errorGeneral')}</h5>)
      setIsLoading(false);
      return;
    }

    const resultado = await axios.post(`${protocol}://${ipMaquinaAPI}:3001/api/procedures/getUsuarioConPerfil`,
        {
            email,
            tokenId
        }
    ).catch(err => {
        cogoToast.error(<h5>{trans('commonErrors.errorGeneral')}</h5>);
        return;
    });

    const usuario = resultado.data.idUsuario;
    const idPerfil = usuario.idPerfil._id;
    const idUsuario = usuario._id;
    dispatch(saveUserSession(Object.assign({}, usuario.idPerfil, {
        _id: idPerfil,
        _idUsuario: idUsuario,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        contrasena: usuario.contrasena,
        idLangPred: resultado.data.idLangPred || "",
    })));
    i18next.changeLanguage(resultado.data.idLangPred);
    dispatch(changeLang(resultado.data.idLangPred));
    dispatch(SetMaxDistance(resultado.data.maxDistance));

    setIsLoading(false);
    dispatch(toogleModalEntidad(false));
  };

  return (
    <Dialog
      open={showModal}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => dispatch(toogleModalEntidad(false))}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{trans('modalEntidad.titulo')}</DialogTitle>
      <DialogContent>{trans('modalEntidad.content')}</DialogContent>
      <div className="mt-4 w-100 d-flex flex-column align-items-center p-5">
        <div className="w-100 d-flex flex-row justify-content-around">
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
        </div>

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
