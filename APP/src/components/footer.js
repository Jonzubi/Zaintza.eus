import React from "react";
import { trans } from "../util/funciones";
import { colors } from "../util/colors";
import { useDispatch } from "react-redux";
import { changeFormContent } from "../redux/actions/app";
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
        fontSize: 11
      }}
      className="d-flex flex-row align-items-center justify-content-center p-1 text-white"
    >
      <span
        onClick={handleAvisoLegalClick}
        className="mr-1"
        style={{
          cursor: "pointer",
        }}
      >
        {trans("avisoLegal.avisoLegal")}
      </span>
      |
      <span
        onClick={handlePrivacidadClick}
        className="ml-1"
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
