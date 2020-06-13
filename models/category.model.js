const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    level: {
        type: Number,
        required: true
    },

    prelevel: {
        type: String,
        require: true
    },

    slug: {
        type: String
    }
});

module.exports = mongoose.model('Category', categorySchema);
