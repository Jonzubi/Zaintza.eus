import {TOOGLE_MENUPERFIL} from "../constants/menuPerfil";

export function toogleMenuPerfil(payload){
    return {type: TOOGLE_MENUPERFIL, payload:payload};
};