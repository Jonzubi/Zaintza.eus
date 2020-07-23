import React from "react";
import ImageUploader from "react-images-upload";
import { trans } from "../util/funciones";
import i18next from 'i18next';
import cogoToast from "cogo-toast";

class ContactImageUploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgContact: null,
    };
  }

  onChangeContactImg = (picture) => {
    const { onImageChoose } = this.props;
    if (Array.isArray(picture) && picture[0] === undefined) {
      cogoToast.error(<h5>{trans("commonErrors.tooBigImage")}</h5>);
      return;
    }

    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgContact: picture,
    });

    onImageChoose(picture);
  };

  render() {
    const { imgContact } = this.state;
    const { hasError } = this.props;
    return (
      <ImageUploader
        fileContainerStyle={
          imgContact != null
            ? { background: "#28a745" }
            : hasError
            ? { background: "#dc3545" }
            : {}
        }
        buttonClassName={imgContact != null ? "bg-light text-dark" : ""}
        errorClass="bg-danger text-light"
        fileSizeError={i18next.t('commmonErrors.tooBig')}
        fileTypeError={i18next.t('commonErrors.wrongFormat')}
        singleImage
        label={
          imgContact != null
            ? `${i18next.t('customImageUploader.maxMegaBytes')} | ` +
              imgContact[0].name +
              " (" +
              (imgContact[0].size / 1024 / 1024).toFixed(2) +
              " MB)"
            : `${i18next.t('customImageUploader.maxMegaBytes')} | ${i18next.t('customImageUploader.suggestedDimension')}`
        }
        labelClass={imgContact != null ? "text-light font-weight-bold" : ""}
        withIcon={true}
        buttonText={
          imgContact != null
            ? i18next.t('customImageUploader.chooseAnotherImage')
            : i18next.t('customImageUploader.chooseContactImage')
        }
        onChange={this.onChangeContactImg}
        imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
        maxFileSize={10485760}
      />
    );
  }
}

export default ContactImageUploader;
