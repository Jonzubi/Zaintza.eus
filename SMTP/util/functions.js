const fs =require("fs");
const templatesFolder = __dirname.substring(0, __dirname.lastIndexOf("\\")) + "\\templates\\";
module.exports = readHTMLFile = (fileName, callback) => {
    fs.readFile(templatesFolder + fileName + ".html", {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};