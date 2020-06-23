const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    ggid: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    address: {
        type: String
    }, 
    phone: {
        type: String
    },
    cart: {
        type: Array
    },
    admin: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);