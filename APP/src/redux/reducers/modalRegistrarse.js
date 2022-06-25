import {TOOGLE_MODAL, TOOGLE_MODAL_ENTIDAD} from "../constants/modalRegistrarse";

const initialState = {
    showModal: false,
    showModalEntidad: false
}

function reducer(state = initialState, action){
    switch(action.type){
        case TOOGLE_MODAL:
            return Object.assign({},state,{showModal: action.payload});
        case TOOGLE_MODAL_ENTIDAD:
            return Object.assign({},state,{showModalEntidad: action.payload});
        default:
            return state;
    }
}

export default reducer;