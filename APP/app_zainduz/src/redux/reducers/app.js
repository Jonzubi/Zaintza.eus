import {CHANGE_FORM_CONTENT} from "../constants/app";

const initialState = {
        formContent : "tabla"      
};

function reducer(state = initialState, action){
    switch (action.type){
        case CHANGE_FORM_CONTENT:
            return Object.assign({},state,{formContent: action.payload})
        default:
            return state;
    }
}

export default reducer;