const mongoose = require('mongoose');
module.exports = (conexion) => {
    const Schema = mongoose.Schema;

    const anuncio = new Schema({
        direcFoto: String,
        titulo: {
            type: String,
            required: true
        },
        descripcion: {
            type: String,
            required: true
        },
        horario: [Map],
        pueblo: {
            type: String,
            required: true
        },
        tipoPublico: {
            type: String,
            required: true
        },
        precio: String
    });

    return conexion.model("Anuncio", anuncio, "Anuncios");
}