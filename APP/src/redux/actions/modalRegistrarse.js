import {TOOGLE_MODAL, TOOGLE_MODAL_ENTIDAD} from "../constants/modalRegistrarse";

export function toogleModal(payload){
    return {type: TOOGLE_MODAL, payload:payload}
};

export function toogleModalEntidad(payload){
    return {type: TOOGLE_MODAL_ENTIDAD, payload:payload}
};