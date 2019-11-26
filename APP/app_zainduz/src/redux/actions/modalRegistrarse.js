import {TOOGLE_MODAL} from "../constants/modalRegistrarse";

export function toogleModal(payload){
    return {type: TOOGLE_MODAL, payload:payload}
};