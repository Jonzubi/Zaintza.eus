import {TOOGLE_MENUPERFIL} from "../constants/menuPerfil";

const initialState = {
        isOpened : false      
};

function reducer(state = initialState, action){
    switch (action.type){
        case TOOGLE_MENUPERFIL:
            const auxIsOpened = action.payload || !state.isOpened;
            return Object.assign({},state,{isOpened:auxIsOpened});
        default:
            return state;
    }
}

export default reducer;