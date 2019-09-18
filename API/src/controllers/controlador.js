exports.inicio = function(req,res){
}

exports.insertRow = function(req,res){
    console.log(req);
    var tabla = req.params.tabla;
    var modelo = require("../models/" + tabla);

    //TODO recorrer req.body para cargar dinamicamente lo que se va a insertar
    //De esta forma se va a hacer cualquier insert en una funcion.
    modeloConfiged;

    //TODO guardar la instancia del modelo configurado con los datos que han venido

}

exports.getAll = function(req,res){
    var tabla = req.params.tabla;
}