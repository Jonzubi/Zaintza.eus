exports.insertRow = function(req,res){
    var tabla = req.params.tabla;
    var modelo = require("../models/" + tabla);

    if(typeof modelo == "undefined")
        res.send("MODELO IS UNDEFINED");

    //TODO recorrer req.body para cargar dinamicamente lo que se va a insertar
    //De esta forma se va a hacer cualquier insert en una funcion.
    var modeloConfiged = new modelo(req.body);
    console.log(modeloConfiged);
    console.log(req.body);   

    //TODO guardar la instancia del modelo configurado con los datos que han venido
    modeloConfiged.save().then((doc) => {
        res.send("Guardado <br/><p>" + doc + "</p>");
    });
}

exports.getAll = function(req,res){
    var tabla = req.params.tabla;    
    var modelo = require("../models/" + tabla);

    modelo.find().then((doc) => {
        res.send(doc);
    }).catch((err) => {
        res.send(err);
    });
}