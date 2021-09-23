const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    journal: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Post', postSchema);