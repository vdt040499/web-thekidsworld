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
    receiver: {
        type: String
    },
    cart: {
        type: Array
    },
    status: {
        type: String,
        default: "Processing"
    },
    date: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Number
    }
});

module.exports = mongoose.model('Order', orderSchema);