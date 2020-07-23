import { Translation } from "react-i18next";
import React from "react";

export const getRandomString = length => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const trans = codigo => {
  return <Translation>{t => t(codigo)}</Translation>;
};

export const arrayOfFalses = cont => {
  let array = [];
  for (let i = 0; i < cont; i++) {
    array.push(false);
  }
  return array;
};

export const getTodayDate = () => {
  var objToday = new Date();
  var dd = objToday.getDate();
  var mm = objToday.getMonth() + 1;

  var yyyy = objToday.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  var today = mm + "/" + dd + "/" + yyyy;
  return today;
};

export const isValidEmail = (email) => {
  const rex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return rex.test(String(email).toLowerCase());
}
