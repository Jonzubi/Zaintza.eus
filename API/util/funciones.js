const fs = require("fs");
exports.writeImage = (cod, b64) => {
  let idImage = cod;
  let imageBase64 = b64.split(",")[1];
  let formatBase64 = imageBase64.charAt(0);

  switch (formatBase64) {
    case "/":
      formatBase64 = ".jpg";
      break;
    case "i":
      formatBase64 = ".png";
      break;
    case "R":
      formatBase64 = ".gif";
      break;
    default:
      throw "Formato no compatible";
  }
  let avatarDirPath = __dirname + "/imagenes/" +
    idImage +
    formatBase64;
  //avatarDirPath = "/var/www/ProyectoAplicacionWeb/API/util/imagenes/" + idImage + formatBase64;

  try {
    fs.writeFileSync(avatarDirPath, imageBase64, "base64");
  } catch (error) {
      throw error;
  }
};

exports.getRandomString = length => {
    if(!length){
      throw "Elige length";
    }
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
