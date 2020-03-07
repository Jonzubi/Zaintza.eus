import { SET_COUNT_NOTIFY } from "../constants/notifications";

export function setCountNotify(payload){
    return {type: SET_COUNT_NOTIFY, payload:payload}
};