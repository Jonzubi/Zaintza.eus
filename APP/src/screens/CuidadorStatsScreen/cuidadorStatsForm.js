import React from "react";
import Axios from "axios";
import { connect } from "react-redux";
import ClipLoader from "react-spinners/ClipLoader";
import ipMaquina from "../../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import { trans } from "../../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Line } from "react-chartjs-2";
import moment from "moment";
import i18next from "i18next";

class CuidadorFormStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      visitasConLogin: [],
      visitasSinLogin: [],
    };
    this.chartReference = React.createRef();
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

  getChartDataVisitas = (nameArray) => {
    // name array será "visitasConLogin" o "visitasSinLogin"
    let savedMonths = [];

    this.state[nameArray].map((visita) => {
      const fechaVisto = moment(visita.fechaVisto);
      const isMonthSaved = savedMonths.find(
        (saved) => saved.month === fechaVisto.month()
      );
      if (!isMonthSaved) {
        savedMonths.push({
          month: fechaVisto.month(),
          countVisitas: 1,
        });
      } else {
        savedMonths = savedMonths.map((saved) => {
          if (saved.month === fechaVisto.month()) {
            saved.countVisitas += 1;
          }

          return saved;
        });
      }
    });

    return savedMonths;
  };

  getMonthLabels = () => {
    const visitasSinLogin = this.getChartDataVisitas("visitasSinLogin");
    const visitasConLogin = this.getChartDataVisitas("visitasConLogin");
    const monthLabels = [];

    // Con el primer array no habrá repetidos
    visitasSinLogin.map((visita) => {
      monthLabels.push(i18next.t(`meses.${visita.month}`));
    });

    visitasConLogin.map((visita) => {
      const label = i18next.t(`meses.${visita.month}`);

      if (!monthLabels.includes(label)) {
        monthLabels.push(label);
      }
    });

    return monthLabels;
  };

  getChartData = (canvas) => {
    return {
      labels: this.getMonthLabels(),
      datasets: [
        {
          label: i18next.t("cuidadorStatsForm.visitasSinLogin"),
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(52, 58, 64,0.4)",
          borderColor: "rgba(52, 58, 64,1)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(52, 58, 64,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(52, 58, 64,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.getChartDataVisitas("visitasSinLogin").map(
            (visita) => visita.countVisitas
          ),
        },
        {
          label: i18next.t("cuidadorStatsForm.visitasConLogin"),
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(40, 167, 69,0.4)",
          borderColor: "rgba(40, 167, 69,1)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(40, 167, 69,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(40, 167, 69,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.getChartDataVisitas("visitasConLogin").map(
            (visita) => visita.countVisitas
          ),
        },
      ],
    };
  };
  render() {
    const { isLoading, visitasConLogin, visitasSinLogin } = this.state;
    const data = this.getChartData;
    return (
      <div
        style={
          isLoading
            ? {}
            : {
                boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                height: "calc(100vh - 80px)",
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
                width:
                  window.innerWidth < 991
                    ? window.innerWidth
                    : window.innerWidth * 0.6,
                height: 400,
              }}
            >
              <Line data={data} />
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
  nowLang: state.app.nowLang,
});

export default connect(mapStateToProps)(CuidadorFormStats);
