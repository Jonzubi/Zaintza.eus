module.exports = (conexion) => {
    const Schema = conexion.Schema;

    const anuncio = new Schema({
        idCliente: {
            type: String,
            required: true
        },
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
        publico: {
            type: String,
            required: true
        },
        precio: String
    });

    return conexion.model("Anuncio", anuncio, "Anuncios");
}