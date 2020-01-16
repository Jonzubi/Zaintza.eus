import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { connect } from "react-redux";
import ipMaquina from "../util/ipMaquinaAPI";
import axios from "axios";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const mapStateToProps = state => {
  return {
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario
  };
};

class CalendarioForm extends React.Component {
  componentDidMount() {
    const { idPerfil, tipoUsuario } = this.props;

    axios
      .get(
        "http://" + ipMaquina + ":3001/api/procedures/getAcuerdosConUsuarios",
        {
          params: {
            idPerfil: idPerfil,
            tipoUsuario: tipoUsuario,
            estadoAcuerdo: 1
          }
        }
      )
      .then(acuerdos => {
        this.setState({
          jsonEventos: acuerdos.data,
          isLoading: false
        });
      })
      .catch(err => {
        //TODO gestionar error
      });
  }
  constructor(props) {
    super(props);

    this.state = {
      jsonEventos: [],
      isLoading: true
    };
  }

  addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(date.getDate() + days);
    return copy;
  }

  getEventsJson() {
    let jsonForCalendar = [];
    const { tipoUsuario } = this.props;
    const columnaLaOtraPersona =
      tipoUsuario == "Cliente" ? "idCuidador" : "idCliente";
    const cuantosDiasDeEventosMostrar = 10;
    let fecha = new Date();
    for (let i = 0; i < cuantosDiasDeEventosMostrar; i++) {
      let dia = fecha.getDay();
      this.state.jsonEventos.forEach((evento, indice) => {
        evento.diasAcordados.forEach(diaAcordado => {
          //La siguiente linea adapta el dia para compararlo con el dia del getDay(). Ya que la clase Date devuelve un 0 si es Domingo. En mi base de datos Domingo es 7
          const adaptarDia = diaAcordado.dia == 7 ? 0 : diaAcordado.dia;
          if (dia == adaptarDia) {
            let fechaStart = new Date(fecha.getTime());
            fechaStart.setHours(
              parseInt(diaAcordado.horaInicio.split(":")[0]),
              parseInt(diaAcordado.horaInicio.split(":")[1])
            );
            let fechaEnd = new Date(fecha.getTime());
            fechaEnd.setHours(
              parseInt(diaAcordado.horaFin.split(":")[0]),
              parseInt(diaAcordado.horaFin.split(":")[1])
            );
            let eventoData = {
              id: indice,
              title:
                evento[columnaLaOtraPersona].nombre +
                " " +
                evento[columnaLaOtraPersona].apellido1,
              start: fechaStart,
              end: fechaEnd
            };
            jsonForCalendar.push(eventoData);
          }
        });
      });
      fecha = this.addDays(fecha, 1);
    }

    return jsonForCalendar;
  }

  render() {
    const localizer = momentLocalizer(moment);
    const { isLoading } = this.state;
    return isLoading ? (
      <div className="row mt-3 justify-content-center">
        <img
          src={"http://" + ipMaquina + ":3001/api/image/loadGif"}
          height={50}
          width={50}
        />
      </div>
    ) : (
      <Calendar
        views={["week", "day", "agenda"]}
        defaultView={"week"}
        localizer={localizer}
        events={this.getEventsJson()}
      />
    );
  }
}

export default connect(mapStateToProps, null)(CalendarioForm);
