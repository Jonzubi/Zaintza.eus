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
    let auxJsonEventos = [];

    axios
      .get("http://" + ipMaquina + ":3001/acuerdo", {
        params: {
          filtros: {
            $or: [{ idCuidador: idPerfil }, { idCliente: idPerfil }]
          }
        }
      })
      .then(eventos => {
        for (let i = 0; i < eventos.data.length; i++) {
          let evento = eventos.data[i];
          const tablaLaOtraPersona =
            tipoUsuario == "C" ? "cuidador" : "cliente";
          const idLaOtraPersona =
            tipoUsuario == "C" ? "idCuidador" : "idCliente";
          axios
            .get(
              "http://" +
                ipMaquina +
                ":3001/" +
                tablaLaOtraPersona +
                "/" +
                evento[idLaOtraPersona]
            )
            .then(laOtraPersona => {
              evento.laOtraPersona = laOtraPersona.data;
              auxJsonEventos.push(evento);

              if (i == eventos.data.length - 1) {
                this.setState({
                  jsonEventos: auxJsonEventos
                });
              }
            });
        }
      });
  }
  constructor(props) {
    super(props);

    this.state = {
      jsonEventos: []
    };
  }

  addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
  }

  getEventsJson() {
    let jsonForCalendar=[];
    const cuantosEventosMostrar = 30;
    let fecha = new Date();
    
    for (let i = 0; i < cuantosEventosMostrar; i++) {
        let dia = fecha.getDay();
        this.state.jsonEventos.forEach((evento, indice) => {
          evento.diasAcordados.forEach((diaAcordado) => {
            if(dia == diaAcordado.dia){
              let fechaStart = new Date(fecha);
              console.log(diaAcordado.horaInicio);
              fechaStart.setHours(parseInt(diaAcordado.horaInicio.split(":")[0]), parseInt(diaAcordado.horaInicio.split(":")[1]));
              console.log(fechaStart.getHours());
              let fechaEnd = new Date(fecha);
              fechaEnd.setHours(parseInt(diaAcordado.horaFin.split(":")[0]), parseInt(diaAcordado.horaFin.split(":")[1]));
              let eventoData = {
                id: indice,
                title: evento.laOtraPersona.nombre + " " + evento.laOtraPersona.apellido1,
                start: fechaStart,
                end: fechaEnd
              }
              jsonForCalendar.push(eventoData);
            }
          });
          fecha = this.addDays(fecha,1);
        });
    }
    
    return jsonForCalendar;
  }

  render() {
    const localizer = momentLocalizer(moment);
    return <Calendar defaultView={'week'} localizer={localizer} events={this.getEventsJson()} />;
  }
}

export default connect(mapStateToProps, null)(CalendarioForm);
