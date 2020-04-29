module.exports = (conexion) => {
    const Schema = conexion.Schema;

    const anuncio = new Schema({
        idCliente: {
            type: String,
            required: true,
            ref: 'Cliente'
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
        horario: {
            type: [Map],
            required: true
        },
        pueblo: {
            type: [String],
            required: true
        },
        publico: {
            type: String,
            required: true,
            enum: ['ninos', 'terceraEdad', 'necesidadEspecial']
        },
        precio: String
    });

    return conexion.model("Anuncio", anuncio, "Anuncios");
}