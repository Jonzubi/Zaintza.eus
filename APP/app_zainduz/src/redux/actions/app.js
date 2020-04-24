import { CHANGE_FORM_CONTENT, CHANGE_LANG } from "../constants/app";

export function changeFormContent(payload){
    return {type: CHANGE_FORM_CONTENT, payload:payload};
};

export function changeLang(payload){
    return {
        type: CHANGE_LANG,
        payload
    }
}