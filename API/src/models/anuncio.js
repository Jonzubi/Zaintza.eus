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
            type: [{
                dia: String,
                horaInicio: String,
                horaFin: String
            }],
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
        precio: String,
        show: {
            type: Boolean,
            required: true,
            default: true
        }
    });

    return conexion.model("Anuncio", anuncio, "Anuncios");
}