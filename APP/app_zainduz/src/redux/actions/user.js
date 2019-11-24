import {SAVE_USER, INITIALIZE_USER} from "../constants/user";

export function saveUserSession(payload){
    return {type: SAVE_USER, payload:payload};
};

export function initializeUserSession() {
    return {type: INITIALIZE_USER, payload:null}
};