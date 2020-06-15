const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }, 
    phone: {
        type: String,
        required: true
    },
    cart: {
        type: Array
    },
    admin: {
        type: Number
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);