module.exports = function(app) {
    app.use("/templates", require('./templates'));
    app.use("/fill-template", require('./fillTemplate'));
    app.use("/registries", require('./registries'));
    app.use("/users", require('./users'));
};