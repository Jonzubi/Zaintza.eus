module.exports = (conexion) => {
    const Schema = conexion.Schema;

    const anuncioVisita = new Schema({
        idAnuncio: {
            type: String,
            required: true,
            ref: 'Anuncio'
        },
        idUsuario: {
            type:String,
            required: true,
            ref: 'Usuario'
        },
        fechaVisto: {
            type: Date,
            required: true
        }
    });

    return conexion.model("AnuncioVisita", anuncioVisita, "AnuncioVisitas");
}