import React from "react";
import Axios from "axios";
import { connect } from "react-redux";
import ClipLoader from "react-spinners/ClipLoader";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import { trans } from "../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

class CuidadorFormStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      visitasConLogin: 0,
      visitasSinLogin: 0,
    };
  }
  componentDidMount() {
    const { email, contrasena, idPerfil } = this.props;
    Axios.post(
      `http://${ipMaquina}:3001/api/procedures/getCuidadorVisitas/${idPerfil}`,
      {
        email,
        contrasena,
      }
    )
      .then((res) => {
        this.setState({
          visitasConLogin: res.data.visitasConLogin,
          visitasSinLogin: res.data.visitasSinLogin,
          isLoading: false,
        });
      })
      .catch(() => {
        cogoToast.error(<h5>{trans("notificaciones.errorConexion")}</h5>);
        this.setState({
          isLoading: false,
        });
      });
  }
  render() {
    const { isLoading, visitasConLogin, visitasSinLogin } = this.state;
    return (
      <div
        style={
          isLoading
            ? {}
            : {
                boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                height: "calc(100vh - 80px)"
              }
        }
        className={isLoading ? "p-0" : "p-lg-5 p-2"}
      >
        {isLoading ? (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              height: "calc(100vh - 80px)",
            }}
          >
            <ClipLoader color="#28a745" />
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center">
            <div
              style={{
                width: 300,
              }}
              className="d-flex flex-row align-item-center justify-content-between"
            >
              <span>{trans("cuidadorStatsForm.visitasConLogin")}</span>
              <div>
                <span className="font-weight-bold">
                  {visitasConLogin.length}
                </span>
                <FontAwesomeIcon icon={faEye} className="ml-1" />
              </div>
            </div>
            <div
              style={{
                width: 300,
              }}
              className="d-flex flex-row align-item-center justify-content-between"
            >
              <span>{trans("cuidadorStatsForm.visitasSinLogin")}</span>
              <div>
                <span className="font-weight-bold">
                  {visitasSinLogin.length}
                </span>
                <FontAwesomeIcon icon={faEye} className="ml-1" />
              </div>
            </div>
            <div
              style={{
                width: 300,
              }}
              className="mt-2 d-flex flex-row align-item-center justify-content-between"
            >
              <span className="font-weight-bold">{trans("cuidadorStatsForm.totalVisitas")}</span>
              <div>
                <span className="font-weight-bold">
                  {parseInt(visitasSinLogin.length) + parseInt(visitasConLogin.length)}
                </span>
                <FontAwesomeIcon icon={faEye} className="ml-1" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  email: state.user.email,
  contrasena: state.user.contrasena,
  idPerfil: state.user._id,
});

export default connect(mapStateToProps)(CuidadorFormStats);
