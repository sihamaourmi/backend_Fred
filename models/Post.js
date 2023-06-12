const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    sujet : {type: 'String'},
    auteur : {type: 'String'},
    description : {type: 'String'}
})

module.exports = mongoose.model('Post', postSchema);