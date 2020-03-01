import React from "react";

class AjustesForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    return (
      <div className="p-5">
        <div className="row">
          <ul class="nav flex-column col-3">
            <li class="nav-item">
              <div class="nav-link btn btn-success">Perfil</div>
            </li>
          </ul>
          <div className="col-9 flex-column">
            <h1>Perfil</h1>
            <hr />
            <h5>Contraseña</h5>
            <hr />
            <div className="">
                <div className="row">
                    <span className="col-3">Contraseña actual:</span>
                    <input placeholder="Contraseña actual" type="text" className="col-9" />
                </div><br /><br />
                <div className="row">
                    <span className="col-3">Nueva contraseña:</span>
                    <input placeholder="Nueva contraseña" type="text" className="col-9" />
                </div><br /><br />
                <div className="row">
                    <span className="col-3">Repetir nueva contraseña:</span>
                    <input placeholder="Repetir nueva contraseña" type="text" className="col-9" />
                </div>
                <br />
                <div className="d-flex justify-content-end">
                    <div className="btn btn-success">
                        Cambiar contraseña
                    </div>
                </div>
                
              <hr />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AjustesForm;
