module.exports = conexion => {
    const Schema = conexion.Schema;

    const resetPasswordRequest = new Schema({
        email: {
            type: String,
            required: true
        },
        fechaRequest: {
            type: Date,
            default: Date.now()
        },
        validationToken: {
            type: String,
            required: true
        }
    });

    return conexion.model("ResetPasswordRequest", resetPasswordRequest, "ResetPasswordRequests");
}