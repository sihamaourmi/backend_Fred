const mongoose = require('mongoose');

const filmSchema = mongoose.Schema({
    nom : {type : 'String'},
    date : {type : 'String'},
    realisateur : {type : 'String'},
    genre : {type : 'String'},
})

module.exports = mongoose.model('Film', filmSchema);