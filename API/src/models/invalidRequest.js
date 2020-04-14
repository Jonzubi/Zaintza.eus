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
        requestMethod: {
            type: String,
            required: true
        },
        requestParams: Object,
        requestQuery: Object,
        requestBody: Object,
        errorMsg: {
            type: String
        },
        date: Date
    });

    return conexion.model("InvalidRequest", invalidRequest, "InvalidRequest")
}