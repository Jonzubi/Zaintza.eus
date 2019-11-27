import React from "react";
import Avatar from "react-avatar-edit";
import cogoToast from "cogo-toast";
import {t} from "../util/funciones";

class RegisterFormCliente extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      avatarSrc: ""
    }

    this.onClose= this.onClose.bind(this);
    this.onCrop= this.onCrop.bind(this);
    this.onBeforeFileLoad= this.onBeforeFileLoad.bind(this);
  }
  
  onClose() {
    this.setState({ avatarPreview: "" });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 5242880) {
    cogoToast.error(<h5>{t('registerFormCuidadores.errorImgGrande')}</h5>);
      elem.target.value = "";
    }
  }


  render() {
    return (
      <div
        className="border border-dark rounded p-5"
        style={{ margin: "10rem", marginTop: "5rem" }}
      >
        <div className="form-group d-flex justify-content-center position-relative">
          <Avatar
            label="Aukeratu avatarra"
            labelStyle={{
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
              height: "100%"
            }}
            height={200}
            width={200}
            onCrop={this.onCrop}
            onClose={this.onClose}
            onBeforeFileLoad={this.onBeforeFileLoad}
            src={this.state.avatarSrc}
          />
        </div>
      </div>
    );
  }
}

export default RegisterFormCliente;
