import React from "react";
import { useSelector } from "react-redux";
import { trans } from "../../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import "./avisoLegal.css";

const AvisoLegal = () => {
  const nowLang = useSelector((state) => state.app.nowLang);
  return (
    <div className="d-flex flex-column p-5 avisoContenedor">
      <div className="d-flex flex-column align-items-center">
        <FontAwesomeIcon icon={faBalanceScale} size="6x" />
        <h1 className="mt-2 mb-1">{trans("avisoLegal.avisoLegal")}</h1>
        <hr style={{ height: 1 }} />
      </div>
      <div>
        <h3 className="my-4">{trans("avisoLegal.h3InfoTitular")}</h3>
        <span>{trans("avisoLegal.pInfoTitular")}</span>
        <h3 className="my-4">{trans("avisoLegal.h3DatosPersonales")}</h3>
        <span className="my-2 d-block">
          {trans("avisoLegal.pDatosPersonales1")}
        </span>
        <span className="my-2 d-block">
          {trans("avisoLegal.pDatosPersonales2")}
        </span>
        <span className="my-2 d-block">
          {trans("avisoLegal.pDatosPersonales3")}
        </span>
        <span className="my-2 d-block">
          {trans("avisoLegal.pDatosPersonales4")}
        </span>
        <span className="my-2 d-block">
          {trans("avisoLegal.pDatosPersonales5")}
        </span>
        <span className="my-2 d-block">
          {trans("avisoLegal.pDatosPersonales6")}
        </span>
        {nowLang !== "eus" ? (
          <span className="my-2 d-block">
            {trans("avisoLegal.pDatosPersonales7")}
          </span>
        ) : null}
        <h3 className="my-4">{trans("avisoLegal.h3NormativaLegal")}</h3>
        <span className="my-2 d-block">
          {trans("avisoLegal.pNormativaLegal1")}
        </span>
        <span className="my-2 d-block">
          {trans("avisoLegal.pNormativaLegal2")}
        </span>
        <h3 className="my-4">{trans("avisoLegal.h3PoliticaEnlaces")}</h3>
        <span className="my-2 d-block">
          {trans("avisoLegal.pPoliticaEnlaces")}
        </span>
        <h3 className="my-4">{trans("avisoLegal.h3UsoCookies")}</h3>
        <span className="my-2 d-block">{trans("avisoLegal.pUsoCookies")}</span>
        <h5 className="my-2">{trans("avisoLegal.h5QueSonCookies")}</h5>
        <span className="my-2 d-block">
          {trans("avisoLegal.pExpliCookies")}
        </span>
        <ul>
          <li>{trans("avisoLegal.liCookie1")}</li>
          <li>{trans("avisoLegal.liCookie2")}</li>
          <li>{trans("avisoLegal.liCookie3")}</li>
          <li>{trans("avisoLegal.liCookie4")}</li>
          <li>{trans("avisoLegal.liCookie5")}</li>
          <li>{trans("avisoLegal.liCookie6")}</li>
          <li>{trans("avisoLegal.liCookie7")}</li>
        </ul>
        <span className="my-2 d-block">
          {trans("avisoLegal.pVerInfoPorFavor")}
        </span>
        <h5 className="my-2">{trans("avisoLegal.h5CookiesDeTercera")}</h5>
        <span className="my-2 d-block">
          {trans("avisoLegal.pCookieTerceros")}
        </span>
        <h5 className="my-2">{trans("avisoLegal.h5CookiesPropias")}</h5>
        <span className="my-2 font-italic d-block">
          {trans("avisoLegal.pItalicAuthCookie")}
        </span>
        <span className="my-2 d-block">{trans("avisoLegal.pAuthCookie")}</span>
        <span className="my-2 font-italic d-block">
          {trans("avisoLegal.pItalicPersoInter")}
        </span>
        <span className="my-2 d-block">{trans("avisoLegal.pPersoInter")}</span>
        <span className="my-2 font-italic d-block">
          {trans("avisoLegal.pItalicPubliCookie")}
        </span>
        <span className="my-2 d-block">{trans("avisoLegal.pCookiePubli")}</span>
        <span className="my-2 font-italic d-block">
          {trans("avisoLegal.pItalicComPubliCookie")}
        </span>
        <span className="my-2 d-block">{trans("avisoLegal.pCompPubli")}</span>
        <span className="my-2 font-italic d-block">
          {trans("avisoLegal.h5DeleteCookie")}
        </span>
        <span className="my-2 d-block">
          {trans("avisoLegal.pCanDeleteCookie")}
        </span>
        <ul>
          <li>
            <a
              target="_blank"
              className="text-success"
              href="https://support.google.com/chrome/answer/95647?hl=es"
            >
              {trans("avisoLegal.liDeleteCookieChrome")}
            </a>
          </li>
          <li>
            <a
              target="_blank"
              className="text-success"
              href="https://support.mozilla.org/es/kb/Borrar%20cookies"
            >
              {trans("avisoLegal.liDeleteCookieFirefox")}
            </a>
          </li>
          <li>
            <a
              target="_blank"
              className="text-success"
              href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies#ie=ie-10"
            >
              {trans("avisoLegal.liDeleteCookieInternetExplorer")}
            </a>
          </li>
          <li>
            <a
              target="_blank"
              className="text-success"
              href="https://support.apple.com/es-es/HT201265"
            >
              {trans("avisoLegal.liDeleteCookieSafari")}
            </a>
          </li>
          <li>
            <a
              target="_blank"
              className="text-success"
              href="https://www.opera.com/es/privacy"
            >
              {trans("avisoLegal.liDeleteCookieOpera")}
            </a>
          </li>
        </ul>
        <span>{trans("avisoLegal.pMoreInfo")}</span>(
        <a
          className="text-success"
          href="https://www.aepd.es/es/guias-y-herramientas/guias"
        >
          {trans("avisoLegal.aIrGuias")}
        </a>
        )
      </div>
    </div>
  );
};

export default AvisoLegal;
