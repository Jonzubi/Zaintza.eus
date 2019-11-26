import {TOOGLE_MODAL} from "../constants/modalRegistrarse";

const initialState = {
    showModal: false
}

function reducer(state = initialState, action){
    switch(action.type){
        case TOOGLE_MODAL:
            return Object.assign({},state,{showModal: action.payload})
        default:
            return state;
    }
}

export default reducer;