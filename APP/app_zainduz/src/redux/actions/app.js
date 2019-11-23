import {CHANGE_FORM_CONTENT} from "../constants/app";

export function changeFormContent(payload){
    return {type: CHANGE_FORM_CONTENT, payload:payload};
};