const mongoose = require('mongoose');

const rateSchema = mongoose.Schema({
    rateBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rateIn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    rate: {
        type: Number
    },
    comment: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Rate', rateSchema);