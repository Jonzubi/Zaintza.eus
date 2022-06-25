module.exports = (conexion) => {
    const Schema = conexion.Schema;

    const ajuste = new Schema({
        idUsuario: {
            type: String,
            required: true,
            ref: 'Usuario'
        },
        idLangPred: {
            type: String,
            default: 'eus'
        },
        maxDistance: {
            type: Number,
            default: 30
        }
    });

    return conexion.model("Ajuste", ajuste, "Ajustes")
}