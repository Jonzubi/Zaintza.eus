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

const MyGoogleLogin = () => {
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
            dispatch(toogleModal(false));
            dispatch(toogleMenuPerfil(false));
            dispatch(saveUserSession({ email }))
        }
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