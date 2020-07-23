import {SET_COUNT_NOTIFY} from "../constants/notifications";

const initialState = {
    countNotifies: 0
}

function reducer(state = initialState, action){
    switch(action.type){
        case SET_COUNT_NOTIFY:
            return Object.assign({},state,{countNotifies: action.payload})
        default:
            return state;
    }
}

export default reducer;