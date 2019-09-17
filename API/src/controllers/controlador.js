exports.inicio = function(req,res){
    var cuid = require("../models/cuidador");

    var vCuid = new cuid({
        id : 1,
        nombre : "Jon",
        apellido : "Zubi"
    });

    vCuid.save().then((doc) => {
        res.send("<h1>Cuidadora guardado</h1><p>{doc}</p>");
    }).catch(err => {
        console.log(err);
    });
}

exports.insertRow = function(req,res){
    console.log(req);
    var tabla = req.params.tabla;
    var modelo = require("../models/"+tabla);

    //TODO recorrer req.body para cargar dinamicamente lo que se va a insertar
    //De esta forma se va a hacer cualquier insert en una funcion.
    modeloConfig;

}

exports.getAll = function(req,res){
    var tabla = req.params.tabla;
}