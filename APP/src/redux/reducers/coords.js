import { SET_COORDS, RESET_COORDS, SET_MAX_DISNTACE, RESET_MAX_DISNTACE } from "../constants/coords";

const initialState = {
    latitud : 0,
    longitud: 0,
    maxDistance: 30
};

function reducer(state = initialState, action){
    switch (action.type){
        case SET_COORDS:
            return Object.assign({},state,{latitud: action.payload.latitud, longitud: action.payload.longitud})
        case RESET_COORDS:
            return Object.assign({},state,{latitud: 0, longitud: 0})
        case SET_MAX_DISNTACE:
            return Object.assign({},state,{ maxDistance: action.payload })
        case RESET_MAX_DISNTACE:
            return Object.assign({},state,{ maxDistance: 0 })
        default:
            return state;
    }
}

export default reducer;