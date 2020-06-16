const { readFileSync } = require("fs-extra");

const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    ID: {
        type: String,
        required: true
    },
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderByNoAccount: {
        type: String
    },
    cart: {
        type: Array
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);