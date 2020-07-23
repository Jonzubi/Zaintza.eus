import {combineReducers} from "redux";
import menuPerfil from "../reducers/menuPerfil";
import app from "../reducers/app";
import user from "../reducers/user";
import modalRegistrarse from "../reducers/modalRegistrarse";
import notification from "../reducers/notification";

export default combineReducers({
    menuPerfil,
    app,
    user,
    modalRegistrarse,
    notification
});