import {createStore} from "redux";
import rootReducer from "../reducers/rootReducer";
import {toogleMenuPerfil} from "../actions/menuPerfil";

const store = createStore(rootReducer);

window.store = store;
window.toogleMenu = toogleMenuPerfil;

export default store;