import { CHANGE_FORM_CONTENT, CHANGE_LANG } from "../constants/app";

const initialState = {
    formContent : "tabla",
    nowLang: "eus"
};

function reducer(state = initialState, action){
    switch (action.type){
        case CHANGE_FORM_CONTENT:
            return Object.assign({},state,{formContent: action.payload})
        case CHANGE_LANG:
            return Object.assign({},state,{nowLang: action.payload})
        default:
            return state;
    }
}

export default reducer;