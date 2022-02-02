import React from "react";
import { GoogleLogin } from "react-google-login";

const MyGoogleLogin = () => {
    const onSuccessGoogle = (response) => {
        console.log(response);
    };

    const onFailureGoogle = (response) => {
        console.log(response);
    };
    
    return (
        <GoogleLogin
        clientId="1028885794620-71epbcb0u0k7fe6ia2h2ojmb0ebm8rd8.apps.googleusercontent.com"
        buttonText="Login / Registrarse"
        onSuccess={onSuccessGoogle}
        onFailure={onFailureGoogle}
        cookiePolicy={"single_host_origin"}
        />
    );
}

export default MyGoogleLogin;