import React from "react";
import { useSelector } from 'react-redux';
import CookieConsent from "react-cookie-consent";
import i18next from "i18next";
import { colors } from "../util/colors";

const AceptarCookies = () => {
  const nowLang = useSelector((state) => state.app.nowLang);
  return (
    <CookieConsent
      location="bottom"
      buttonText={i18next.t('cookies.aceptar')}
      declineButtonText={i18next.t('cookies.denegar')}
      enableDeclineButton
      declineButtonStyle= {{ background: 'transparent', color: colors.red, border: "1", borderColor: colors.red }}
      buttonStyle={{ background: colors.green, color: colors.white }}
      style={{ background: "#343a40" }}
      expires={150}
      onAccept={() => console.log("Cookies aceptados")}
      onDecline={() => console.log("Cookies rechazados")}
    >
      {i18next.t('cookies.avisoCookies')}
    </CookieConsent>
  );
};

export default AceptarCookies;
