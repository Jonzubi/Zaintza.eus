import React from "react";
import { GoogleLogin } from "react-google-login";
import { trans } from "../util/funciones";
import GoogleButton from 'react-google-button'
import { useDispatch } from 'react-redux';
import cogoToast from "cogo-toast";
import axios from '../util/axiosInstance'
import ipMaquinaAPI from "../util/ipMaquinaAPI";
import protocol from "../util/protocol";
import { toogleModalEntidad, toogleModal } from "../redux/actions/modalRegistrarse";
import { saveUserSession } from "../redux/actions/user";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { changeLang } from "../redux/actions/app";
import i18next from "i18next";
import { SetMaxDistance } from "../redux/actions/coords";

const MyGoogleLogin = ({ socket }) => {
    const dispatch = useDispatch();
    const onSuccessGoogle = async (response) => {
        console.log(response);
        const email = response.profileObj.email;
        const emailExistente = await axios.get(
            `${protocol}://${ipMaquinaAPI}:3001/api/procedures/checkIfEmailExists/${email}`
        );

        if (emailExistente.data !== "True") {
            // El email no existe, se debe crear el usuario
            dispatch(toogleModalEntidad(true));
            dispatch(saveUserSession({ email, direcFoto: response.profileObj.imageUrl, tokenId: response.tokenId }));
        } else {
            const tokenId = response.tokenId;
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
            socket.emit("login", {
                idUsuario: idUsuario,
            });
        }
        dispatch(toogleModal(false));
        dispatch(toogleMenuPerfil(false));
        cogoToast.success(
            <h5>{trans("notificaciones.sesionIniciada")}</h5>
        );
    };

    return (
        <GoogleLogin
            clientId="1028885794620-71epbcb0u0k7fe6ia2h2ojmb0ebm8rd8.apps.googleusercontent.com"
            onSuccess={onSuccessGoogle}
            render={renderProps => (<GoogleButton onClick={renderProps.onClick} label={trans('loginForm.googleLogin')} />)}
        />
    );
}

export default MyGoogleLogin;