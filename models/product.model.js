const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }, 
    image: {
        type: String
    },
    sold: {
        type: Number,
        default: 0
    },
    ratingAverage: {
        type: Number,
        default: 0
    },
    totalQuantity: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);