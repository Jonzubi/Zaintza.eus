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
        clientId=""
        buttonText="Login / Registrarse"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={"single_host_origin"}
        />
    );
}

export default MyGoogleLogin;