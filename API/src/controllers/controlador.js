const headerResponse = require("../../util/headerResponse");

exports.insertRow = function(req,res){
    console.log("BEGIN INSERT ROW");
    var tabla = req.params.tabla;
    var modelo = require("../models/" + tabla);

    if(typeof modelo == "undefined")
        res.send("MODELO IS UNDEFINED");

    //TODO recorrer req.body para cargar dinamicamente lo que se va a insertar
    //De esta forma se va a hacer cualquier insert en una funcion.
    var modeloConfiged = new modelo(req.body);
    console.log(modeloConfiged);
    console.log(req);   
    console.log("insertando dato");
    //TODO guardar la instancia del modelo configurado con los datos que han venido
    modeloConfiged.save().then((doc) => {
        res.send("Guardado :" + doc);
    }).catch(err => {
        res.send(err);
    });
}

exports.getAll = function(req,res){
    var tabla = req.params.tabla;    
    var modelo = require("../models/" + tabla);
    res.writeHead(200,headerResponse);

    modelo.find().then((doc) => {
        res.write(doc);
    }).catch((err) => {
        res.write(err);
    });

    res.end();
}

//Funcion para ver si el server esta en linea
exports.inicio = function(req,res){
    console.log("Solicitud recibida");
    res.writeHead(200,headerResponse);
    res.write("Solicitud recibida");
    res.end();
}