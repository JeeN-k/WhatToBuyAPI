const mongoose = require('mongoose');


const ProductListSchema = mongoose.Schema({
    name: String,
    color: String,
    icon: String,
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    guests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})

module.exports = mongoose.model('ProductList', ProductListSchema)