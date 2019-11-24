import {combineReducers} from "redux";
import menuPerfil from "../reducers/menuPerfil";
import app from "../reducers/app";
import user from "../reducers/user";

export default combineReducers({
    menuPerfil,
    app,
    user
});