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

  exports.getTodayDate = () => {
    var objToday = new Date();
    var dd = objToday.getDate();
    var mm = objToday.getMonth() + 1;
  
    var yyyy = objToday.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    var today = mm + "/" + dd + "/" + yyyy;
    return today;
  };

  exports.caesarShift = (str, amount) => {

    // Wrap the amount
    if (amount < 0)
      return caesarShift(str, amount + 26);
  
    // Make an output variable
    var output = '';
  
    // Go through each character
    for (var i = 0; i < str.length; i ++) {
  
      // Get the character we'll be appending
      var c = str[i];
  
      // If it's a letter...
      if (c.match(/[a-z]/i)) {
  
        // Get its code
        var code = str.charCodeAt(i);
  
        // Uppercase letters
        if ((code >= 65) && (code <= 90))
          c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
  
        // Lowercase letters
        else if ((code >= 97) && (code <= 122))
          c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
  
      }
  
      // Append
      output += c;
  
    }
  
    // All done!
    return output;
  
  };
