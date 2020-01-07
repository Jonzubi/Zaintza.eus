import React from "react";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { connect } from "react-redux";
import { t } from "../util/funciones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCircle } from "@fortawesome/free-solid-svg-icons";

const mapStateToProps = state => {
  return {
    idUsuario: state.user._idUsuario,
    tipoUsuario: state.user.tipoUsuario
  };
};

class NotificacionesForm extends React.Component {
  componentDidMount() {
      let jsonNotificaciones=[];
    axios
      .get("http://" + ipMaquina + ":3001/notificacion", {
        params: {
          filtros: {
            idUsuario: this.props.idUsuario
          }
        }
      })
      .then(notificaciones => {
        for (let i = 0; i < notificaciones.data.length; i++) {
            const notificacion = notificaciones.data[i];
            
        }
        this.setState({
          jsonNotificaciones: notificaciones.data
        });
      });
  }
  constructor(props) {
    super(props);

    this.state = {
      jsonNotificaciones: [],
      notificacionesCollapseState: []
    };
  }

  render() {
    return (
      <div className="p-5">
        {this.state.jsonNotificaciones.map((notificacion, indice) => {
          return (
            <div className="w-100 card">
              <div className="card-header">
                <div className="row">
                  <div className="col-11 text-center">
                    {notificacion.tipoNotificacion == "Acuerdo"
                      ? t("notificacionesForm.propuestaAcuerdo")
                      : null}
                  </div>
                  <div className="col-1 text-center my-auto">
                    <FontAwesomeIcon
                      style={{ cursor: "pointer" }}
                      size="2x"
                      icon={faCaretDown}
                      className=""
                      onClick={() =>
                        this.handleToogleCollapseNotificacion(indice)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(NotificacionesForm);
