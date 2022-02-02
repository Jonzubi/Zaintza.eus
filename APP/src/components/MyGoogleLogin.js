import React from "react";
import { GoogleLogin } from "react-google-login";

const MyGoogleLogin = ({ onSuccess, onFailure }) => {
    const onSuccessGoogle = (response) => {
        //onSuccess(response);
    };

    const onFailureGoogle = (response) => {
        //onFailure(response);
    };
    
    return (
        <GoogleLogin
        clientId="1028885794620-71epbcb0u0k7fe6ia2h2ojmb0ebm8rd8.apps.googleusercontent.com"
        buttonText="Login / Registrarse"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={"single_host_origin"}
        />
    );
}

export default MyGoogleLogin;