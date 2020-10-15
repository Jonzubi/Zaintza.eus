module.exports = (conexion) => {
    const Schema = conexion.Schema;

    const modeloLogin = Schema({
        idUsuario: {
            type: String,
            required: true
        },
        fechaLogin: {
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
            enum: ['IN', 'OUT'] //In para login OUT para logout
        }
    });

    return conexion.model("Login", modeloLogin, "Logins");
}