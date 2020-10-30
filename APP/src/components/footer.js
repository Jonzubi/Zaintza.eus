import React from "react";
import { trans } from "../util/funciones";
import { colors } from "../util/colors";
import { useDispatch } from "react-redux";
import { changeFormContent } from "../redux/actions/app";
import moment from 'moment';
import { isMobile } from 'react-device-detect';

const Footer = () => {
  const dispatch = useDispatch();
  const handleAvisoLegalClick = () => {
    dispatch(changeFormContent("avisoLegal"));
  };
  const handlePrivacidadClick = () => {
    dispatch(changeFormContent("privacidad"))
  }

  return (
    <div
      style={{
        background: colors.grey,
        fontSize: 11,
        boxShadow: '0 -.125rem .25rem rgba(0,0,0,.075)'
      }}
      className="d-flex flex-row align-items-center justify-content-center p-2 bg-white"
    >
      <span
        className="mr-1"
      >
        Copyright © ZAINTZA {moment().format('YYYY')}
      </span>
      <span
        onClick={handleAvisoLegalClick}
        className="mr-1 footerLinks"
        style={{
          cursor: "pointer",
        }}
      >
        {trans("avisoLegal.avisoLegal")}
      </span>
      |
      <span
        onClick={handlePrivacidadClick}
        className="ml-1 footerLinks"
        style={{
          cursor: "pointer",
        }}
      >
        {trans("footer.privacidad")}
      </span>
    </div>
  );
};

export default Footer;
