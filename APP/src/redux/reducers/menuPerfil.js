import { TOOGLE_MENUPERFIL } from "../constants/menuPerfil";

const initialState = {
    isOpened: false
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case TOOGLE_MENUPERFIL:
            return Object.assign({}, state, { isOpened: !state.isOpened });
        default:
            return state;
    }
}

export default reducer;