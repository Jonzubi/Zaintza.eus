var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/zainduz', {useNewUrlParser: true});

module.exports = mongoose;