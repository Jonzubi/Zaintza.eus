var mongoose = require("mongoose");

module.exports = mongoose.createConnection("mongodb+srv://admin:<admin>@jonzubicloud-7eg52.azure.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true});