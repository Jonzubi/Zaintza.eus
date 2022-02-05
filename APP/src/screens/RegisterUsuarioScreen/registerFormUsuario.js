import React, { useState } from "react";
import Logo from "../../util/images/Logo.png";
import { InputAdornment, TextField } from '@material-ui/core';
import { EmailRounded, Lock } from '@material-ui/icons';
import { colors } from '../../util/colors';
import { trans } from "../../util/funciones";

const RegisterFormUsuario = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          this.handleRegister();
        }
    };

    const handleRegister = () => {
        console.log({email, password, passwordConfirm});
        if (password !== passwordConfirm) {
            alert('Las contraseñas no coinciden');
            return;
        }
    }

    return (
        <div className="p-5 d-flex flex-column align-items-center justify-content-center" style={{
            minHeight: 'calc(100vh - 104px)'
        }}>
            
            <div
                className="d-flex flex-column mt-5 p-5"
                style={{ boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' }}>

                <img className="mb-5" width={256} height={125} src={Logo} alt="logo" />
                <TextField
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-4"
                    id="txtEmail"
                    aria-describedby="emailHelp"
                    label={trans("loginForm.insertEmail")}
                    value={email}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailRounded style={{ fill: colors.green }} />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-4"
                    type="password"
                    id="txtContrasena"
                    label={trans("loginForm.contrasena")}
                    value={password}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock style={{ fill: colors.green }} />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="mt-4"
                    type="password"
                    id="txtContrasenaConfirmar"
                    label={trans("loginForm.contrasenaRepetir")}
                    value={passwordConfirm}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock style={{ fill: colors.green }} />
                            </InputAdornment>
                        )
                    }}
                />
                <button
                    onClick={handleRegister}
                    name="btnRegistrar"
                    type="button"
                    className="btn btn-success flex-fill mt-5"
                >
                    {trans("loginForm.registrarse")}
                </button>
            </div>
        </div>
    );
};

export default RegisterFormUsuario;