import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeFormContent } from '../redux/actions/app';
import { trans } from '../util/funciones';

const TerminosDeUso = ({ terminosAceptados, setTerminosAceptados }) => {
    const dispatch = useDispatch();
    const nowLang = useSelector((state) => state.app.nowLang);
    return (
        <div className="mt-4 d-flex flex-row align-items-center">
            <input
                type="checkbox"
                style={{ cursor: 'pointer' }}
                className="mr-1 pointer"
                checked={terminosAceptados}
                onClick={setTerminosAceptados}
                id="isPublic"
            />
            <>
                {nowLang !== 'es' ?
                    <>
                        <span
                            onClick={() => dispatch(changeFormContent("avisoLegal"))}
                            style={{
                                color: "blue",
                                textDecoration: "underline",
                                cursor: "pointer",
                            }}
                            className="mr-1"
                        >
                            {trans("tablaCuidadores.linkHeLeidoTerminos")}
                        </span>
                        <span>{trans("tablaCuidadores.heLeidoTerminos")}</span>
                    </>
                    :
                    <>
                        <span>{trans("tablaCuidadores.heLeidoTerminos")}</span>
                        <span
                            onClick={() => dispatch(changeFormContent("avisoLegal"))}
                            style={{
                                color: "blue",
                                textDecoration: "underline",
                                cursor: "pointer",
                            }}
                            className="ml-1"
                        >
                            {trans("tablaCuidadores.linkHeLeidoTerminos")}
                        </span>
                    </>
                }
            </>
        </div>
    );
}

export default TerminosDeUso;