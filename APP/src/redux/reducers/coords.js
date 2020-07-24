import { SET_COORDS, RESET_COORDS } from "../constants/coords";

const initialState = {
    latitud : 0,
    longitud: 0
};

function reducer(state = initialState, action){
    switch (action.type){
        case SET_COORDS:
            return Object.assign({},state,{latitud: action.payload.latitud, longitud: action.payload.longitud})
        case RESET_COORDS:
            return Object.assign({},state,{latitud: 0, longitud: 0})
        default:
            return state;
    }
}

export default reducer;