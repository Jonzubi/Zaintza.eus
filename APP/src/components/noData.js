import React from "react";
import noData from "../util/images/noData.svg";
import { trans } from "../util/funciones";
import { useDispatch } from "react-redux";
import { toogleModal } from "../redux/actions/modalRegistrarse";

const NoData = () => {
  const dispatch = useDispatch();
  return (
    <div className="p-2 d-flex flex-column align-items-center">
      <img src={noData} width={150} height={150} />
      <h3 className="my-5">{trans("tablaCuidadores.noData")}</h3>
      <button
        onClick={() => {
          dispatch(toogleModal(true));
        }}
        name="btnRegistrar"
        type="button"
        className="btn btn-success w-100"
      >
        {trans("loginForm.registrarse")}
      </button>
    </div>
  );
};

export default NoData;
