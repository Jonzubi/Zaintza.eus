import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import store from "./redux/store/index";
import {useTranslation, initReactI18next} from 'react-i18next';
import i18n from 'i18next';
import App from './App';
import zainduz_eus from "./lang/eus/common.json";
import * as serviceWorker from './serviceWorker';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            eus: {
                translation: zainduz_eus
            }
        },
        lng: "eus",
        fallbackLng: "eus",
        interpolation: {
            escapeValue: false
        }
    });


ReactDOM.render(
    <Provider store={store}>
            <App />
    </Provider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
