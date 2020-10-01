module.exports = (conexion) => {
    const Schema = conexion.Schema;

    const modeloConexion = Schema({
        ip: {
            type: String,
            required: true
        },
        fechaConexion: {
            type: Date,
            required: true,
            default: Date.now()
        },
        socketId: {
            type: String,
            required: true
        },
        inOut: {
            type: String,
            required: true,
            enum: ['IN', 'OUT'] //In para conexion OUT para desconexion
        }
    });

    return conexion.model("Conexion", modeloConexion, "Conexiones");
}