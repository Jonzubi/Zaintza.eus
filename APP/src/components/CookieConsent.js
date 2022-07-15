import React from "react";
import { useDispatch, useSelector } from "react-redux";
import i18next from "i18next";
import { changeFormContent } from '../redux/actions/app';
import { colors } from "../util/colors";

const AceptarCookies = () => {
  const dispatch = useDispatch();
  const nowLang = useSelector((state) => state.app.nowLang);

  const openAvisoLegal = () => {
    dispatch(changeFormContent('avisoLegal'))
  }
  return (
    <div
      location="bottom"
      buttonText={i18next.t("cookies.aceptar")}
      declineButtonText={i18next.t("cookies.denegar")}
      enableDeclineButton
      declineButtonStyle={{
        background: "transparent",
        color: colors.red,
        border: "1",
        borderColor: colors.red,
      }}
      buttonStyle={{ background: colors.green, color: colors.white }}
      style={{ background: "#343a40" }}
      expires={150}
      onAccept={() => console.log("Cookies aceptados")}
      onDecline={() => console.log("Cookies rechazados")}
    >
      {i18next.t("cookies.avisoCookies")}
      <a href="#" className="alert-link text-white" onClick={openAvisoLegal}>
        {i18next.t("cookies.linkAvisoLegal")}
      </a>
    </div>
  );
};

export default AceptarCookies;
