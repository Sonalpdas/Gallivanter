const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema({   
    postID:{
        type: String
    }
})

module.exports = mongoose.model('Favorites', favoriteSchema)