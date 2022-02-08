import React, { useState } from "react";
import Logo from "../../util/images/Logo.png";
import { InputAdornment, TextField } from '@material-ui/core';
import { EmailRounded, Lock } from '@material-ui/icons';
import { colors } from '../../util/colors';
import { isValidEmail, trans } from "../../util/funciones";
import cogoToast from "cogo-toast";
import Axios from "axios";
import protocol from "../../util/protocol";
import ipMaquina from "../../util/ipMaquinaAPI";
import ClipLoader from "react-spinners/ClipLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart, faHandshake } from "@fortawesome/free-solid-svg-icons";

const RegisterFormUsuario = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [entidad, setEntidad] = useState('');
    const [errorEmail, setErrorEmail] = useState(false);
    const [errorPassword, setErrorPassword] = useState(false);
    const [errorEntidad, setErrorEntidad] = useState(false);

    const ChooseEntity = ({ nombreEntidad, icono, onSelectEntidad, selectedOn, error }) => {
        return (
            <div onClick={onSelectEntidad} style={{ backgroundColor: entidad === selectedOn ? colors.green : colors.white, borderRadius: 7, cursor: 'pointer', border: error ? `1px solid ${colors.red}` : '' }} className="d-flex flex-column align-items-center p-3">
                <FontAwesomeIcon size="2x" icon={icono} className="" style={{ color: entidad === selectedOn ? colors.white : colors.green }} />
                <h5 style={{ color: entidad === selectedOn ? colors.white : colors.black }} className="mt-2">{nombreEntidad}</h5>
            </div>);
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            this.handleRegister();
        }
    };

    const handleRegister = async () => {
        setErrorEmail(false);
        setErrorPassword(false);
        setErrorEntidad(false);
        setIsLoading(true);
        
        if (!isValidEmail(email)) {
            setErrorEmail(true);
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            cogoToast.error(<h5>{trans('commonErrors.contrasenaMinima')}</h5>);
            setErrorPassword(true);
            setIsLoading(false);
            return;
        }

        if (password !== passwordConfirm){
            setErrorPassword(true);
            setIsLoading(false);
            return;
        }

        if (entidad === ''){
            setErrorEntidad(true);
            setIsLoading(false);
            return;
        }
        let errorInReq = false;
        await Axios.post(`${protocol}://${ipMaquina}:3001/api/procedures/postNewUsuario/`, {
            email,
            contrasena: password,
            entidad
        }).catch(err => {
            errorInReq = true;
            if (err.response.data === 'Email existente') {
                cogoToast.error(<h5>{trans('commonErrors.emailExiste')}</h5>);
                setErrorEmail(true);
            }
        });

        if (errorInReq) {
            cogoToast.error(<h5>{trans('commonErrors.errorGeneral')}</h5>)
            setIsLoading(false);
            return;
        }
        await Axios.post(`${protocol}://${ipMaquina}:3003/smtp/registerEmail`, {
            toEmail: email
        }).catch(err => {
            errorInReq = true;
        });

        if (errorInReq) {
            cogoToast.error(<h5>{trans('commonErrors.errorGeneral')}</h5>)
            setIsLoading(false);
            return;
        }

        cogoToast.success(
            trans("registerFormClientes.registroCompletado")
        );
        setIsLoading(false);
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
                    error={errorEmail}
                    helperText={trans('commonErrors.invalidEmail')}
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
                    error={errorPassword}
                    helperText={trans('commonErrors.contrasenaNoCoincide')}
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
                    error={errorPassword}
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
                <div className="mt-4 d-flex flex-column align-items-center">
                    <h4>{trans('registerFormUsuario.queEres')}</h4>
                    <div className="mt-4 w-100 d-flex flex-row justify-content-around">
                        <ChooseEntity
                            onSelectEntidad={() => setEntidad('Cuidador')}
                            nombreEntidad={"Zaintzailea"}
                            icono={faHandHoldingHeart}
                            selectedOn={"Cuidador"}
                            error={errorEntidad}
                        />
                        <ChooseEntity
                            onSelectEntidad={() => setEntidad('Cliente')}
                            nombreEntidad={"Bezeroa"}
                            icono={faHandshake}
                            selectedOn={"Cliente"}
                            error={errorEntidad}
                        />
                    </div>
                </div>

                {!isLoading ?
                    <button
                        onClick={handleRegister}
                        name="btnRegistrar"
                        type="button"
                        className="btn btn-success flex-fill mt-5"
                    >
                        {trans("loginForm.registrarse")}
                    </button>
                    : <div className="text-center mt-5"><ClipLoader color="#28a745" />
                    </div>}
            </div>
        </div>
    );
};

export default RegisterFormUsuario;