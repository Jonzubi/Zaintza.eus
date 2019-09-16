var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/myappdatabase");

exports.inicio = function(req,res){
    res.send("<h1>Inicio</h1>");
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