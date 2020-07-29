import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { connect } from "react-redux";
import ipMaquina from "../../util/ipMaquinaAPI";
import axios from "axios";
import moment from "moment";
import ClipLoader from "react-spinners/ClipLoader";
import "react-big-calendar/lib/css/react-big-calendar.css";

const mapStateToProps = (state) => {
  return {
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario,
    email: state.user.email,
    contrasena: state.user.contrasena,
    nowLang: state.app.nowLang,
  };
};

class CalendarioForm extends React.Component {
  componentDidMount() {
    const { idPerfil, tipoUsuario, email, contrasena } = this.props;

    axios
      .post(
        "http://" + ipMaquina + ":3001/api/procedures/getAcuerdosConUsuarios",
        {
          idPerfil: idPerfil,
          tipoUsuario: tipoUsuario,
          estadoAcuerdo: 1,
          email,
          contrasena,
        }
      )
      .then((acuerdos) => {
        this.setState(
          {
            jsonEventos: acuerdos.data,
            isLoading: false,
          },
          () => {
            this.handleOnRangeChange(this.getActualWeekDays());
          }
        );
      })
      .catch((err) => {
        //TODO gestionar error
      });
  }
  constructor(props) {
    super(props);

    this.state = {
      jsonEventos: [],
      displayEventos: [],
      isLoading: true,
    };
  }

  changeMomentLang = (lang) => {
    switch (lang) {
      case "es":
        moment.lang("es", {
          months: "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
            "_"
          ),
          monthsShort: "Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.".split(
            "_"
          ),
          weekdays: "Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado".split(
            "_"
          ),
          weekdaysShort: "Dom._Lun._Mar._Mier._Jue._Vier._Sab.".split("_"),
          weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),
        });
        break;
      case "eus":
        moment.lang("eus", {
          months: "Urtarrilla_Otsaila_Martxoa_Apirila_Maiatza_Ekaina_Uztaila_Abuztua_Iraila_Urria_Azaroa_Abendua".split(
            "_"
          ),
          monthsShort: "Urt._Ots._Mar._Api._Mai._Eka._Uzt._Abu._Ira._Urr._Aza._Abe.".split(
            "_"
          ),
          weekdays: "Igandea_Astelehena_Asteartea_Asteazkena_Osteguna_Ostirala_Larunbata".split(
            "_"
          ),
          weekdaysShort: "Iga._Al._Ar._Az._Og._Ol._Lar.".split("_"),
          weekdaysMin: "Ig_Al_Ar_Ar_Og_Ol_La".split("_"),
        });
        break;
      default:
        moment.lang("eus", {
          months: "Urtarrilla_Otsaila_Martxoa_Apirila_Maiatza_Ekaina_Uztaila_Abuztua_Iraila_Urria_Azaroa_Abendua".split(
            "_"
          ),
          monthsShort: "Urt._Ots._Mar._Api._Mai._Eka._Uzt._Abu._Ira._Urr._Aza._Abe.".split(
            "_"
          ),
          weekdays: "Igandea_Astelehena_Asteartea_Asteazkena_Osteguna_Ostirala_Larunbata".split(
            "_"
          ),
          weekdaysShort: "Iga._Al._Ar._Az._Og._Ol._Lar.".split("_"),
          weekdaysMin: "Ig_Al_Ar_Ar_Og_Ol_La".split("_"),
        });
    }
  };

  getActualWeekDays = () => {
    let days = [];
    let iDate = moment().subtract(moment().day(), "d");
    days.push(iDate.toDate());
    for (let i = 0; i < 6; i++) {
      iDate = moment(iDate).add(1, "d").toDate();
      days.push(iDate);
    }
    return days;
  };

  handleOnRangeChange = (dates) => {
    const { jsonEventos } = this.state;
    const { tipoUsuario } = this.props;
    const columnaLaOtraPersona =
      tipoUsuario == "Cliente" ? "idCuidador" : "idCliente";
    const jsonForCalendar = [];
    if (Array.isArray(dates)) {
      dates.forEach((date) => {
        jsonEventos.forEach((evento, indice) => {
          evento.diasAcordados.forEach((diaAcordado) => {
            const adaptarDia = diaAcordado.dia == 7 ? 0 : diaAcordado.dia;
            if (moment(date).day() == adaptarDia) {
              const horaInicio = diaAcordado.horaInicio.split(":");
              const horaFin = diaAcordado.horaFin.split(":");
              const fechaStart = moment(date)
                .set("hour", parseInt(horaInicio[0]))
                .set("minute", horaInicio[1])
                .toDate();
              const fechaFin = moment(date)
                .set("hour", parseInt(horaFin[0]))
                .set("minute", horaFin[1])
                .toDate();
              const eventoData = {
                id: indice,
                title:
                  evento[columnaLaOtraPersona].nombre +
                  " " +
                  evento[columnaLaOtraPersona].apellido1,
                start: fechaStart,
                end: fechaFin,
              };
              jsonForCalendar.push(eventoData);
            }
          });
        });
      });
    } else {
      for (
        let iDate = moment(dates.start);
        iDate.isBefore(moment(dates.end));
        iDate.add(1, "d")
      ) {
        jsonEventos.forEach((evento, indice) => {
          evento.diasAcordados.forEach((diaAcordado) => {
            const adaptarDia = diaAcordado.dia == 7 ? 0 : diaAcordado.dia;
            if (moment(iDate).day() == adaptarDia) {
              const horaInicio = diaAcordado.horaInicio.split(":");
              const horaFin = diaAcordado.horaFin.split(":");
              const fechaStart = moment(iDate)
                .set("hour", parseInt(horaInicio[0]))
                .set("minute", horaInicio[1])
                .toDate();
              const fechaFin = moment(iDate)
                .set("hour", parseInt(horaFin[0]))
                .set("minute", horaFin[1])
                .toDate();
              const eventoData = {
                id: indice,
                title:
                  evento[columnaLaOtraPersona].nombre +
                  " " +
                  evento[columnaLaOtraPersona].apellido1,
                start: fechaStart,
                end: fechaFin,
              };
              jsonForCalendar.push(eventoData);
            }
          });
        });
      }
    }

    this.setState({
      displayEventos: jsonForCalendar,
    });
  };

  render() {
    const { nowLang } = this.props;
    this.changeMomentLang(nowLang);
    const localizer = momentLocalizer(moment);
    const { isLoading, displayEventos } = this.state;
    return isLoading ? (
      <div
        style={{
          height: "calc(100vh - 80px)",
        }}
        className="d-flex align-items-center justify-content-center"
      >
        <ClipLoader color="#28a745" />
      </div>
    ) : (
      <Calendar
        views={["week", "day", "agenda"]}
        defaultView={"week"}
        localizer={localizer}
        events={displayEventos}
        onRangeChange={this.handleOnRangeChange}
      />
    );
  }
}

export default connect(mapStateToProps, null)(CalendarioForm);
