module.exports = (conexion) => {
    const Schema = conexion.Schema;

    const invalidRequest = new Schema({
        errorCode: {
            type: Number,
            required: true
        },
        ipAddress: {
            type: String,
            required: true
        },
        errorMsg: {
            type: String
        }
    });

    return conexion.model("InvalidRequest", invalidRequest, "InvalidRequest")
}