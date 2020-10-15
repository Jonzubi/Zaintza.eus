module.exports = (conexion) => {
    const Schema = conexion.Schema;

    const cuidadorVisita = new Schema({
        idCuidador: {
            type: String,
            required: true,
            ref: 'Cuidador'
        },
        idUsuario: {
            type:String,
            ref: 'Usuario'
        },
        fechaVisto: {
            type: Date,
            required: true
        }
    });

    return conexion.model("cuidadorVisita", cuidadorVisita, "CuidadorVisitas");
}