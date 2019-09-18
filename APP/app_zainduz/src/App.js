import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
const ipMaquina = require("./ipMaquina");

function App() {
  var json = {
    idCuidador : 1,
    nombre : "Iraitz"
  };
  var res;

  var xhr = new XMLHttpRequest();

  $.ajax({
    type: "get",
    url: "http://"+ipMaquina + ":3001/insertRow/cuidador",
    data: JSON.stringify(json),
    dataType: "json",
    success: function (response) {
      res=response;
    }
  });

  return (
    res
  );
}

export default App;
