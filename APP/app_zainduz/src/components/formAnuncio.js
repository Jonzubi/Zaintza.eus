import React from "react";
import cogoToast from "cogo-toast";
import { trans } from "../util/funciones";
import ImageUploader from "react-images-upload";
import i18next from "i18next";

class FormAnuncio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imgContact: null,
      txtTitulo: "",
      txtDescripcion: "",
      error: false
    };

    this.onClose = this.onClose.bind(this);
    this.onCrop = this.onCrop.bind(this);
    this.onChangeContactImg = this.onChangeContactImg.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  onClose() {
    this.setState({ avatarPreview: "" });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(<h5>{trans("registerFormClientes.errorImgGrande")}</h5>);
      elem.target.value = "";
    }
  }

  onChangeContactImg(picture) {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgContact: picture
    });
  }

  handleInputChange(e) {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    var stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    this.setState({
      [stateId]: e.target.value
    });
  }

  render() {
    return (
      <div className="p-5">
        <div className="form-group d-flex justify-content-center position-relative">
          <ImageUploader
            fileContainerStyle={
              this.state.imgContact != null ? { background: "#28a745" } : {}
            }
            buttonClassName={
              this.state.imgContact != null ? "bg-light text-dark" : ""
            }
            errorClass="bg-danger text-light"
            fileSizeError="handiegia da"
            fileTypeError="ez du formatu zuzena"
            singleImage={true}
            label={
              this.state.imgContact != null
                ? "Gehienez: 5MB | " +
                  this.state.imgContact[0].name +
                  " (" +
                  (this.state.imgContact[0].size / 1024 / 1024).toFixed(2) +
                  " MB)"
                : "Gehienez: 5MB | Gomendaturiko dimentsioa (288x300)"
            }
            labelClass={
              this.state.imgContact != null ? "text-light font-weight-bold" : ""
            }
            withIcon={true}
            buttonText={
              this.state.imgContact != null
                ? i18next.t("formAnuncio.eligeOtraFoto")
                : i18next.t("formAnuncio.eligeUnaFoto")
            }
            onChange={this.onChangeContactImg}
            imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
            maxFileSize={5242880}
          />
        </div>
        <div className="form-group row">
          <div className="col-12">
            <label htmlFor="txtTitulo">{trans("formAnuncio.titulo")}</label> (
            <span className="text-danger font-weight-bold">*</span>)
            <input
              onChange={this.handleInputChange}
              type="text"
              className={
                this.state.error
                  ? "border border-danger form-control"
                  : "form-control"
              }
              id="txtTitulo"
              aria-describedby="txtNombreHelp"
              placeholder="Izenburua..."
              value={this.state.txtTitulo}
            />
          </div>
        </div>
        <div class="form-group">
          <label htmlFor="txtDescripcion">
            {trans("formAnuncio.descripcion")}
          </label>{" "}
          (<span className="text-danger font-weight-bold">*</span>)
          <textarea
            onChange={this.handleInputChange}
            class={
              this.state.error
                ? "border border-danger form-control"
                : "form-control"
            }
            rows="5"
            id="txtDescripcion"
            placeholder="Tu descripcion..."
            value={this.state.txtDescripcion}
          ></textarea>
        </div>
        
      </div>
    );
  }
}

export default FormAnuncio;
