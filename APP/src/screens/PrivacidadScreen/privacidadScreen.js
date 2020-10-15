import React from 'react';
import { useSelector } from "react-redux";
import { trans } from "../../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import './privacidad.css'

const PrivacidadScreen = () => {
    return (
        <div className="d-flex flex-column p-5 privacidadContenedor">
            <div className="d-flex flex-column align-items-center">
                <FontAwesomeIcon icon={faLock} size="6x" />
                <h1 className="mt-2 mb-1">{trans("privacidadScreen.privacidad")}</h1>
                <hr style={{ height: 1 }} />
            </div>
            <div className="d-flex flex-column p-3 mb-5 border rounded">
                <div className="mt-4 mb-2 d-flex flex-row align-items-center justify-content-between">
                    <span className="font-weight-bold">{trans('privacidadScreen.responsable')}</span>
                    <span style={{ maxWidth: '50%' }}>{trans('privacidadScreen.txtResponsable')}</span>
                </div>
                <div className="my-2 d-flex flex-row align-items-center justify-content-between">
                    <span className="font-weight-bold">{trans('privacidadScreen.finalidad')}</span>
                    <span style={{ maxWidth: '50%' }}>{trans('privacidadScreen.txtFinalidad')}</span>
                </div>
                <div className="my-2 d-flex flex-row align-items-center justify-content-between">
                    <span className="font-weight-bold">{trans('privacidadScreen.legitimacion')}</span>
                    <span style={{ maxWidth: '50%' }}>{trans('privacidadScreen.txtLegitimacion')}</span>
                </div>
                <div className="my-2 d-flex flex-row align-items-center justify-content-between">
                    <span className="font-weight-bold">{trans('privacidadScreen.destinatarios')}</span>
                    <span style={{ maxWidth: '50%' }}>{trans('privacidadScreen.txtDestinatarios')}</span>
                </div>
                <div className="my-2 d-flex flex-row align-items-center justify-content-between">
                    <span className="font-weight-bold">{trans('privacidadScreen.derechos')}</span>
                    <span style={{ maxWidth: '50%' }}>{trans('privacidadScreen.txtDerechos')}</span>
                </div>
                <div className="my-2 d-flex flex-row align-items-center justify-content-between">
                    <span className="font-weight-bold">{trans('privacidadScreen.infoAdicional')}</span>
                    <span style={{ maxWidth: '50%' }}>{trans('privacidadScreen.txtInfoAdicional')}</span>
                </div>
            </div>

        </div >
    )
}

export default PrivacidadScreen;